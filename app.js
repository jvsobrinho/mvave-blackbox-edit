class MvaveBLEEditor {
    constructor() {
        this.SERVICE_UUID = "0000ae40-0000-1000-8000-00805f9b34fb";
        this.WRITE_CHAR_UUID = "0000ae41-0000-1000-8000-00805f9b34fb"; 
        this.NOTIFY_CHAR_UUID = "0000ae42-0000-1000-8000-00805f9b34fb"; 

        this.BLOCKS = {
            0: { id: 'fx', label: 'FX', toggleAddr: 0x08, modelAddr: 0x0E, knobStart: 0x14, isDynamic: true, modelNames: ['Noise Gate++', 'Boost', 'Compress', 'AI Gate MS'], params: { 0: ['Gate', 'Ghost', 'Ghost', 'Ghost', 'Ghost', 'Ghost'], 1: ['Gate', 'Gain', 'Ghost', 'Ghost', 'Ghost', 'Ghost'], 2: ['Gate', 'Sustain', 'Attack', 'Level', 'Ghost', 'Ghost'], 3: ['Gate', 'Bias', 'Ghost', 'Ghost', 'Ghost', 'Ghost'] } },
            1: { id: 'amp', label: 'AMP', toggleAddr: 0x09, modelAddr: 0x0F, knobStart: 0x20, isDynamic: false, modelNames: Array.from({ length: 20 }, (_, i) => `Amp Model ${i + 1}`), params: ['Gain', 'Level', 'Bass', 'Mid', 'Treble', 'Ghost'] },
            2: { id: 'mod', label: 'MOD', toggleAddr: 0x0A, modelAddr: 0x10, knobStart: 0x2C, isDynamic: true, modelNames: ['Chorus', 'Phaser', 'Tremolo', 'Flanger', 'Vibrato', 'Univibe', 'Autofilter'], params: { 0: ['Speed', 'Depth', 'Mix', 'Ghost', 'Ghost', 'Ghost'], 1: ['Speed', 'Midcut', 'Reso', 'Feedback', 'Ghost', 'Ghost'], 2: ['Speed', 'Depth', 'Level', 'Ghost', 'Ghost', 'Ghost'], 3: ['Speed', 'Depth', 'Feedback', 'Mix', 'Ghost', 'Ghost'], 4: ['Speed', 'Depth', 'Ghost', 'Ghost', 'Ghost', 'Ghost'], 5: ['Speed', 'Depth', 'Mix', 'Ghost', 'Ghost', 'Ghost'], 6: ['Speed', 'Min', 'Max', 'Mix', 'Feedback', 'Ghost'] } },
            3: { id: 'dly', label: 'DLY', toggleAddr: 0x0B, modelAddr: 0x11, knobStart: 0x38, isDynamic: true, modelNames: ['Analog', 'Duck', 'Dtape', 'Dual', 'Lofi'], params: { 0: ['Time', 'Feedback', 'Mix', 'Phaser', 'Pitch', 'Ghost'], 1: ['Time', 'Feedback', 'Mix', 'Unpack', 'Speed', 'Depth'], 2: ['Time', 'Feedback', 'Mix', 'Grit', 'Speed', 'Depth'], 3: ['Time', 'Feedback', 'Mix', 'T-Mode', 'Speed', 'Depth'], 4: ['Time', 'Feedback', 'Mix', 'Grit', 'Speed', 'Depth'] } },
            4: { id: 'rev', label: 'REV', toggleAddr: 0x0C, modelAddr: 0x12, knobStart: 0x44, isDynamic: true, modelNames: ['Room', 'Hall', 'Swell', 'Spring', 'Shimmer', 'Cloud'], params: { 0: ['Decay', 'Mix', 'High Pass', 'Low Pass', 'Depth', 'Ghost'], 1: ['Decay', 'Mix', 'High Pass', 'Low Pass', 'Depth', 'Ghost'], 2: ['Decay', 'Mix', 'High Pass', 'Low Pass', 'Rise-T', 'Ghost'], 3: ['Decay', 'Mix', 'High Pass', 'Low Pass', 'Combs', 'Ghost'], 4: ['Decay', 'Mix', 'Tone', 'Pitch', 'Amount', 'Ghost'], 5: ['Decay', 'Mix', 'High Pass', 'Low Pass', 'Diffusion', 'Ghost'] } },
            5: { id: 'cab', label: 'CAB', toggleAddr: 0x0D, modelAddr: 0x13, knobStart: 0x50, isDynamic: false, modelNames: Array.from({ length: 20 }, (_, i) => `Cab IR ${i + 1}`), params: ['Level', 'Low Cut', 'High Cut', 'Ghost', 'Ghost', 'Ghost'] }
        };

        this.pollingInterval = null;
        this.selectedBlockId = 1; 

        this.device = null;
        this.server = null;
        this.writeCharacteristic = null;
        this.notifyCharacteristic = null;
        this.isConnected = false;

        this.syncState = 'IDLE'; 
        this.rxBuffer = [];
        this.lastUiEditTime = 0;
        this.isModified = false;
        this.currentlyHoveredControl = null;
        this.isDragging = false;
        this.lastDumpHex = ""; // Keeps track of the last received state
        this.beatIntervalId = null;

        // Pre-populate offline state so the signal chain (and arrows) are visible immediately
        this.currentState = {
            volume: 50,
            routing: [0, 1, 2, 3, 4, 5],
            modulesOn: { fx: true, amp: true, mod: true, dly: true, rev: true, cab: true },
            models: { fx: 0, amp: 0, mod: 0, dly: 0, rev: 0, cab: 0 },
            knobs: {}
        };
        Object.keys(this.BLOCKS).forEach(key => {
            const block = this.BLOCKS[key];
            this.currentState.knobs[block.id] = {};
            for (let i = 0; i < 6; i++) {
                this.currentState.knobs[block.id][block.knobStart + (i * 2)] = 50;
            }
        });

        this.initLogPanel();
        this.initPresetControls();
        this.initRoutingDragAndDrop();
        this.initDoubleClickEdit();
        this.initScrollControls();
        
        this.renderSignalChain(false);
    }

    // =========================================================
    // UI Init Methods
    // =========================================================

    formatDisplayValue(blockId, paramName, value) {
        let val = parseInt(value, 10);
        if (blockId === 'cab') {
            if (paramName === 'Low Cut') return Math.round(20 + (val / 100) * 280) + 'Hz';
            if (paramName === 'High Cut') return (5.0 + (val / 100) * 13.0).toFixed(1) + 'kHz';
        }
        return val;
    }

    initLogPanel() {
        this.logPanel = document.getElementById('logPanel');
        this.logToggle = document.getElementById('logToggle');
        this.logContent = document.getElementById('logContent');
        
        document.getElementById('clearLogBtn')?.addEventListener('click', () => { if (this.logContent) this.logContent.innerHTML = ''; });
        document.getElementById('sendManualCommandBtn')?.addEventListener('click', () => this.sendManualCommand());
        
        if (this.logToggle) {
            this.logToggle.addEventListener('click', () => {
                const isVisible = this.logPanel.classList.toggle('visible');
                this.logToggle.textContent = isVisible ? 'Hide Log' : 'Show Log';
                this.logToggle.style.bottom = isVisible ? `${this.logPanel.offsetHeight + 10}px` : '10px';
            });
        }
    }

    initPresetControls() {
        const patchListContainer = document.getElementById('patchListContainer');
        const searchInput = document.getElementById('patchSearchInput');
        
        
        // Creates the sidebar list identical to the original editor
        if (patchListContainer) {
            for (let i = 0; i < 80; i++) {
                const item = document.createElement('div');
                item.className = 'patch-item';
                item.dataset.presetId = i;
                item.textContent = `P${(i + 1).toString().padStart(2, '0')}: Preset ${i + 1}`;
                item.addEventListener('click', async () => {
                    document.querySelectorAll('.patch-item').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    const patchNumEl = document.getElementById('patchNumber');
                    const patchNameEl = document.getElementById('patchName');
                    if (patchNumEl) patchNumEl.textContent = `P${(i + 1).toString().padStart(2, '0')}`;
                    if (patchNameEl) patchNameEl.textContent = `Preset ${i + 1}`;
                    await this.loadPreset(i);
                });
                patchListContainer.appendChild(item);
            }
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.patch-item').forEach(item => {
                    const match = item.textContent.toLowerCase().includes(term);
                    item.style.display = match ? 'block' : 'none';
                });
            });
        }
        
        // Global keyboard shortcut to hit Tap Tempo with the Space bar
        document.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            if (e.code === 'Space' && activeEl.tagName !== 'INPUT') {
                if (this.BLOCKS[this.selectedBlockId] && this.BLOCKS[this.selectedBlockId].id === 'dly') {
                    e.preventDefault();
                    const tapButton = document.getElementById('tap-button');
                    if (tapButton) {
                        tapButton.classList.add('beat-flash');
                        tapButton.click();
                        setTimeout(() => tapButton.classList.remove('beat-flash'), 100);
                    }
                }
            }
        });
        document.getElementById('savePresetBtn')?.addEventListener('click', () => this.saveCurrentPreset());
    }

    initDoubleClickEdit() {
        document.body.addEventListener('dblclick', event => {
            const targetSpan = event.target;
            if (!targetSpan.classList.contains('slider-value')) return;

            const slider = targetSpan.previousElementSibling;
            if (!slider || !slider.classList.contains('slider')) return;

            const blockId = slider.dataset.blockId;
            const paramName = slider.dataset.paramName;
            const currentSliderVal = parseInt(slider.value, 10);
            const currentRawVal = (blockId === 'cab' && paramName === 'High Cut') ? (100 - currentSliderVal) : currentSliderVal;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'slider-value-input';
            
            if (blockId === 'cab' && (paramName === 'Low Cut' || paramName === 'High Cut')) {
                input.value = parseFloat(this.formatDisplayValue(blockId, paramName, currentRawVal));
                input.step = paramName === 'High Cut' ? '0.1' : '1';
            } else {
                input.value = currentRawVal;
                input.min = slider.min;
                input.max = slider.max;
            }
            
            input.style.width = '45px';
            input.style.background = '#1e1e1e';
            input.style.color = '#ff6b35';
            input.style.border = '1px solid #ff6b35';

            targetSpan.replaceWith(input);
            input.focus();
            input.select();

            const finalizeEdit = () => {
                let inputVal = parseFloat(input.value);
                let newRawValue;
                
                if (isNaN(inputVal)) {
                    newRawValue = currentRawVal;
                } else if (blockId === 'cab' && paramName === 'Low Cut') {
                    newRawValue = Math.round(((inputVal - 20) / 280) * 100);
                    newRawValue = Math.max(0, Math.min(newRawValue, 100));
                } else if (blockId === 'cab' && paramName === 'High Cut') {
                    newRawValue = Math.round(((inputVal - 5.0) / 13.0) * 100);
                    newRawValue = Math.max(0, Math.min(newRawValue, 100));
                } else {
                    const sMin = parseFloat(slider.min) || 0;
                    const sMax = parseFloat(slider.max) || 100;
                    newRawValue = Math.max(sMin, Math.min(Math.round(inputVal), sMax));
                }
                
                let newSliderVal = (blockId === 'cab' && paramName === 'High Cut') ? (100 - newRawValue) : newRawValue;
                slider.value = newSliderVal;
                slider.style.setProperty('--progress', newSliderVal + '%');
                slider.dispatchEvent(new Event('change', { bubbles: true }));
                
                const newSpan = document.createElement('span');
                newSpan.className = 'slider-value';
                
                if (blockId && paramName) {
                    newSpan.textContent = this.formatDisplayValue(blockId, paramName, newRawValue);
                } else {
                    newSpan.textContent = newRawValue;
                }
                input.replaceWith(newSpan);
            };

            input.addEventListener('blur', finalizeEdit);
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') finalizeEdit();
                if (e.key === 'Escape') {
                    input.removeEventListener('blur', finalizeEdit);
                    const originalSpan = document.createElement('span');
                    originalSpan.className = 'slider-value';
                    originalSpan.textContent = targetSpan.textContent;
                    input.replaceWith(originalSpan);
                }
            });
        });
    }

    initScrollControls() {
        const triggerControlUpdate = (element) => {
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        };

        document.addEventListener('mouseover', (e) => {
            const validTarget = e.target.closest('.slider, .dropdown-select, .toggle-switch, .chain-module');
            if (validTarget && !validTarget.disabled && !validTarget.classList.contains('locked')) {
                this.currentlyHoveredControl = validTarget;
                const row = validTarget.closest('.control-row');
                if (row) row.classList.add('hover-focus');
                else if (validTarget.classList.contains('chain-module')) validTarget.classList.add('hover-focus');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (this.currentlyHoveredControl) {
                const relatedTarget = e.relatedTarget;
                if (!this.currentlyHoveredControl.contains(relatedTarget)) {
                    const row = this.currentlyHoveredControl.closest('.control-row');
                    if (row) row.classList.remove('hover-focus');
                    else if (this.currentlyHoveredControl.classList.contains('chain-module')) this.currentlyHoveredControl.classList.remove('hover-focus');
                    this.currentlyHoveredControl = null;
                }
            }
        });

        // Mouse Wheel (Scroll)
        document.addEventListener('wheel', (e) => {
            if (!this.currentlyHoveredControl) return;
            
            e.preventDefault(); // Prevents full page scroll
            const direction = e.deltaY > 0 ? -1 : 1; 

            this.handleScrollStep(direction, triggerControlUpdate);
        }, { passive: false }); 

        // Keyboard Arrows
        document.addEventListener('keydown', (e) => {
            if (!this.currentlyHoveredControl) return;
            if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'number') return;

            let direction = 0;
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') direction = 1;
            if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') direction = -1;

            if (direction !== 0) {
                e.preventDefault();
                this.handleScrollStep(direction, triggerControlUpdate);
            }
        });
    }

    handleScrollStep(direction, triggerControlUpdate) {
        if (this.currentlyHoveredControl.classList.contains('slider')) {
            const slider = this.currentlyHoveredControl;
            let step = parseFloat(slider.step) || 1;
            const min = parseFloat(slider.min) || 0;
            const max = parseFloat(slider.max) || 100;
            
            let newVal = parseFloat(slider.value) + (direction * step);

            if (newVal > max) newVal = max;
            if (newVal < min) newVal = min;

            const stepStr = String(step);
            const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
            newVal = parseFloat(newVal.toFixed(decimals));

            if (slider.value !== String(newVal)) {
                 slider.value = newVal;
                 triggerControlUpdate(slider);
            }
        } 
        else if (this.currentlyHoveredControl.classList.contains('dropdown-select')) {
            const select = this.currentlyHoveredControl;
            if (select.options.length === 0) return;

            let selectedIndex = select.selectedIndex - direction; 
            if (selectedIndex >= select.options.length) selectedIndex = select.options.length - 1;
            if (selectedIndex < 0) selectedIndex = 0;

            if (select.selectedIndex !== selectedIndex) {
                select.selectedIndex = selectedIndex;
                triggerControlUpdate(select);
            }
        } 
        else if (this.currentlyHoveredControl.classList.contains('toggle-switch') || this.currentlyHoveredControl.classList.contains('chain-module')) {
            const toggle = this.currentlyHoveredControl.classList.contains('chain-module') ? 
                this.currentlyHoveredControl.querySelector('.module-status') : this.currentlyHoveredControl;
            
            if (toggle) {
                // Prevents rapid multiple clicks from scrolling
                const now = Date.now();
                const lastFlip = parseInt(toggle.dataset.lastWheelFlip || "0");
                if (now - lastFlip > 200) { 
                     toggle.click(); 
                     toggle.dataset.lastWheelFlip = now;
                }
            }
        }
    }

    log(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        if (!this.logContent) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="log-time">${new Date().toLocaleTimeString()}</span><span class="log-type ${type === 'success' ? 'received' : type}">[${type.toUpperCase()}]</span><span class="log-message">${message}</span>`;
        this.logContent.appendChild(entry);
        this.logContent.scrollTop = this.logContent.scrollHeight;
    }

    // =========================================================
    // Checksum algorithm & Helpers
    // =========================================================

    calculateChecksum(payload) {
        let sum = 0;
        for (let i = 4; i < payload.length - 1; i++) sum += payload[i];
        return 0xFF - (sum % 256);
    }

    buildPacket(hexString) {
        let bytes = hexString.replace(/\s/g, '').match(/.{1,2}/g).map(byte => parseInt(byte, 16));
        let payload = new Uint8Array(bytes);
        payload[payload.length - 1] = this.calculateChecksum(payload);
        return payload;
    }

    async sendManualCommand() {
        const input = document.getElementById('manualCommandInput');
        const cmd = input?.value.trim();
        if (cmd && this.isConnected) {
            try {
                const bytes = cmd.replace(/\s/g, '').match(/.{1,2}/g).map(byte => parseInt(byte, 16));
                this.log(`Manual sent: ${cmd}`, 'sent');
                await this.writeCharacteristic.writeValueWithoutResponse(new Uint8Array(bytes));
                if (input) input.value = '';
            } catch (error) { this.log(`Error: ${error.message}`, 'error'); }
        }
    }

    // =========================================================
    // BLUETOOTH & HANDSHAKE
    // =========================================================

    async connect() {
        try {
            this.log("Searching for the BlackBox...", "info");
            this.device = await navigator.bluetooth.requestDevice({ filters: [{ namePrefix: 'BlackBox_BLE' }], optionalServices: [this.SERVICE_UUID] });
            this.device.addEventListener('gattserverdisconnected', () => this.handleDisconnect());

            this.server = await this.device.gatt.connect();
            const service = await this.server.getPrimaryService(this.SERVICE_UUID);

            this.writeCharacteristic = await service.getCharacteristic(this.WRITE_CHAR_UUID);
            this.notifyCharacteristic = await service.getCharacteristic(this.NOTIFY_CHAR_UUID);

            await this.notifyCharacteristic.startNotifications();
            this.notifyCharacteristic.addEventListener('characteristicvaluechanged', (e) => this.handleIncomingData(e));

            this.isConnected = true;
            this.updateUI();
            
            await this.startHandshake();

        } catch (error) { this.log(`Connection error: ${error.message}`, "error"); }
    }

    async disconnect() {
        if (this.device && this.device.gatt.connected) {
            await this.device.gatt.disconnect();
        }
    }

    handleDisconnect() {
        this.isConnected = false;
        this.syncState = 'IDLE';
        this.updateUI();
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        document.getElementById('loadingOverlay').style.display = 'none';
        
        // Reset workspace to locked state
        const workspace = document.getElementById('workspacePanel');
        if (workspace) {
            workspace.innerHTML = `<div class="effect-description" style="color: #555; margin-top: 50px; text-align: center;">Connect the device and click on a pedal block to edit its parameters.</div>`;
            delete workspace.dataset.activeBlock;
            delete workspace.dataset.activeModel;
        }
        
        this.renderSignalChain(false, true); // Force rebuild to show "Please sync"
        this.log("Disconnected from BlackBox.", "error");
    }

    async startHandshake() {
        this.syncState = 'READING_AMPS';
        this.rxBuffer = [];
        
        document.getElementById('loadingOverlay').style.display = 'flex';
        document.getElementById('loadingText').innerText = "Reading Amps...";
        
        this.log("Handshake: Requesting AMPs...", "sent");
        // AMPs address: 90 18
        await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket("00 59 23 08 00 00 05 00 00 00 90 18 01 00 00"));
    }

    async processHandshakeBlock() {
        const extractedNames = this.decodeNamesBlock(this.rxBuffer);

        if (extractedNames.length >= 20) {
            if (this.syncState === 'READING_AMPS') {
                this.BLOCKS[1].modelNames = extractedNames.slice(0, 20);
                this.syncState = 'READING_CABS';
                this.rxBuffer = [];
                document.getElementById('loadingText').innerText = "Reading Cabinets...";
                
                // CABs address: 80 18
                await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket("00 59 23 08 00 00 05 00 00 00 80 18 01 00 00"));
            }
            else if (this.syncState === 'READING_CABS') {
                this.BLOCKS[5].modelNames = extractedNames.slice(0, 20);
                this.syncState = 'READY';
                this.rxBuffer = [];
                document.getElementById('loadingOverlay').style.display = 'none';

                this.pollingInterval = setInterval(() => { 
                    if (this.isConnected) {
                        this.requestCurrentPresetId();
                        setTimeout(() => { if (this.isConnected) this.requestRamDump(); }, 250);
                    }
                }, 2500);
                await this.requestCurrentPresetId();
                await this.requestRamDump();
                this.log("Handshake Complete!", "success");
            }
        }
    }

    decodeNamesBlock(byteArray) {
        let names = [], currentName = '';
        for (let b of byteArray) {
            if (b === 0x00) {
                if (currentName.trim().length > 0) { names.push(currentName.replace(/^\d+/, '')); currentName = ''; }
            } else if (b >= 32 && b <= 126) { currentName += String.fromCharCode(b); }
        }
        return names;
    }

    // =========================================================
    // INCOMING DATA ROUTER & RAM
    // =========================================================

    handleIncomingData(event) {
        const bytes = new Uint8Array(event.target.value.buffer);

        // --- DEVICE ACKNOWLEDGMENT (ACK) ---
        if (bytes.length === 8 && bytes[3] === 0x01 && bytes[7] === 0xFF) {
            // Optional: Uncomment below to debug fast arriving commands
            // this.log("Action Acknowledged by Device", "success");
            return;
        }

        // --- HANDSHAKE STREAM ---
        if (this.syncState === 'READING_AMPS' || this.syncState === 'READING_CABS') {
            let payload = (bytes.length >= 14 && bytes[0] === 0x00 && bytes[1] === 0x59) ? bytes.slice(14) : bytes;
            this.rxBuffer.push(...payload);
            this.processHandshakeBlock();
            return;
        }

        // --- PRESET SYNC STREAM (Catches 20 04 response) ---
        if (bytes.length === 19 && bytes[10] === 0x20 && bytes[11] === 0x04) {
            const activePresetId = bytes[14]; // The magic byte containing the preset number
            
            const currentPatchNumEl = document.getElementById('patchNumber');
            const expectedText = `P${(activePresetId + 1).toString().padStart(2, '0')}`;
            
            // Only updates UI if the device physically changed to a different preset
            if (currentPatchNumEl && currentPatchNumEl.textContent !== expectedText) {
                this.log(`Hardware changed to ${expectedText}. Syncing UI...`, 'info');
                
                const patchItems = document.querySelectorAll('.patch-item');
                if (patchItems.length > 0) {
                    patchItems.forEach(el => el.classList.remove('selected'));
                    const activeItem = document.querySelector(`.patch-item[data-preset-id="${activePresetId}"]`);
                    
                    if (activeItem) {
                        activeItem.classList.add('selected');
                        currentPatchNumEl.textContent = expectedText;
                        
                        const patchNameEl = document.getElementById('patchName');
                        const fullText = activeItem.textContent;
                        if (patchNameEl) {
                            patchNameEl.textContent = fullText.includes(': ') ? fullText.split(': ')[1] : `Preset ${activePresetId + 1}`;
                        }
                        
                        this.isModified = false; // Removes "Modified" status since we switched presets
                        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
            return;
        }

        // --- LIVE RAM STREAM ---
        if (this.syncState === 'READY' && bytes.length === 107 && bytes[1] === 89 && bytes[2] === 35) {
            // Prevents delayed RAM packets from overwriting the UI right after manual edit
            if (this.lastUiEditTime && (Date.now() - this.lastUiEditTime < 1200)) {
                return; 
            }
            this.parseRamDump(bytes);
        }
    }

    async requestRamDump() {
        if (!this.isConnected) return;
        await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket("00 59 23 08 00 00 04 00 00 00 10 5C 00 00 00"));
    }

    parseRamDump(dump) {
        const data = dump.slice(14, 106);
        const currentDumpHex = Array.from(data).join('-'); // Creates signature of the current state
        
        // If the incoming state is identical to the current one, abort instantly!
        if (this.lastDumpHex === currentDumpHex) return; 
        this.lastDumpHex = currentDumpHex;

        this.currentState = {
            volume: data[0],
            routing: [data[2], data[3], data[4], data[5], data[6], data[7]],
            modulesOn: { fx: data[8]===1, amp: data[9]===1, mod: data[10]===1, dly: data[11]===1, rev: data[12]===1, cab: data[13]===1 },
            models: { fx: data[14], amp: data[15], mod: data[16], dly: data[17], rev: data[18], cab: data[19] },
            knobs: {}
        };

        Object.keys(this.BLOCKS).forEach(key => {
            const block = this.BLOCKS[key];
            this.currentState.knobs[block.id] = {};
            for (let i = 0; i < 6; i++) {
                const addr = block.knobStart + (i * 2);
                this.currentState.knobs[block.id][addr] = data[addr];
            }
        });

        const patchVolSlider = document.getElementById('patchVolSlider');
        const isVolEditing = patchVolSlider && patchVolSlider.nextElementSibling && patchVolSlider.nextElementSibling.classList.contains('slider-value-input');
        const isVolHovered = this.currentlyHoveredControl === patchVolSlider;
        if (patchVolSlider && document.activeElement !== patchVolSlider && !isVolEditing && !isVolHovered) {
            patchVolSlider.value = this.currentState.volume;
            patchVolSlider.nextElementSibling.innerText = this.currentState.volume;
            patchVolSlider.style.setProperty('--progress', this.currentState.volume + '%');
        }

        this.renderSignalChain(true);
        this.renderWorkspace(this.selectedBlockId, true);
    }

    // =========================================================
    // PRESET MANAGEMENT
    // =========================================================

    async requestCurrentPresetId() {
        if (!this.isConnected) return;
        // Wireshark discovered command (20 04) to read the current Preset
        const cmdHex = "00 59 23 08 00 00 04 00 00 00 20 04 00 00 00"; 
        await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket(cmdHex));
    }

    async loadPreset(presetId) {
        if (!this.isConnected) return;
        this.log(`Loading Preset: P${(presetId + 1).toString().padStart(2, '0')}`, "sent");
        this.registerEdit(); // Pauses UI to prevent flickering during preset switch
        
        const idHex = presetId.toString(16).padStart(2, '0');
        const cmdHex = `00 59 22 09 00 00 04 ${idHex} 00 00 E0 01 00 00 01 00`;
        
        try {
            document.getElementById('workspacePanel').style.opacity = '0.2';
            await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket(cmdHex));
            
            setTimeout(async () => {
                await this.requestRamDump();
                document.getElementById('workspacePanel').style.opacity = '1';
            }, 500); 
        } catch (error) { this.log(`Load preset failed: ${error.message}`, "error"); }
    }

    async saveCurrentPreset() {
        if (!this.isConnected) return;
        const commitHex = `00 59 22 08 00 00 04 00 00 00 F0 00 00 00 0B`;
        this.log(`Committing UI to Pedal Screen...`, "sent");
        
        try {
            await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket(commitHex));
            alert("Sound committed to hardware screen!");
        } catch(e) { this.log(`Commit failed: ${e.message}`, "error"); }
    }

    // =========================================================
    // WRITE PARAMETERS
    // =========================================================

    registerEdit() {
        this.lastUiEditTime = Date.now();
        if (!this.isModified) {
            this.isModified = true;
            const nameEl = document.getElementById('patchName');
            if (nameEl && !nameEl.textContent.endsWith('*')) {
                nameEl.textContent += '*';
            }
        }
    }

    async toggleModule(blockId, isEnabled) {
        if (!this.isConnected) return;
        this.lastUiEditTime = Date.now();
        const cmdHex = `00 59 22 09 00 00 04 ${blockId.toString(16).padStart(2, '0')} 00 00 10 01 00 00 ${isEnabled ? "01" : "00"} 00`;
        await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket(cmdHex));
    }

    async changeKnob(addressDecimal, value) {
        if (!this.isConnected) return;
        this.lastUiEditTime = Date.now();
        let v = Math.max(0, Math.min(100, value)).toString(16).padStart(2, '0');
        const cmdHex = `00 59 22 0A 00 00 04 ${addressDecimal.toString(16).padStart(2, '0')} 00 00 10 02 00 00 ${v} 00 00`;
        await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket(cmdHex));
    }

    async changeModel(addressHex, modelId) {
        if (!this.isConnected) return;
        this.lastUiEditTime = Date.now();
        const cmdHex = `00 59 22 09 00 00 04 ${addressHex.toString(16).padStart(2, '0')} 00 00 10 01 00 00 ${modelId.toString(16).padStart(2, '0')} 00`;
        await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket(cmdHex));
    }

    async changeRouting(newOrderArray) {
        if (!this.isConnected || newOrderArray.length !== 6) return;
        this.lastUiEditTime = Date.now();
        // newOrderArray must be an array of IDs from 0 to 5. Ex: [4, 0, 1, 2, 3, 5]
        const orderHex = newOrderArray.map(n => n.toString(16).padStart(2, '0')).join(' ');
        // Routing checksum is always D4, as the sum of (0+1+2+3+4+5) is constant
        const cmdHex = `00 59 22 0E 00 00 04 02 00 00 10 06 00 00 ${orderHex} 00`;
        this.log(`Changing signal chain order...`, "sent");
        await this.writeCharacteristic.writeValueWithoutResponse(this.buildPacket(cmdHex));
    }

    // =========================================================
    // UI RENDERING
    // =========================================================

    updateUI() {
        const btn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');

        if (this.isConnected) {
            btn.textContent = "Connected"; btn.disabled = true; btn.style.background = "#2a2a2a";
            if (disconnectBtn) disconnectBtn.disabled = false;
            statusText.textContent = "Synced"; statusText.style.color = "#44ff44";
            statusDot.classList.add('connected');
        } else {
            btn.textContent = "Connect Device"; btn.disabled = false; btn.style.background = "";
            if (disconnectBtn) disconnectBtn.disabled = true;
            statusText.textContent = "Disconnected"; statusText.style.color = "#888";
            statusDot.classList.remove('connected');
        }
    }

    renderSignalChain(fromPolling = false) {
        const container = document.getElementById('signalChain');
        if (!container || !this.currentState) return;
        
        // Maximum protection: aborts recreation if user is dragging
        if (this.isDragging) return;
        
        // Check if DOM already exists and routing order matches
        const currentDOMBlocks = Array.from(container.querySelectorAll('.chain-module'));
        const orderMatches = currentDOMBlocks.length === this.currentState.routing.length && 
                             currentDOMBlocks.every((el, i) => parseInt(el.dataset.blockNumber) === this.currentState.routing[i]);

        if (orderMatches && container.children.length > 0) {
            // SMART UPDATE: Just update classes (preserves hover and drag states)
            this.currentState.routing.forEach((blockNumber, index) => {
                const blockInfo = this.BLOCKS[blockNumber];
                const isOn = this.currentState.modulesOn[blockInfo.id];
                const blockEl = currentDOMBlocks[index];
                
                blockEl.classList.toggle('active', isOn);
                const statusDot = blockEl.querySelector('.module-status');
                if (statusDot) statusDot.classList.toggle('on', isOn);
                
                const typeEl = blockEl.querySelector('.module-type');
                if (typeEl) {
                    const currentModelId = this.currentState.models[blockInfo.id];
                    typeEl.textContent = this.isConnected ? blockInfo.modelNames[currentModelId] : 'Please sync';
                }
            });
            return;
        }

        // FULL REBUILD: Aborts if user is hovering during a background poll that requires order change
        if (fromPolling && this.currentlyHoveredControl && container.contains(this.currentlyHoveredControl)) return;

        container.innerHTML = '';

        this.currentState.routing.forEach((blockNumber, index) => {
            const blockInfo = this.BLOCKS[blockNumber];
            const isOn = this.currentState.modulesOn[blockInfo.id];
            const currentModelId = this.currentState.models[blockInfo.id];
            const modelName = this.isConnected ? blockInfo.modelNames[currentModelId] : 'Please sync';
            
            const blockEl = document.createElement('div');
            blockEl.className = `chain-module ${isOn ? 'active' : ''}`;
            blockEl.draggable = true;
            blockEl.dataset.blockNumber = blockNumber;

            blockEl.innerHTML = `
                <svg class="module-icon"><use href="#icon-${blockInfo.id}"></use></svg>
                <div class="module-status ${isOn ? 'on' : ''}"></div>
                <div class="module-name">${blockInfo.label}</div>
                <div class="module-type">${modelName}</div>
            `;

            blockEl.onclick = async (e) => {
                if (!this.isConnected) return;
                
                if (e.target.classList.contains('module-status')) {
                    // Use dynamic state to avoid closure staleness
                    const currentIsOn = this.currentState.modulesOn[blockInfo.id];
                    await this.toggleModule(blockInfo.toggleAddr, !currentIsOn);
                    this.currentState.modulesOn[blockInfo.id] = !currentIsOn;
                    this.renderSignalChain(false);
                    
                    // Keep the workspace panel in sync if it's currently showing this module
                    if (this.selectedBlockId === blockNumber) {
                        const wsToggle = document.getElementById('blockToggle');
                        if (wsToggle) wsToggle.classList.toggle('on', !currentIsOn);
                    }
                } else { 
                    this.renderWorkspace(blockNumber, false); 
                }
            };

            container.appendChild(blockEl);
            if (index < 5) {
                const conn = document.createElement('div');
                conn.className = 'chain-connector';
                container.appendChild(conn);
            }
        });
    }

    renderWorkspace(blockNumber, fromPolling = false) {
        const workspace = document.getElementById('workspacePanel');
        if (!workspace || !this.currentState) return;
        
        const block = this.BLOCKS[blockNumber];
        const isOn = this.currentState.modulesOn[block.id];
        const currentModelId = this.currentState.models[block.id];
        const paramNames = block.isDynamic ? (block.params[currentModelId] || block.params[0]) : block.params;
        
        if (fromPolling) {
            // SMART UPDATE (Vanilla Virtual DOM)
            // If module or effect hasn't changed, surgically update the sliders!
            if (workspace.dataset.activeBlock == blockNumber && workspace.dataset.activeModel == currentModelId) {
                const toggle = document.getElementById('blockToggle');
                if (toggle) toggle.className = `toggle-switch ${isOn ? 'on' : ''}`;
                
                paramNames.forEach((pName, i) => {
                    if (pName === 'Ghost') return;
                    const addr = block.knobStart + (i * 2);
                    const val = this.currentState.knobs[block.id][addr];
                    const slider = workspace.querySelector(`.slider[data-addr="${addr}"]`);
                    
                    // Only updates slider if not currently focused/edited by the user
                    if (slider && document.activeElement !== slider && this.currentlyHoveredControl !== slider) {
                        const isHighCut = (block.id === 'cab' && pName === 'High Cut');
                        const uiVal = isHighCut ? (100 - val) : val;
                        slider.value = uiVal;
                        slider.nextElementSibling.innerText = this.formatDisplayValue(block.id, pName, val);
                        slider.style.setProperty('--progress', uiVal + '%');
                    }
                });
                if (block.id === 'dly') {
                    this.updateTapTempoFromSlider(block);
                }
                return; // Clean exit, DOM preserved!
            }
        } else {
            // Clears ghost reference in case of forced user recreation
            if (this.currentlyHoveredControl && workspace?.contains(this.currentlyHoveredControl)) {
                this.currentlyHoveredControl = null;
            }
        }

        this.selectedBlockId = blockNumber;

        // Tags the current panel so Smart Update knows future context
        workspace.dataset.activeBlock = blockNumber;
        workspace.dataset.activeModel = currentModelId;

        let optionsHtml = '';
        block.modelNames.forEach((name, i) => { optionsHtml += `<option value="${i}" ${i === currentModelId ? 'selected' : ''}>${name}</option>`; });

        const currentModelName = block.modelNames[currentModelId];
        const normalize = (str) => (str || '').replace(/[\s_]+/g, '').toLowerCase();
        const normalizedTarget = normalize(currentModelName);
        
        let description = `Custom or undocumented ${block.label} model.`;
        if (window.EFFECT_DESCRIPTIONS) {
            const matchedKey = Object.keys(window.EFFECT_DESCRIPTIONS).find(key => normalize(key) === normalizedTarget);
            if (matchedKey) description = window.EFFECT_DESCRIPTIONS[matchedKey];
        }

        let html = `
            <div class="effect-description">${description}</div>
            <div class="control-section">
                <h4>${block.label}</h4>
                <div class="control-row">
                    <div class="control-label">Enable</div>
                    <div class="toggle-switch ${isOn ? 'on' : ''}" id="blockToggle"></div>
                </div>
                <div class="control-row">
                    <div class="control-label">Model</div>
                    <select id="modelSelector" class="dropdown-select">${optionsHtml}</select>
                </div>
            </div>
            <div class="control-section">
                <h4>Parameters</h4>`;

        paramNames.forEach((pName, i) => {
            if (pName === 'Ghost') return;
            const addr = block.knobStart + (i * 2);
            const val = this.currentState.knobs[block.id][addr];
            const isHighCut = (block.id === 'cab' && pName === 'High Cut');
            const uiVal = isHighCut ? (100 - val) : val;
            const displayVal = this.formatDisplayValue(block.id, pName, val);
            
            let oninputCode = `editor.registerEdit(); let rawVal = ${isHighCut ? '100 - parseInt(this.value)' : 'parseInt(this.value)'}; this.nextElementSibling.innerText = editor.formatDisplayValue('${block.id}', '${pName}', rawVal); this.style.setProperty('--progress', this.value + '%');`;
            let onchangeCode = `this.blur(); let rawVal = ${isHighCut ? '100 - parseInt(this.value)' : 'parseInt(this.value)'}; editor.changeKnob(${addr}, rawVal)`;

            html += `
                <div class="control-row">
                    <div class="control-label">${pName}</div>
                    <div class="slider-container">
                        <input type="range" min="0" max="100" value="${uiVal}" class="slider" data-addr="${addr}" data-block-id="${block.id}" data-param-name="${pName}"
                               oninput="${oninputCode}"
                               onchange="${onchangeCode}"
                               style="--progress: ${uiVal}%">
                        <span class="slider-value">${displayVal}</span>
                    </div>
                </div>`;
        });
        
        if (block.id === 'dly') {
            html += `
            <div class="tap-tempo-section">
                <div class="tap-grid">
                    <div class="tap-display">
                        <input type="number" id="tap-bpm-input" class="bpm-input" value="120.0" min="20" max="300" step="0.1">
                        <span class="display-label">BPM</span>
                    </div>
                    <div class="tap-display">
                        <span id="delay-time-ms" class="bpm-input">500ms</span>
                        <span class="display-label">Calculated delay time</span>
                    </div>
                    <button id="tap-button" class="tap-button">TAP TEMPO</button>
                    <div id="note-divisions" class="note-divisions">
                        <button class="note-btn" data-multiplier="0.5">1/8</button>
                        <button class="note-btn" data-multiplier="0.75">1/8 dotted</button>
                        <button class="note-btn active" data-multiplier="1">1/4</button>
                        <button class="note-btn" data-multiplier="2">1/2</button>
                    </div>
                </div>
            </div>`;
        }

        workspace.innerHTML = html + `</div>`;

        if (this.beatIntervalId) { clearInterval(this.beatIntervalId); this.beatIntervalId = null; }
        if (block.id === 'dly') { this.setupTapTempo(block); }

        document.getElementById('blockToggle').onclick = async () => {
            await this.toggleModule(block.toggleAddr, !isOn);
            this.currentState.modulesOn[block.id] = !isOn;
            this.renderSignalChain(false);
            this.renderWorkspace(blockNumber, false);
        };

        document.getElementById('modelSelector').onchange = async (e) => {
            const id = parseInt(e.target.value);
            e.target.blur(); 
            await this.changeModel(block.modelAddr, id);
            this.currentState.models[block.id] = id;
            this.renderWorkspace(blockNumber, false);
        };
    }

    // =========================================================
    // TAP TEMPO LOGIC
    // =========================================================

    getDelayRange(modelId) {
        // Dual Delay is modelId === 3 (1200 to 120bpm -> 50ms to 500ms)
        if (modelId === 3) {
            return { minMs: 50, maxMs: 500 };
        } else {
            // Other Delays (Analog, Duck, Dtape, Lofi) (600 to 60bpm -> 100ms to 1000ms)
            return { minMs: 100, maxMs: 1000 };
        }
    }

    setupTapTempo(block) {
        const tapButton = document.getElementById('tap-button');
        const bpmInput = document.getElementById('tap-bpm-input');
        const divisionButtonsContainer = document.getElementById('note-divisions');
        const delayTimeSlider = document.querySelector(`.slider[data-addr="${block.knobStart}"]`);

        if (!tapButton || !bpmInput || !divisionButtonsContainer || !delayTimeSlider) return;

        // Discovers the MS limit based on the selected Delay model
        const currentModelId = this.currentState.models[block.id];
        const { minMs, maxMs } = this.getDelayRange(currentModelId);
        
        const divisionButtons = divisionButtonsContainer.querySelectorAll('.note-btn');
        let tapTimestamps = [];
        let timeoutId = null;

        const updateDelayFromBpm = () => {
            const activeMultiplierBtn = divisionButtonsContainer.querySelector('.note-btn.active');
            const noteMultiplier = activeMultiplierBtn ? parseFloat(activeMultiplierBtn.dataset.multiplier) : 1.0;

            let currentBpm = parseFloat(bpmInput.value);
            if (isNaN(currentBpm)) currentBpm = 120;
            currentBpm = Math.max(20, Math.min(currentBpm, 1200)); // Reasonable BPM limits
            currentBpm = Math.round(currentBpm * 2) / 2;
            bpmInput.value = currentBpm.toFixed(1);

            let finalDelayTimeMs = ((60 * 1000) / currentBpm) * noteMultiplier;
            
            // Clamps the time to the device's physical limits
            if (finalDelayTimeMs > maxMs) finalDelayTimeMs = maxMs;
            if (finalDelayTimeMs < minMs) finalDelayTimeMs = minMs;

            // Transforms Milliseconds to the 0-100 scale of the device control
            let sliderValue = Math.round(((finalDelayTimeMs - minMs) / (maxMs - minMs)) * 100);
            sliderValue = Math.max(0, Math.min(sliderValue, 100));

            if (delayTimeSlider.value !== String(sliderValue)) {
                delayTimeSlider.value = sliderValue;
                delayTimeSlider.nextElementSibling.innerText = sliderValue;
                delayTimeSlider.style.setProperty('--progress', sliderValue + '%');
                this.changeKnob(block.knobStart, sliderValue);
                this.registerEdit();
            }
            this.updateTapTempoFromSlider(block);
            this.startBeatIndicator(currentBpm);
        };

        const calculateBpmFromTaps = () => {
            if (tapTimestamps.length < 2) return;
            const intervals = tapTimestamps.slice(1).map((t, i) => t - tapTimestamps[i]);
            const avg = intervals.reduce((s, v) => s + v, 0) / intervals.length;
            if (avg > 0 && avg < 3000) {
                bpmInput.value = ((60 * 1000) / avg).toFixed(1);
                updateDelayFromBpm();
            }
        };

        tapButton.addEventListener('click', () => {
            clearTimeout(timeoutId);
            tapTimestamps.push(Date.now());
            if (tapTimestamps.length > 4) tapTimestamps.shift();
            calculateBpmFromTaps();
            timeoutId = setTimeout(() => tapTimestamps = [], 2000);
        });

        bpmInput.addEventListener('change', updateDelayFromBpm);
        
        divisionButtons.forEach(button => {
            button.addEventListener('click', e => {
                divisionButtons.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                updateDelayFromBpm();
            });
        });

        delayTimeSlider.addEventListener('input', () => this.updateTapTempoFromSlider(block));

        this.updateTapTempoFromSlider(block);
        
        // Starts the beat indicator based on the native MS value from the device
        const currentVal = parseInt(delayTimeSlider.value, 10);
        const initialMs = Math.round(minMs + (currentVal / 100) * (maxMs - minMs));
        const activeMultiplierBtn = divisionButtonsContainer.querySelector('.note-btn.active');
        const noteMultiplier = activeMultiplierBtn ? parseFloat(activeMultiplierBtn.dataset.multiplier) : 1.0;
        const initialBpm = ((60 * 1000) / (initialMs / noteMultiplier));
        bpmInput.value = initialBpm.toFixed(1);
        this.startBeatIndicator(initialBpm);
    }

    updateTapTempoFromSlider(block) {
        const delayTimeSlider = document.querySelector(`.slider[data-addr="${block.knobStart}"]`);
        const delayTimeDisplay = document.getElementById('delay-time-ms');
        const bpmInput = document.getElementById('tap-bpm-input');
        const divisionButtonsContainer = document.getElementById('note-divisions');
        
        if (!delayTimeSlider || !delayTimeDisplay) return;
        
        const currentModelId = this.currentState.models[block.id];
        const { minMs, maxMs } = this.getDelayRange(currentModelId);

        const currentVal = parseInt(delayTimeSlider.value, 10);
        // Converts the 0-100 range to physical MS
        const currentMs = Math.round(minMs + (currentVal / 100) * (maxMs - minMs));
        
        delayTimeDisplay.textContent = `${currentMs}ms`;
        
        // Highlights red if the value hits absolute min or max
        if (currentMs >= maxMs || currentMs <= minMs) { delayTimeDisplay.classList.add('out-of-range'); } 
        else { delayTimeDisplay.classList.remove('out-of-range'); }

        // Mathematically recalculates BPM and indicator if slider is dragged
        if (bpmInput && document.activeElement !== bpmInput) {
             const activeMultiplierBtn = divisionButtonsContainer?.querySelector('.note-btn.active');
             const noteMultiplier = activeMultiplierBtn ? parseFloat(activeMultiplierBtn.dataset.multiplier) : 1.0;
             if (currentMs > 0) {
                 let impliedBpm = ((60 * 1000) / (currentMs / noteMultiplier));
                 if (impliedBpm > 2000) impliedBpm = 2000;
                 bpmInput.value = impliedBpm.toFixed(1);
                 this.startBeatIndicator(impliedBpm);
             }
        }
    }

    startBeatIndicator(bpm) {
        if (this.beatIntervalId) clearInterval(this.beatIntervalId);
        if (bpm <= 0 || bpm > 2000) return;
        const tapButton = document.getElementById('tap-button');
        if (!tapButton) return;

        const intervalMs = (60 * 1000) / bpm;
        this.beatIntervalId = setInterval(() => {
            tapButton.classList.add('beat-flash');
            setTimeout(() => tapButton.classList.remove('beat-flash'), 100);
        }, intervalMs);
    }

    // =========================================================
    // DRAG AND DROP (ROUTING)
    // =========================================================

    initRoutingDragAndDrop() {
        const container = document.getElementById('signalChain');
        if (!container) return;

        let draggedElement = null;

        container.addEventListener('dragstart', e => {
            this.registerEdit(); // Locks polling while holding the module
            this.isDragging = true;
            if (e.target.classList.contains('chain-module')) {
                draggedElement = e.target;
                e.dataTransfer.effectAllowed = 'move';
                
                // Creates a temporary clone to ensure ghost image renders on cursor
                const dragIcon = draggedElement.cloneNode(true);
                dragIcon.style.position = 'absolute';
                dragIcon.style.top = '-9999px';
                document.body.appendChild(dragIcon);
                // Centers image on mouse pointer (since block is 80x80)
                e.dataTransfer.setDragImage(dragIcon, 40, 40);

                setTimeout(() => {
                    document.body.removeChild(dragIcon);
                    if (draggedElement) {
                        draggedElement.classList.add('dragging');
                    }
                }, 0);
            }
        });

        container.addEventListener('dragover', e => {
            e.preventDefault();
            this.registerEdit(); // Keeps polling locked while dragging
            if (draggedElement) {
                const afterElement = this.getDragAfterElement(container, e.clientX);

                if (afterElement == null) {
                    container.appendChild(draggedElement);
                } else {
                    container.insertBefore(draggedElement, afterElement);
                }
                
                // Instantly reorganize the 5 connectors to sit between the pedals
                const modules = container.querySelectorAll('.chain-module');
                const connectors = container.querySelectorAll('.chain-connector');
                
                for (let i = 0; i < connectors.length; i++) {
                    if (modules[i] && modules[i].nextSibling !== connectors[i]) {
                        container.insertBefore(connectors[i], modules[i].nextSibling);
                    }
                }
            }
        });

        container.addEventListener('dragend', e => {
            this.isDragging = false;
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
                draggedElement = null;

                const newOrder = [];
                container.querySelectorAll('.chain-module').forEach(el => {
                    newOrder.push(parseInt(el.dataset.blockNumber, 10));
                });

                if (newOrder.length === 6) {
                    const orderChanged = newOrder.some((val, idx) => val !== this.currentState.routing[idx]);
                    if (orderChanged) {
                        this.currentState.routing = newOrder;
                        this.changeRouting(newOrder); // Dispatches without blocking UI rendering
                    }
                }
                this.renderSignalChain(false, true);
            }
        });
    }

    getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.chain-module:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

const editor = new MvaveBLEEditor();