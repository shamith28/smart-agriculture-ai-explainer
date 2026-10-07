# AI-Powered Smart Agriculture Monitoring and Crop Yield Prediction System

[![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-black?style=flat&logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![WebGL: Three.js](https://img.shields.io/badge/WebGL-Three.js%20r128-047857.svg)](https://threejs.org)
[![Resolution: 720p 30fps](https://img.shields.io/badge/Video-1280x720%2030fps-0284c7.svg)](#)

A professional college MCA / Engineering capstone project demonstration featuring a continuous 3D animated explainer, synchronized playback engine, intelligent analytics dashboard, and automated closed-loop drip irrigation simulation.

---

## 1. Project Overview

Modern agriculture faces severe challenges including freshwater scarcity, soil degradation, and unpredictable microclimates. This project showcases an end-to-end cyber-physical IoT architecture designed to solve these issues:

1. **Substrate & Microclimate Sensing:** Capacitive Soil Moisture Sensor v1.2, DHT22 (temperature and humidity), Soil pH probe, and industrial NPK (Nitrogen, Phosphorus, Potassium) 3-probe sensor.
2. **Industrial Communication Bus:** The NPK sensor communicates via RS485 differential signals; a MAX485 transceiver translates these signals to the ESP32 microcontroller UART.
3. **Edge Processing & Calibration:** The dual-core 32-bit ESP32 microcontroller collects, filters, and packages all sensor telemetry.
4. **Wireless Cloud Telemetry:** Telemetry is transmitted over 2.4 GHz Wi-Fi to a software dashboard in real time.
5. **Intelligent Analysis & Yield Forecasting:** An agronomic machine learning engine evaluates overall crop health (`88 / 100`) and forecasts projected yield gain (`+11.2%`).
6. **Automated Closed-Loop Irrigation:** When soil moisture drops below 30%, the ESP32 automatically energizes a 5V optocoupler relay module, turning on a mini DC submersible water pump to deliver drip irrigation until optimal moisture (70%) is restored.

---

## 2. Technologies Used

- **Frontend / 3D Graphics:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules), Three.js (r128 vendored locally in `public/libs/three.min.js`), WebGL, HTML5 Canvas 2D compositing.
- **Audio Engine:** HTML5 Audio API, studio neural text-to-speech voice narration, multi-channel synthesized ambient soundtrack.
- **Video Export Engine:** FFmpeg (libx264, AAC-LC, yuv420p, 1280×720, 30 FPS, faststart).
- **Deployment Platform:** Vercel (static zero-configuration hosting) and GitHub repository ready.

---

## 3. Project Structure

```text
smart-agriculture/
├── index.html                  # Main application entry point & video player
├── vercel.json                 # Vercel deployment headers and routing rules
├── package.json                # Project manifest and npm scripts
├── .gitignore                  # Git ignore rules for clean repository
├── README.md                   # Complete documentation
│
├── src/                        # Modular application source code
│   ├── main.js                 # App bootstrapping & event bindings
│   ├── animation.js            # Three.js 3D smart farm & 2D HUD composition
│   ├── timeline.js             # Master deterministic timeline (0-120 seconds)
│   ├── audio.js                # Synchronized narration & background music
│   ├── player.js               # Play/Pause/Seek/Restart/Fullscreen engine
│   ├── export.js               # Export dialog & MP4 download trigger
│   └── styles.css              # Cyber-agri dark design system & responsive layout
│
├── public/                     # Publicly served deployment assets
│   ├── libs/
│   │   └── three.min.js        # Vendored standalone Three.js library
│   ├── audio/
│   │   ├── soundtrack.mp3      # Master mixed soundtrack (Narration + BGM)
│   │   ├── narration.mp3       # Isolated narration stem
│   │   └── bgm.mp3             # Isolated background music stem
│   ├── video/
│   │   └── Smart_Agriculture_AI_Explainer_2min.mp4 # Standalone 120s MP4 deliverable
│   └── assets/
│
└── scripts/                    # Automation and rendering tools
    ├── generate_audio.py       # Audio synthesis and timeline assembly script
    └── render_video.py         # Headless browser + FFmpeg 120s MP4 render pipeline
```

---

## 4. How to Run Locally

You can run the project locally with any standard HTTP server. No build step or native dependencies are required:

### Option A: Using Python (Built-in)
```bash
python -m http.server 3000
```
Open your browser and navigate to: `http://localhost:3000`

### Option B: Using Node.js (npx serve)
```bash
npx -y serve .
```

---

## 5. How to Build

Because the project is built with clean vanilla web standards and vendored libraries:
```bash
npm run build
```
The project is static and production-ready out of the box. No webpack/vite compilation is mandatory.

---

## 6. How to Deploy to Vercel

### Quick Deployment via Vercel CLI:
```bash
npm install -g vercel
vercel deploy --prod
```

### Deployment via GitHub:
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI-Powered Smart Agriculture Explainer"
   ```
2. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/your-username/smart-agriculture.git
   git branch -M main
   git push -u origin main
   ```
3. Open [Vercel Dashboard](https://vercel.com/new).
4. Select **Import Git Repository** and select `smart-agriculture`.
5. Keep default settings (Framework: *Other*, Root Directory: `./`).
6. Click **Deploy**. Vercel will deploy the site and provide a public URL:
   `https://smart-agriculture-project.vercel.app`

---

## 7. How to Use the Application

- **Play / Pause:** Click the center screen prompt, the **PLAY** button in the control bar, or press the `Space` key on your keyboard.
- **Seek:** Click anywhere on the timeline scrubber or press the `Left` / `Right` arrow keys to jump ±5 seconds.
- **Restart:** Click **RESTART** to return immediately to `00:00`.
- **Chapter Navigation:** Click any of the 10 scene cards below the video to jump directly to that chapter.
- **Volume:** Adjust the volume slider in the controls bar.
- **Fullscreen:** Click the **FULLSCREEN** button to expand the 16:9 presentation without any interruption or desynchronization.
- **Stop at 120 Seconds:** The presentation automatically stops cleanly at `02:00` and preserves the final frame without unwanted looping.

---

## 8. How to Export the MP4

### In the Web Application:
1. Click the **EXPORT FINAL VIDEO** button in the video controls bar.
2. In the dialog, click **DOWNLOAD STANDALONE MP4 (120s)**.
3. The genuine, full-length 120-second H.264/AAC MP4 video will download instantly to your device.

### Re-rendering from Source with Headless Engine:
If you modify the 3D scene, timeline, or graphics and wish to re-render the pristine 120-second video from scratch:
```bash
python scripts/render_video.py
```
This script will:
1. Run a 5-second export test (150 frames) and validate audio/video streams.
2. Stream 3,600 frames at 30 FPS from the headless browser into FFmpeg via a memory-safe pipe.
3. Mux the 48 kHz stereo AAC audio track.
4. Verify sample frames at timestamps `00:00`, `00:10`, `00:30`, `01:00`, `01:30`, `01:50`, and `01:59`.
5. Produce `Smart_Agriculture_AI_Explainer_2min.mp4`.

---

## 9. Environment Variables

**No environment variables are required.** The application is completely self-contained and operates purely client-side after deployment.

---

## 10. Important Deployment Notes

- **Zero Localhost Dependencies:** No hardcoded `localhost`, `127.0.0.1`, or local file paths (`C:\...`) exist in any client asset.
- **HTTPS & CORS Compliant:** All assets, audio files, and libraries use deployment-safe relative URLs (`./public/...`, `./src/...`).
- **Universal Compatibility:** The exported MP4 conforms strictly to H.264 High Profile and AAC-LC with `yuv420p` pixel format and `-movflags +faststart`, ensuring seamless playback in:
  - VLC Media Player
  - Windows Media Player / Movies & TV
  - Apple QuickTime
  - Microsoft PowerPoint Presentations
  - WhatsApp & Social Media
  - Mobile Browsers (Android Chrome, iOS Safari)

---

## Master 10-Scene Timeline Reference

| Scene | Timestamp | Title | Key Demonstrated Features |
|---|---|---|---|
| **01** | `00:00 - 00:12` | Smart Farm Introduction | Miniature farm, soil bed, lush crops, water tank, electronics overview. |
| **02** | `00:12 - 00:24` | Hardware Architecture | ESP32, Capacitive moisture sensor, DHT22, pH probe, NPK sensor, MAX485, Relay. |
| **03** | `00:24 - 00:36` | Sensor Monitoring | Probe inserted into soil; live telemetry readings (28% moisture, 29.8°C, 44% RH, pH 6.4). |
| **04** | `00:36 - 00:48` | NPK + MAX485 Interface | RS485 differential data packets moving from NPK probe to MAX485 transceiver. |
| **05** | `00:48 - 01:00` | ESP32 Data Processing | Data collection, calibration, and rule-based decision logic inside ESP32. |
| **06** | `01:00 - 01:12` | Wi-Fi Communication | Concentric 2.4 GHz radio waves radiating from ESP32 antenna to local dashboard. |
| **07** | `01:12 - 01:24` | Software Dashboard | Complete web dashboard with 24h moisture trend, nutrient bars, and system indicators. |
| **08** | `01:24 - 01:36` | Intelligent AI Analysis | Neural feature weights, Crop Health evaluation (`88/100`), Yield forecast (`+11.2%`). |
| **09** | `01:36 - 01:48` | Automatic Irrigation Trigger | Moisture drops to 28% (< 30% limit); ESP32 triggers Relay module from OFF to ON. |
| **10** | `01:48 - 02:00` | Pump & Complete System | DC pump on; water streams through drip tube into soil; moisture rises to 70%; pump turns off. |

---

*Designed and developed for College MCA / Engineering Academic Demonstration.*
