/* ==========================================================================
   AI-POWERED SMART AGRICULTURE - MASTER TIMELINE (0.0 to 120.0 Seconds)
   ========================================================================== */

export const TOTAL_DURATION = 120.0; // exactly 120 seconds

export const SCENES_DATA = [
  {
    id: 1,
    start: 0.0,
    end: 12.0,
    name: "SMART FARM INTRODUCTION",
    subtitle: "Monitoring & Crop Yield Prediction System",
    narration: "Welcome to our AI-powered smart agriculture monitoring and crop yield prediction system. This solution combines IoT sensors, intelligent analysis, and automated irrigation to make farming smarter and more efficient."
  },
  {
    id: 2,
    start: 12.0,
    end: 24.0,
    name: "HARDWARE ARCHITECTURE",
    subtitle: "ESP32, Micro-Sensors & Actuators Showcase",
    narration: "The system uses an ESP32 controller together with soil moisture, temperature and humidity, pH, and NPK sensors. A MAX485 interface provides reliable RS485 communication for the NPK sensor."
  },
  {
    id: 3,
    start: 24.0,
    end: 36.0,
    name: "SENSOR MONITORING",
    subtitle: "Real-Time Substrate & Microclimate Sensing",
    narration: "The sensors continuously monitor the farm environment. Soil moisture measures water availability, the DHT22 measures temperature and humidity, the pH sensor measures soil acidity, and the NPK sensor measures essential soil nutrients."
  },
  {
    id: 4,
    start: 36.0,
    end: 48.0,
    name: "NPK + MAX485 INTERFACE",
    subtitle: "Industrial RS485 Differential Communication",
    narration: "The NPK sensor communicates using the RS485 protocol. The MAX485 module interfaces this communication with the ESP32, allowing the nutrient data to be collected by the controller."
  },
  {
    id: 5,
    start: 48.0,
    end: 60.0,
    name: "ESP32 DATA PROCESSING",
    subtitle: "Aggregation, Calibration & Decision Engine",
    narration: "The ESP32 collects and processes the sensor readings, combining the information into a unified view of the farm's current condition."
  },
  {
    id: 6,
    start: 60.0,
    end: 72.0,
    name: "WI-FI COMMUNICATION",
    subtitle: "Wireless Telemetry Streaming to Software Layer",
    narration: "The processed information is transmitted wirelessly through Wi-Fi to the software dashboard, where the farm can be monitored in real time."
  },
  {
    id: 7,
    start: 72.0,
    end: 84.0,
    name: "SOFTWARE DASHBOARD",
    subtitle: "Live Multi-Parameter Agricultural Telemetry",
    narration: "The dashboard presents real-time sensor readings through clear indicators and graphs, allowing the condition of the crop environment to be monitored easily."
  },
  {
    id: 8,
    start: 84.0,
    end: 96.0,
    name: "INTELLIGENT ANALYSIS & YIELD PREDICTION",
    subtitle: "Evaluating Crop Health & Forecasting Output",
    narration: "The collected agricultural data is then analyzed intelligently to evaluate crop health and estimate potential crop yield, helping farmers make more informed decisions."
  },
  {
    id: 9,
    start: 96.0,
    end: 108.0,
    name: "AUTOMATIC IRRIGATION DECISION",
    subtitle: "Low Moisture Detection & Relay Actuation",
    narration: "When soil moisture falls below the required threshold, the ESP32 detects the condition and automatically activates the irrigation system."
  },
  {
    id: 10,
    start: 108.0,
    end: 120.0,
    name: "PUMP & COMPLETE SYSTEM",
    subtitle: "Precision Drip Rehydration & Closed-Loop Cycle",
    narration: "Once sufficient moisture is restored, the pump switches off automatically. This creates a complete intelligent monitoring and irrigation cycle for smarter and more efficient agriculture."
  }
];

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function getTimelineState(t) {
  const masterTime = clamp(t, 0.0, TOTAL_DURATION);
  
  // Find current scene index
  let sceneIndex = Math.min(9, Math.floor(masterTime / 12.0));
  if (masterTime >= 120.0) sceneIndex = 9;
  const currentScene = SCENES_DATA[sceneIndex];
  const sceneProgress = clamp((masterTime - currentScene.start) / 12.0, 0.0, 1.0);

  // Dynamic Camera Paths across the 10 scenes
  let camPos = { x: 0, y: 14, z: 28 };
  let camTarget = { x: 0, y: 3, z: 0 };
  let camFov = 42;

  if (sceneIndex === 0) {
    // Scene 1 (0-12s): Farm Intro - sweeping gliding shot from wide down towards electronics
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(-14, -4, p),
      y: lerp(16, 9, p),
      z: lerp(26, 18, p)
    };
    camTarget = {
      x: lerp(0, 2, p),
      y: lerp(3, 2, p),
      z: lerp(0, 2, p)
    };
  } else if (sceneIndex === 1) {
    // Scene 2 (12-24s): Hardware Architecture - crisp medium angle inspecting ESP32, sensors & breadboard
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(-6, 2, p),
      y: lerp(10, 11, p),
      z: lerp(18, 16, p)
    };
    camTarget = {
      x: lerp(1, 4, p),
      y: lerp(1.5, 1.8, p),
      z: lerp(2, 3, p)
    };
  } else if (sceneIndex === 2) {
    // Scene 3 (24-36s): Sensor Monitoring - close-up on soil bed & moisture probe entering
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(3, 6, p),
      y: lerp(7, 6, p),
      z: lerp(12, 10, p)
    };
    camTarget = {
      x: lerp(2, 1, p),
      y: lerp(2, 2.2, p),
      z: lerp(1, 0, p)
    };
  } else if (sceneIndex === 3) {
    // Scene 4 (36-48s): NPK + MAX485 - angle focusing on NPK steel probes & MAX485 module
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(8, 5, p),
      y: lerp(6, 7, p),
      z: lerp(11, 13, p)
    };
    camTarget = {
      x: lerp(2, 4, p),
      y: lerp(1.8, 1.5, p),
      z: lerp(0, 2, p)
    };
  } else if (sceneIndex === 4) {
    // Scene 5 (48-60s): ESP32 Data Processing - close zoom onto ESP32 microcontroller
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(4.5, 3.8, p),
      y: lerp(5.5, 5.0, p),
      z: lerp(9.5, 8.5, p)
    };
    camTarget = {
      x: 3.5,
      y: 1.6,
      z: 3.0
    };
    camFov = 38;
  } else if (sceneIndex === 5) {
    // Scene 6 (60-72s): Wi-Fi Wireless Transmission - elevated angle showing antenna radiating outwards
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(2, -2, p),
      y: lerp(10, 13, p),
      z: lerp(16, 20, p)
    };
    camTarget = {
      x: 2.5,
      y: 2.0,
      z: 2.0
    };
  } else if (sceneIndex === 6) {
    // Scene 7 (72-84s): Software Dashboard - wide isometric showcase with dashboard layer
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(-12, -8, p),
      y: lerp(14, 15, p),
      z: lerp(22, 24, p)
    };
    camTarget = {
      x: 0,
      y: 2.5,
      z: 0
    };
  } else if (sceneIndex === 7) {
    // Scene 8 (84-96s): AI Analysis & Yield Prediction - futuristic analytics perspective
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(0, 6, p),
      y: lerp(13, 14, p),
      z: lerp(22, 20, p)
    };
    camTarget = {
      x: 1,
      y: 3.0,
      z: 0
    };
  } else if (sceneIndex === 8) {
    // Scene 9 (96-108s): Automatic Irrigation Decision - focusing on dry soil, relay click & pump
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(-6, -2, p),
      y: lerp(9, 8, p),
      z: lerp(17, 14, p)
    };
    camTarget = {
      x: lerp(-2, 1, p),
      y: lerp(2, 2, p),
      z: lerp(1, 2, p)
    };
  } else if (sceneIndex === 9) {
    // Scene 10 (108-120s): Pump ON, Water flowing, Rehydration & Grand Finale Wide
    const p = smoothstep(0, 1, sceneProgress);
    camPos = {
      x: lerp(-1, 0, p),
      y: lerp(8, 14, p),
      z: lerp(14, 25, p)
    };
    camTarget = {
      x: 0,
      y: lerp(2, 2.5, p),
      z: 0
    };
  }

  // Soil Moisture curve across timeline
  // Scene 1-8: steady around 28%
  // Scene 9: dry soil progression: 45% -> 35% -> 28%
  // Scene 10: irrigation active -> 28% -> 40% -> 55% -> 70%
  let soilMoisture = 28;
  if (masterTime >= 96.0 && masterTime < 104.0) {
    // Scene 9 drying down
    const p = (masterTime - 96.0) / 8.0;
    soilMoisture = Math.round(lerp(45, 28, p));
  } else if (masterTime >= 104.0 && masterTime < 108.0) {
    soilMoisture = 28;
  } else if (masterTime >= 108.0) {
    // Scene 10 rehydrating: 28% -> 40% -> 55% -> 70%
    const p = Math.min(1.0, (masterTime - 108.0) / 9.0);
    soilMoisture = Math.round(lerp(28, 70, smoothstep(0, 1, p)));
  }

  // Actuator States
  // Relay switches ON at t=104s in Scene 9 (detection of low moisture), stays ON during pump actuation, turns OFF at t=116s
  const relayActive = (masterTime >= 104.0 && masterTime <= 116.5);
  // Pump runs from t=108.0s to t=116.0s
  const pumpActive = (masterTime >= 108.0 && masterTime <= 116.0);
  const waterFlowing = pumpActive;

  // Sensor reading values
  const temperature = 29.8;
  const humidity = 44;
  const pH = 6.4;
  const nitrogen = 42;
  const phosphorus = 19;
  const potassium = 158;

  // Crop health & yield metrics
  const cropHealth = 88;
  const predictedYield = "+11.2%";

  return {
    masterTime,
    sceneIndex,
    currentScene,
    sceneProgress,
    camera: {
      position: camPos,
      target: camTarget,
      fov: camFov
    },
    telemetry: {
      soilMoisture,
      temperature,
      humidity,
      pH,
      npk: { n: nitrogen, p: phosphorus, k: potassium }
    },
    actuators: {
      relayActive,
      pumpActive,
      waterFlowing,
      reservoirLevel: masterTime >= 108.0 ? Math.max(0.72, 1.0 - (masterTime - 108.0) * 0.03) : 1.0,
      soilHydration: masterTime >= 108.0 ? Math.min(1.0, (masterTime - 108.0) / 8.0) : (masterTime >= 96.0 ? 0.1 : 0.4)
    },
    visualSignals: {
      probeLowering: sceneIndex === 2 ? smoothstep(0.1, 0.6, sceneProgress) : 1.0,
      rs485Packets: sceneIndex === 3,
      esp32CorePulse: sceneIndex === 4,
      wifiRays: sceneIndex === 5,
      dashboardOverlay: sceneIndex === 6,
      aiAnalysisOverlay: sceneIndex === 7,
      lowMoistureAlert: (sceneIndex === 8 && masterTime >= 100.0) || (sceneIndex === 9 && masterTime <= 111.0),
      grandFinaleText: (sceneIndex === 9 && masterTime >= 115.0)
    },
    aiMetrics: {
      cropHealth,
      predictedYield
    }
  };
}
