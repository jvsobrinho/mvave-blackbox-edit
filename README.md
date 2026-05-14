# BlackboxEdit

An unofficial, browser-based preset editor for the **M-Vave Blackbox** multi-effects pedal, utilizing Web Bluetooth (BLE) for real-time bidirectional communication.

## Features

* **Live Editing:** Tweak parameters, change amp models, and toggle effects in real-time.
* **Drag & Drop Routing:** Easily reorder your signal chain by dragging effect blocks.
* **Smart Tap Tempo (Experimental):** Auto-calculates BPM to milliseconds (ms) for the Delay module. This feature was adapted from the original project to strictly match the physical boundaries described in the official Blackbox manual, but it still lacks hardware validation.
* **Seamless Sync:** Polling-based background synchronization keeps the editor updated when physical footswitches are pressed.

## Work in Progress / To-Do

The following features are planned but **not yet implemented**:

* **Save Preset to Memory:** Saving configurations directly into the pedal's Flash memory slots (DMA).
* **Import / Export Presets:** Backing up and sharing preset configurations as `.json` files.

## How it Works (Reverse Engineering)

Since the M-Vave Blackbox does not use standard Universal MIDI over BLE, this editor relies on a fully reverse-engineered GATT protocol.

If you are interested in the technical details, memory maps, and the proprietary hexadecimal packet structure used by the pedal, check out the dedicated documentation repository:
**M-Vave Blackbox BLE Protocol**

## Acknowledgments & Credits

The architecture and core logic of the Web Editor in this project were heavily inspired by and adapted from the excellent **PocketEdit** project (a web editor for the Sonicake Pocket Master).

Special thanks to the original authors for their open-source spirit and for explicitly granting permission to port their logic to the M-Vave ecosystem:

* **[@suckyble](https://github.com/suckyble)** (Creator of PocketEdit)
* **[Hristo Nikolov (@hnikolov)](https://github.com/hnikolov)** (Core Contributor)

You can view their original repository here: **[suckyble/PocketEdit](https://github.com/suckyble/PocketEdit)**

## Disclaimer

**Note:** This project is an independent open-source initiative and is not endorsed by, affiliated with, or connected to M-Vave.

* **M-VAVE** and **CUVAVE** are registered trademarks of **Zhuhai Shengke Intelligent Technology Co., Ltd.**
* Any brand names, trademarks, or model names mentioned in this project are the property of their respective owners and are used solely for descriptive and educational purposes.

The use of direct flash memory write commands (Save) and the provided scripts is entirely at the user's own risk. The author is not responsible for any bricked devices, hardware damage, or data loss.
