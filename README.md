# BlackboxEdit

An unofficial, browser-based preset editor for the **M-Vave Blackbox** multi-effects pedal, utilizing Web Bluetooth (BLE) for real-time bidirectional communication.

### [Launch BlackboxEdit Web App](https://jvsobrinho.github.io/mvave-blackbox-edit/)
*(No installation required. Best experienced on Google Chrome or Microsoft Edge supporting Web Bluetooth)*

---

> **EXPERIMENTAL PHASE: USE AT YOUR OWN RISK**
> This application is still under active testing (Beta). The use of direct flash memory write commands (Save) and the provided scripts interacts intimately with the pedal's core hardware. **The author is not responsible for any bricked devices, hardware damage, or data loss.** Use this software and the reverse-engineered protocols entirely at your own risk.

---

## Features

* **Save to Device:** Save your modified configurations directly into the pedal's hardware Flash memory slots via DMA.
* **Live Editing:** Tweak parameters, change amp models, and toggle effects in real-time.
* **Drag & Drop Routing:** Easily reorder your signal chain by dragging and dropping effect blocks in the workspace.
* **Smart Tap Tempo (Experimental):** Auto-calculates BPM to milliseconds (ms) for the Delay module. Adapted from the original project to strictly match the physical boundaries described in the official Blackbox manual (hardware validation pending).
* **Seamless Sync:** Polling-based background synchronization keeps the editor instantly updated when physical footswitches are pressed.

## Work in Progress 

The following features are currently in development:
* **Import / Export Presets:** Backing up and sharing preset configurations as `.json` files.
* **Full Device Dump:** Creating complete backups of all 80 preset slots.

---

## How it Works (Reverse Engineering)

Since the M-Vave Blackbox does not use standard Universal MIDI over BLE, this editor relies on a fully reverse-engineered GATT protocol.

If you are interested in the technical details, memory maps, offset calculations, and the proprietary hexadecimal packet structure used by the pedal, check out the dedicated documentation repository:
**[M-Vave Blackbox BLE Protocol](https://github.com/jvsobrinho/mvave-blackbox-ble)**

---

## Acknowledgments & Credits

The architecture and core logic of the Web Editor in this project were heavily inspired by and adapted from the excellent **PocketEdit** project (a web editor for the Sonicake Pocket Master).

Special thanks to the original authors for their open-source spirit and for explicitly granting permission to port their logic to the M-Vave ecosystem:

* **[@suckyble](https://github.com/suckyble)** (Creator of PocketEdit)
* **[Hristo Nikolov (@hnikolov)](https://github.com/hnikolov)** (Core Contributor)

You can view their original repository here: **[suckyble/PocketEdit](https://github.com/suckyble/PocketEdit)**

---

## Legal Disclaimer

This project is an independent open-source initiative and is not endorsed by, affiliated with, or connected to M-Vave.

* **M-VAVE** and **CUVAVE** are registered trademarks of **Zhuhai Shengke Intelligent Technology Co., Ltd.**
* Any brand names, trademarks, or model names mentioned in this project are the property of their respective owners and are used solely for descriptive and educational purposes.

---

## License

This project is licensed under the MIT License.

Please note that the reverse-engineering research, protocol documentation, memory maps, and reference tools used by this project are maintained in the separate **M-Vave Blackbox BLE Protocol** repository, which is licensed independently under **CC BY-SA 4.0** (documentation) and **GPL-3.0** (source code).
