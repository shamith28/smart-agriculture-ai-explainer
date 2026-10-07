/* ==========================================================================
   AI-POWERED SMART AGRICULTURE - 3D THREE.JS SCENE & COMPOSITED 2D HUD
   ========================================================================== */

import { getTimelineState, TOTAL_DURATION } from './timeline.js';

export class SmartFarmAnimation {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.width = 1280;
    this.height = 720;
    
    // Create offscreen WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 2D 1280x720 Composition Canvas (draws 3D WebGL frame + 2D overlays)
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.015);

    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 1000);
    
    // Animated objects references
    this.animatedObjects = {};

    this.initLights();
    this.initEnvironment();
    this.initPlants();
    this.initIrrigation();
    this.initElectronics();
    this.initDataEffects();
  }

  initLights() {
    // Ambient soft fill
    const ambientLight = new THREE.AmbientLight(0x1a2639, 1.2);
    this.scene.add(ambientLight);

    // Main Sunlight (Warm, cast shadows)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(-15, 25, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 70;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Cyan Technology Rim Light
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.1);
    rimLight.position.set(18, 12, -15);
    this.scene.add(rimLight);

    // Emerald Grow-Light Accent above farm
    const growLight = new THREE.PointLight(0x10b981, 1.4, 25);
    growLight.position.set(-2, 8, 0);
    this.scene.add(growLight);
  }

  initEnvironment() {
    // Floor Grid Surface (Cyber-agri aesthetic)
    const gridHelper = new THREE.GridHelper(60, 40, 0x059669, 0x1e293b);
    gridHelper.position.y = -0.05;
    this.scene.add(gridHelper);

    // Workbench Table Base
    const tableGeo = new THREE.BoxGeometry(28, 0.8, 18);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      roughness: 0.4,
      metalness: 0.6
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, -0.4, 0);
    table.receiveShadow = true;
    this.scene.add(table);

    // Farm Planter Box (Wooden / High-Tech Planter Bed)
    const planterGeo = new THREE.BoxGeometry(12, 2.2, 8);
    const planterMat = new THREE.MeshStandardMaterial({
      color: 0x271911,
      roughness: 0.8,
      metalness: 0.1
    });
    const planter = new THREE.Mesh(planterGeo, planterMat);
    planter.position.set(-6, 1.1, 0);
    planter.castShadow = true;
    planter.receiveShadow = true;
    this.scene.add(planter);

    // Soil Bed
    const soilGeo = new THREE.BoxGeometry(11.4, 1.9, 7.4);
    this.soilMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1d15, // Drier loam color default
      roughness: 0.95,
      metalness: 0.05,
      bumpScale: 0.05
    });
    this.soilMesh = new THREE.Mesh(soilGeo, this.soilMaterial);
    this.soilMesh.position.set(-6, 1.25, 0);
    this.soilMesh.receiveShadow = true;
    this.scene.add(this.soilMesh);

    // Electronics Platform (Raised high-tech base)
    const elecBaseGeo = new THREE.BoxGeometry(11, 0.4, 14);
    const elecBaseMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.8
    });
    const elecBase = new THREE.Mesh(elecBaseGeo, elecBaseMat);
    elecBase.position.set(6.5, 0.2, 0);
    elecBase.receiveShadow = true;
    this.scene.add(elecBase);
  }

  initPlants() {
    this.plantGroup = new THREE.Group();
    this.scene.add(this.plantGroup);

    // Create 3 rows of healthy agricultural crops
    const plantPositions = [
      { x: -9.5, z: -2.2, scale: 0.95 },
      { x: -6.0, z: -2.2, scale: 1.05 },
      { x: -2.5, z: -2.2, scale: 0.98 },
      { x: -9.5, z: 1.8, scale: 1.02 },
      { x: -6.0, z: 1.8, scale: 1.1 },
      { x: -2.5, z: 1.8, scale: 0.96 }
    ];

    this.plants = [];

    plantPositions.forEach((pos, idx) => {
      const plant = new THREE.Group();
      plant.position.set(pos.x, 2.2, pos.z);

      // Main Stem
      const stemGeo = new THREE.CylinderGeometry(0.08, 0.14, 2.4, 8);
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0x2e7d32,
        roughness: 0.6
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 1.2;
      stem.castShadow = true;
      plant.add(stem);

      // Leaves at varying heights and rotations
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x388e3c,
        roughness: 0.45,
        side: THREE.DoubleSide
      });

      const leafGeo = new THREE.SphereGeometry(0.5, 7, 7);
      leafGeo.scale(1.2, 0.15, 0.6);

      const leafCount = 8;
      for (let i = 0; i < leafCount; i++) {
        const leafMesh = new THREE.Mesh(leafGeo, leafMat);
        const yPos = 0.6 + (i / leafCount) * 1.6;
        const angle = i * 1.9;
        leafMesh.position.set(
          Math.cos(angle) * 0.45,
          yPos,
          Math.sin(angle) * 0.45
        );
        leafMesh.rotation.y = angle;
        leafMesh.rotation.z = 0.35 * (i % 2 === 0 ? 1 : -1);
        leafMesh.castShadow = true;
        plant.add(leafMesh);
      }

      plant.scale.set(pos.scale, pos.scale, pos.scale);
      this.plantGroup.add(plant);
      this.plants.push({ mesh: plant, baseScale: pos.scale, seed: idx * 1.5 });
    });
  }

  initIrrigation() {
    // Water Reservoir Tank (Transparent Acrylic)
    const tankGeo = new THREE.BoxGeometry(3.5, 4.0, 3.5);
    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.45,
      metalness: 0.1
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-6, 2.0, -6.5);
    tank.castShadow = true;
    this.scene.add(tank);

    // Water Volume Inside Tank
    const waterGeo = new THREE.BoxGeometry(3.3, 3.2, 3.3);
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85
    });
    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMat);
    this.waterMesh.position.set(-6, 1.7, -6.5);
    this.scene.add(this.waterMesh);

    // Submersible Mini DC Water Pump in Reservoir
    const pumpGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.2, 12);
    const pumpMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3
    });
    this.pumpMesh = new THREE.Mesh(pumpGeo, pumpMat);
    this.pumpMesh.rotation.z = Math.PI / 2;
    this.pumpMesh.position.set(-6, 0.7, -6.5);
    this.pumpMesh.castShadow = true;
    this.scene.add(this.pumpMesh);

    // Pump Outlet Barb & Nozzle
    const barbGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8);
    const barbMesh = new THREE.Mesh(barbGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    barbMesh.position.set(-6, 1.3, -6.5);
    this.scene.add(barbMesh);

    // Flexible Drip Irrigation Tubing
    // Curves from pump barb up, over into soil bed, and splits along crop rows
    const tubePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, 1.3, -6.5),
      new THREE.Vector3(-6, 2.5, -4.5),
      new THREE.Vector3(-6, 2.3, -1.0),
      new THREE.Vector3(-9.5, 2.25, -2.2),
      new THREE.Vector3(-6.0, 2.25, -2.2),
      new THREE.Vector3(-2.5, 2.25, -2.2),
      new THREE.Vector3(-2.5, 2.25, 1.8),
      new THREE.Vector3(-6.0, 2.25, 1.8),
      new THREE.Vector3(-9.5, 2.25, 1.8)
    ]);
    const tubeGeo = new THREE.TubeGeometry(tubePath, 64, 0.08, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.4
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.castShadow = true;
    this.scene.add(tubeMesh);

    // Drip Emitters at plant bases
    this.emitters = [
      new THREE.Vector3(-9.5, 2.25, -2.2),
      new THREE.Vector3(-6.0, 2.25, -2.2),
      new THREE.Vector3(-2.5, 2.25, -2.2),
      new THREE.Vector3(-9.5, 2.25, 1.8),
      new THREE.Vector3(-6.0, 2.25, 1.8),
      new THREE.Vector3(-2.5, 2.25, 1.8)
    ];

    // Animated Water Spray Particles
    const particleCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      pPos[i] = 0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.9
    });
    this.waterParticles = new THREE.Points(pGeo, pMat);
    this.waterParticles.visible = false;
    this.scene.add(this.waterParticles);
  }

  initElectronics() {
    this.hardwarePositions = {};

    // 1. Dual Solderless Breadboard
    const bbGeo = new THREE.BoxGeometry(6.5, 0.4, 9.5);
    const bbMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.5
    });
    const breadboard = new THREE.Mesh(bbGeo, bbMat);
    breadboard.position.set(6.5, 0.6, 1.5);
    breadboard.castShadow = true;
    breadboard.receiveShadow = true;
    this.scene.add(breadboard);

    // 2. ESP32 Development Board (ESP-WROOM-32)
    const espGroup = new THREE.Group();
    espGroup.position.set(4.8, 0.9, 1.2);
    this.hardwarePositions.esp32 = espGroup.position;

    // PCB
    const pcbGeo = new THREE.BoxGeometry(2.4, 0.1, 4.2);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Dark solder mask green
      roughness: 0.3,
      metalness: 0.5
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    espGroup.add(pcb);

    // Metallic RF Shield Can
    const shieldGeo = new THREE.BoxGeometry(1.6, 0.22, 1.8);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.9,
      roughness: 0.2
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0.15, 0.3);
    espGroup.add(shield);

    // PCB Meandered Inverted-F Wi-Fi Antenna Trace (Gold)
    const antGeo = new THREE.BoxGeometry(1.4, 0.05, 0.7);
    const antMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.1
    });
    const antMesh = new THREE.Mesh(antGeo, antMat);
    antMesh.position.set(0, 0.08, -1.5);
    espGroup.add(antMesh);

    // Red Power LED
    const redLedGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8);
    const redLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const redLed = new THREE.Mesh(redLedGeo, redLedMat);
    redLed.position.set(-0.8, 0.12, -0.6);
    espGroup.add(redLed);

    // Blue/Cyan Status LED
    this.espStatusLedMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const blueLed = new THREE.Mesh(redLedGeo, this.espStatusLedMat);
    blueLed.position.set(0.8, 0.12, -0.6);
    espGroup.add(blueLed);

    this.scene.add(espGroup);

    // 3. Capacitive Soil Moisture Sensor v1.2
    const soilSensorGroup = new THREE.Group();
    soilSensorGroup.position.set(-2.0, 2.5, 0.5);
    this.hardwarePositions.moisture = soilSensorGroup.position;

    const probeGeo = new THREE.BoxGeometry(0.4, 2.0, 0.08);
    const probeMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.4
    });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    soilSensorGroup.add(probe);

    // Gold capacitor traces on probe tip
    const goldTrace = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.2, 0.09),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
    );
    goldTrace.position.y = -0.3;
    soilSensorGroup.add(goldTrace);

    this.soilSensorGroup = soilSensorGroup;
    this.scene.add(soilSensorGroup);

    // 4. DHT22 Temperature & Humidity Sensor
    const dhtGroup = new THREE.Group();
    dhtGroup.position.set(-0.8, 2.7, -3.2);
    this.hardwarePositions.dht22 = dhtGroup.position;

    // White vented plastic casing
    const dhtBodyGeo = new THREE.BoxGeometry(1.0, 1.4, 0.6);
    const dhtBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3
    });
    const dhtBody = new THREE.Mesh(dhtBodyGeo, dhtBodyMat);
    dhtGroup.add(dhtBody);

    // Grill slats
    for (let s = -0.4; s <= 0.4; s += 0.2) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.06, 0.62),
        new THREE.MeshStandardMaterial({ color: 0x64748b })
      );
      slat.position.y = s;
      dhtGroup.add(slat);
    }
    this.scene.add(dhtGroup);

    // 5. Soil pH Sensor & Probe
    const phGroup = new THREE.Group();
    phGroup.position.set(-3.8, 2.4, 2.8);
    this.hardwarePositions.ph = phGroup.position;

    const phShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 2.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    phGroup.add(phShaft);

    // Glass electrode bulb tip
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transmission: 0.8, roughness: 0.1 })
    );
    bulb.position.y = -1.0;
    phGroup.add(bulb);
    this.scene.add(phGroup);

    // 6. Industrial NPK Soil Nutrient Sensor
    const npkGroup = new THREE.Group();
    npkGroup.position.set(-8.2, 2.5, 0.2);
    this.hardwarePositions.npk = npkGroup.position;

    // Cylindrical rugged body
    const npkBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.6, roughness: 0.4 })
    );
    npkGroup.add(npkBody);

    // 3 Stainless Steel Probes
    [-0.18, 0, 0.18].forEach(xOff => {
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8),
        new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.95, roughness: 0.1 })
      );
      pin.position.set(xOff, -1.2, 0);
      npkGroup.add(pin);
    });
    this.scene.add(npkGroup);

    // 7. MAX485 RS485 Module
    const maxGroup = new THREE.Group();
    maxGroup.position.set(8.2, 0.9, 0.5);
    this.hardwarePositions.max485 = maxGroup.position;

    const maxPcb = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 }) // Blue PCB
    );
    maxGroup.add(maxPcb);

    // Screw terminal block
    const terminal = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    terminal.position.set(0, 0.28, -0.7);
    maxGroup.add(terminal);

    // MAX485 DIP-8 IC
    const ic = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 })
    );
    ic.position.set(0, 0.15, 0.2);
    maxGroup.add(ic);
    this.scene.add(maxGroup);

    // 8. 5V Relay Module (Songle Relay Cube)
    const relayGroup = new THREE.Group();
    relayGroup.position.set(7.5, 0.9, 4.2);
    this.hardwarePositions.relay = relayGroup.position;

    const relayPcb = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.1, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x047857 })
    );
    relayGroup.add(relayPcb);

    // Blue Songle Relay Box
    const relayCube = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 1.1, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    relayCube.position.set(0, 0.6, -0.3);
    relayGroup.add(relayCube);

    // Relay Actuation LED (red off, bright green on)
    this.relayLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const relayLed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8),
      this.relayLedMat
    );
    relayLed.position.set(0.6, 0.15, 0.8);
    relayGroup.add(relayLed);
    this.scene.add(relayGroup);

    // 9. 5V Breadboard Power Supply Module
    const psuGroup = new THREE.Group();
    psuGroup.position.set(8.5, 0.9, -2.8);
    const psuPcb = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.1, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    );
    psuGroup.add(psuPcb);
    // Push button switch
    const psuBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0xd97706 })
    );
    psuBtn.position.set(0, 0.2, 0);
    psuGroup.add(psuBtn);
    this.scene.add(psuGroup);

    // 10. Dupont Jumper Wires (Catenary curves)
    this.initWires();
  }

  initWires() {
    const wirePaths = [
      // Moisture sensor -> ESP32 ADC
      [new THREE.Vector3(-2.0, 2.6, 0.5), new THREE.Vector3(1.0, 1.8, 1.0), new THREE.Vector3(4.2, 1.0, 1.2), 0xf59e0b],
      // DHT22 -> ESP32 GPIO
      [new THREE.Vector3(-0.8, 2.8, -3.2), new THREE.Vector3(2.5, 2.0, -1.0), new THREE.Vector3(4.4, 1.0, 0.5), 0x3b82f6],
      // MAX485 -> ESP32 RX/TX
      [new THREE.Vector3(7.8, 1.0, 0.5), new THREE.Vector3(6.5, 1.4, 0.8), new THREE.Vector3(5.6, 1.0, 1.2), 0x10b981],
      // ESP32 GPIO -> Relay IN
      [new THREE.Vector3(5.2, 1.0, 2.8), new THREE.Vector3(6.2, 1.3, 3.5), new THREE.Vector3(7.2, 1.0, 4.2), 0xa855f7],
      // Relay NO/COM -> Pump
      [new THREE.Vector3(7.6, 1.0, 5.0), new THREE.Vector3(1.0, 1.2, -1.0), new THREE.Vector3(-5.5, 1.0, -6.5), 0xef4444]
    ];

    wirePaths.forEach(([p1, pMid, p2, color]) => {
      const curve = new THREE.CatmullRomCurve3([p1, pMid, p2]);
      const wireGeo = new THREE.TubeGeometry(curve, 32, 0.045, 6, false);
      const wireMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.5
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      this.scene.add(wireMesh);
    });
  }

  initDataEffects() {
    // Glowing Digital Packets along RS485 Bus (Scene 4)
    const packetGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    this.rs485Packet = new THREE.Mesh(packetGeo, packetMat);
    this.rs485Packet.visible = false;
    this.scene.add(this.rs485Packet);

    // Wi-Fi Waves Rings (Scene 6)
    this.wifiRings = [];
    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.RingGeometry(0.8 * (r + 1), 0.85 * (r + 1), 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(4.8, 1.2, -0.3);
      this.scene.add(ringMesh);
      this.wifiRings.push(ringMesh);
    }
  }

  render(masterTime) {
    const state = getTimelineState(masterTime);

    // 1. Update Camera Position & Target
    this.camera.position.set(state.camera.position.x, state.camera.position.y, state.camera.position.z);
    this.camera.lookAt(state.camera.target.x, state.camera.target.y, state.camera.target.z);
    this.camera.fov = state.camera.fov;
    this.camera.updateProjectionMatrix();

    // 2. Plants gentle wind sway & hydration perk
    const breeze = Math.sin(masterTime * 2.2) * 0.04;
    this.plants.forEach(p => {
      p.mesh.rotation.z = breeze + Math.sin(masterTime * 1.8 + p.seed) * 0.02;
      // When rehydrated, plant perks up slightly
      const perkScale = state.actuators.soilHydration * 0.08;
      p.mesh.scale.set(p.baseScale + perkScale, p.baseScale + perkScale, p.baseScale + perkScale);
    });

    // 3. Soil moisture color update (Darkens with hydration)
    const hyd = state.actuators.soilHydration;
    // Dry: 0x2a1d15, Wet: 0x120c08
    this.soilMaterial.color.setRGB(
      0.16 * (1.0 - hyd * 0.55),
      0.11 * (1.0 - hyd * 0.60),
      0.08 * (1.0 - hyd * 0.65)
    );

    // 4. Reservoir water level lowering
    this.waterMesh.scale.y = state.actuators.reservoirLevel;
    this.waterMesh.position.y = 0.1 + 1.6 * state.actuators.reservoirLevel;

    // 5. Relay & Pump LED states
    if (state.actuators.relayActive) {
      this.relayLedMat.color.setHex(0x10b981); // Bright Green ON
    } else {
      this.relayLedMat.color.setHex(0xef4444); // Red OFF
    }

    // 6. ESP32 Blue LED blink / pulse
    if (state.visualSignals.wifiRays || state.visualSignals.esp32CorePulse) {
      const blink = (Math.sin(masterTime * 18.0) > 0);
      this.espStatusLedMat.color.setHex(blink ? 0x06b6d4 : 0x022c22);
    } else {
      this.espStatusLedMat.color.setHex(0x06b6d4);
    }

    // 7. Water spray particles when pump is ON
    if (state.actuators.waterFlowing) {
      this.waterParticles.visible = true;
      const positions = this.waterParticles.geometry.attributes.position.array;
      const tSeed = masterTime * 35.0;
      for (let i = 0; i < this.emitters.length; i++) {
        const emit = this.emitters[i];
        for (let j = 0; j < 30; j++) {
          const pIdx = (i * 30 + j) * 3;
          const dropTime = (tSeed + j * 1.7) % 1.0;
          positions[pIdx] = emit.x + (Math.sin(j * 3.1) * 0.25 * dropTime);
          positions[pIdx + 1] = emit.y - (dropTime * 0.65);
          positions[pIdx + 2] = emit.z + (Math.cos(j * 2.3) * 0.25 * dropTime);
        }
      }
      this.waterParticles.geometry.attributes.position.needsUpdate = true;
    } else {
      this.waterParticles.visible = false;
    }

    // 8. RS485 Data Packets (Scene 4)
    if (state.visualSignals.rs485Packets) {
      this.rs485Packet.visible = true;
      const pT = (masterTime * 2.5) % 1.0;
      this.rs485Packet.position.lerpVectors(
        new THREE.Vector3(-8.2, 2.5, 0.2), // NPK
        new THREE.Vector3(8.2, 1.0, 0.5),  // MAX485
        pT
      );
      this.rs485Packet.position.y += Math.sin(pT * Math.PI) * 0.8;
    } else {
      this.rs485Packet.visible = false;
    }

    // 9. Wi-Fi Radiating Waves (Scene 6)
    if (state.visualSignals.wifiRays) {
      this.wifiRings.forEach((ring, idx) => {
        const phase = ((masterTime * 1.5) + (idx * 0.25)) % 1.0;
        ring.scale.set(1 + phase * 2.2, 1 + phase * 2.2, 1);
        ring.material.opacity = (1.0 - phase) * 0.85;
      });
    } else {
      this.wifiRings.forEach(ring => { ring.material.opacity = 0.0; });
    }

    // Render 3D WebGL Scene
    this.renderer.render(this.scene, this.camera);

    // =========================================================================
    // 2D CANVAS COMPOSITION (HUD, TITLES, GAUGES, OVERLAYS)
    // =========================================================================
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw rendered 3D buffer
    this.ctx.drawImage(this.renderer.domElement, 0, 0, this.width, this.height);

    // Render All Presentation Overlays
    this.renderHUDOverlays(state);
  }

  renderHUDOverlays(state) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // --- 1. TOP HEADER BANNER ---
    ctx.save();
    // Top gradient bar
    const topGrad = ctx.createLinearGradient(0, 0, 0, 90);
    topGrad.addColorStop(0, "rgba(9, 13, 22, 0.95)");
    topGrad.addColorStop(1, "rgba(9, 13, 22, 0.0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, 90);

    // Scene badge & title
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText(`SCENE 0${state.sceneIndex + 1} / 10`, 35, 32);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px 'Inter', sans-serif";
    ctx.fillText(state.currentScene.name, 35, 58);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 13px 'Inter', sans-serif";
    ctx.fillText(state.currentScene.subtitle, 35, 78);

    // Right project watermark badge
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.fillRect(w - 290, 18, 255, 32);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(w - 290, 18, 255, 32);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 11px 'Inter', sans-serif";
    ctx.fillText("AI-POWERED SMART AGRICULTURE", w - 45, 38);
    ctx.restore();

    // --- 2. HARDWARE ANNOTATION CALLOUTS (Scene 2) ---
    if (state.sceneIndex === 1) {
      this.drawCallout(state, "ESP32 CONTROLLER", 4.8, 1.2, 1.2, 850, 220);
      this.drawCallout(state, "SOIL MOISTURE v1.2", -2.0, 2.5, 0.5, 280, 260);
      this.drawCallout(state, "DHT22 TEMP/HUMIDITY", -0.8, 2.7, -3.2, 340, 150);
      this.drawCallout(state, "NPK 3-PROBE SENSOR", -8.2, 2.5, 0.2, 150, 360);
      this.drawCallout(state, "MAX485 RS485 INTERFACE", 8.2, 1.0, 0.5, 960, 340);
      this.drawCallout(state, "5V RELAY ACTUATOR", 7.5, 1.0, 4.2, 920, 460);
    }

    // --- 3. LIVE TELEMETRY HUD (Scene 3 to 10) ---
    if (state.sceneIndex >= 2 && state.sceneIndex !== 6 && state.sceneIndex !== 7) {
      this.drawSideTelemetryCard(state);
    }

    // --- 4. SCENE 4: NPK + RS485 DIAGRAM OVERLAY ---
    if (state.sceneIndex === 3) {
      this.drawRS485Diagram(state);
    }

    // --- 5. SCENE 5: ESP32 PROCESSING ARCHITECTURE ---
    if (state.sceneIndex === 4) {
      this.drawESP32Architecture(state);
    }

    // --- 6. SCENE 6: WI-FI WIRELESS STREAMING OVERLAY ---
    if (state.sceneIndex === 5) {
      this.drawWifiStreamOverlay(state);
    }

    // --- 7. SCENE 7: FULL SOFTWARE DASHBOARD ---
    if (state.sceneIndex === 6) {
      this.drawFullDashboard(state);
    }

    // --- 8. SCENE 8: INTELLIGENT AI ENGINE & CROP YIELD PREDICTION ---
    if (state.sceneIndex === 7) {
      this.drawAIPredictionEngine(state);
    }

    // --- 9. SCENE 9: IRRIGATION ALERT OVERLAY ---
    if (state.sceneIndex === 8) {
      this.drawIrrigationAlert(state);
    }

    // --- 10. SCENE 10: PUMP ACTIVE & REHYDRATION METER ---
    if (state.sceneIndex === 9) {
      this.drawPumpRehydrationOverlay(state);
    }

    // --- 11. SUBTITLES & NARRATION CAPTION BAR ---
    this.drawCaptionBar(state);

    // --- 12. BOTTOM MASTER TIMELINE PROGRESS SCRUBBER ---
    this.drawBottomTimeline(state);
  }

  drawCallout(state, text, wx, wy, wz, sx, sy) {
    const ctx = this.ctx;
    ctx.save();
    // Leader line
    ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 35, sy - 25);
    ctx.lineTo(sx + 150, sy - 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dot at source
    ctx.fillStyle = "#06b6d4";
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Box label
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(sx + 35, sy - 42, 130, 22);
    ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
    ctx.strokeRect(sx + 35, sy - 42, 130, 22);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px 'Inter', sans-serif";
    ctx.fillText(text, sx + 42, sy - 27);
    ctx.restore();
  }

  drawSideTelemetryCard(state) {
    const ctx = this.ctx;
    const x = 35;
    const y = 100;
    const w = 210;
    const h = 265;

    ctx.save();
    // Glassmorphic background
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Title
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 11px 'Inter', sans-serif";
    ctx.fillText("LIVE SENSOR TELEMETRY", x + 15, y + 25);

    // Soil Moisture Circular Ring Gauge
    const cx = x + 60;
    const cy = y + 75;
    const r = 26;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 6;
    ctx.stroke();

    const moistureAngle = (state.telemetry.soilMoisture / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + moistureAngle);
    ctx.strokeStyle = state.telemetry.soilMoisture < 30 ? "#f59e0b" : "#10b981";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 15px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${state.telemetry.soilMoisture}%`, cx, cy + 5);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillText("MOISTURE", cx, cy + 18);

    // Right quick readings
    ctx.textAlign = "left";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("TEMP:", x + 120, y + 65);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText(`${state.telemetry.temperature}°C`, x + 120, y + 80);

    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("HUMIDITY:", x + 120, y + 105);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText(`${state.telemetry.humidity}%`, x + 120, y + 120);

    // pH & NPK divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 140);
    ctx.lineTo(x + w - 15, y + 140);
    ctx.stroke();

    // pH Value
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillText("SOIL pH:", x + 15, y + 162);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText(`${state.telemetry.pH} (Optimal)`, x + 85, y + 162);

    // NPK Bars
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'Inter', sans-serif";
    ctx.fillText("NPK NUTRIENTS (mg/kg):", x + 15, y + 185);

    const nutrients = [
      { name: "N", val: state.telemetry.npk.n, max: 80, col: "#10b981" },
      { name: "P", val: state.telemetry.npk.p, max: 40, col: "#3b82f6" },
      { name: "K", val: state.telemetry.npk.k, max: 200, col: "#f59e0b" }
    ];

    nutrients.forEach((nut, i) => {
      const ny = y + 205 + i * 18;
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.fillText(nut.name, x + 15, ny);

      // Bar bg
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(x + 35, ny - 9, 110, 8);

      // Bar fill
      ctx.fillStyle = nut.col;
      const bw = Math.min(110, (nut.val / nut.max) * 110);
      ctx.fillRect(x + 35, ny - 9, bw, 8);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "9px 'Inter', sans-serif";
      ctx.fillText(`${nut.val}`, x + 155, ny);
    });

    ctx.restore();
  }

  drawRS485Diagram(state) {
    const ctx = this.ctx;
    ctx.save();
    const bx = 380;
    const by = 130;
    const bw = 520;
    const bh = 140;

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText("RS485 INDUSTRIAL DIFFERENTIAL COMMUNICATION", bx + 20, by + 28);

    const nodes = ["NPK SENSOR", "RS485 DATA (A/B)", "MAX485 MODULE", "ESP32 (UART2)"];
    nodes.forEach((node, idx) => {
      const nx = bx + 30 + idx * 125;
      const ny = by + 65;

      ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
      ctx.fillRect(nx, ny, 100, 36);
      ctx.strokeStyle = idx === 1 ? "#06b6d4" : "rgba(255, 255, 255, 0.2)";
      ctx.strokeRect(nx, ny, 100, 36);

      ctx.fillStyle = idx === 1 ? "#38bdf8" : "#f8fafc";
      ctx.font = "bold 9px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node, nx + 50, ny + 22);

      if (idx < 3) {
        ctx.fillStyle = "#06b6d4";
        ctx.font = "bold 14px 'Inter', sans-serif";
        ctx.fillText("➔", nx + 112, ny + 22);
      }
    });

    ctx.restore();
  }

  drawESP32Architecture(state) {
    const ctx = this.ctx;
    ctx.save();
    const bx = 380;
    const by = 130;
    const bw = 520;
    const bh = 140;

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText("ESP32 MICROCONTROLLER PIPELINE", bx + 20, by + 28);

    const stages = [
      { t: "DATA COLLECTION", sub: "ADC & Modbus RTU" },
      { t: "DATA PROCESSING", sub: "Kalman Filter & Calib" },
      { t: "DECISION LOGIC", sub: "Rule Engine & Wi-Fi" }
    ];

    stages.forEach((st, idx) => {
      const nx = bx + 30 + idx * 160;
      const ny = by + 55;

      ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
      ctx.fillRect(nx, ny, 140, 52);
      ctx.strokeStyle = "#10b981";
      ctx.strokeRect(nx, ny, 140, 52);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(st.t, nx + 70, ny + 24);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px 'Inter', sans-serif";
      ctx.fillText(st.sub, nx + 70, ny + 40);

      if (idx < 2) {
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 14px 'Inter', sans-serif";
        ctx.fillText("➔", nx + 150, ny + 32);
      }
    });

    ctx.restore();
  }

  drawWifiStreamOverlay(state) {
    const ctx = this.ctx;
    ctx.save();
    const bx = 380;
    const by = 130;
    const bw = 520;
    const bh = 130;

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText("2.4 GHz WI-FI TELEMETRY TRANSMISSION", bx + 20, by + 28);

    const hops = ["ESP32 Wi-Fi", "Wi-Fi Router / AP", "MQTT / REST API", "Live Dashboard"];
    hops.forEach((h, idx) => {
      const hx = bx + 25 + idx * 125;
      const hy = by + 58;

      ctx.fillStyle = "rgba(6, 182, 212, 0.1)";
      ctx.fillRect(hx, hy, 105, 42);
      ctx.strokeStyle = "#06b6d4";
      ctx.strokeRect(hx, hy, 105, 42);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 9px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(h, hx + 52, hy + 25);

      if (idx < 3) {
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 14px 'Inter', sans-serif";
        ctx.fillText("➔", hx + 115, hy + 25);
      }
    });

    ctx.restore();
  }

  drawFullDashboard(state) {
    const ctx = this.ctx;
    ctx.save();
    const bx = 160;
    const by = 90;
    const bw = 960;
    const bh = 510;

    // Glass backdrop
    ctx.fillStyle = "rgba(10, 15, 29, 0.92)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);

    // Dashboard Header
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.fillText("REAL-TIME SMART AGRICULTURE SOFTWARE DASHBOARD", bx + 30, by + 35);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'Inter', sans-serif";
    ctx.fillText("Node ID: ESP32-FARM-01 • Wi-Fi RSSI: -54 dBm • System Status: ONLINE", bx + 30, by + 55);

    // 4 Key Metric Cards
    const cards = [
      { label: "SOIL MOISTURE", val: "28%", sub: "Optimal range: 40-70%", col: "#f59e0b" },
      { label: "TEMPERATURE", val: "29.8°C", sub: "Microclimate normal", col: "#38bdf8" },
      { label: "HUMIDITY", val: "44%", sub: "RH steady", col: "#10b981" },
      { label: "SOIL pH", val: "6.4", sub: "Neutral nutrient absorption", col: "#a855f7" }
    ];

    cards.forEach((c, i) => {
      const cx = bx + 30 + i * 228;
      const cy = by + 75;
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.fillRect(cx, cy, 215, 80);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeRect(cx, cy, 215, 80);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.fillText(c.label, cx + 15, cy + 22);

      ctx.fillStyle = c.col;
      ctx.font = "bold 24px 'Inter', sans-serif";
      ctx.fillText(c.val, cx + 15, cy + 54);

      ctx.fillStyle = "#64748b";
      ctx.font = "9px 'Inter', sans-serif";
      ctx.fillText(c.sub, cx + 15, cy + 70);
    });

    // Time-Series Graph: Moisture & Temperature Trend
    const gx = bx + 30;
    const gy = by + 175;
    const gw = 540;
    const gh = 180;

    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(gx, gy, gw, gh);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText("MOISTURE & TEMPERATURE 24-HOUR TREND", gx + 15, gy + 24);

    // Draw Line graph
    ctx.beginPath();
    ctx.moveTo(gx + 20, gy + 120);
    const points = [120, 115, 110, 105, 95, 85, 90, 100, 115, 130, 140, 145];
    points.forEach((py, pi) => {
      ctx.lineTo(gx + 20 + pi * 44, gy + py);
    });
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Nutrients Card (NPK)
    const nx = bx + 600;
    const ny = by + 175;
    const nw = 330;
    const nh = 180;

    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fillRect(nx, ny, nw, nh);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(nx, ny, nw, nh);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText("NPK NUTRIENT ANALYSIS", nx + 15, ny + 24);

    const npkList = [
      { name: "Nitrogen (N)", val: "42 mg/kg", bar: 0.52, col: "#10b981" },
      { name: "Phosphorus (P)", val: "19 mg/kg", bar: 0.45, col: "#38bdf8" },
      { name: "Potassium (K)", val: "158 mg/kg", bar: 0.78, col: "#f59e0b" }
    ];

    npkList.forEach((item, idx) => {
      const iy = ny + 55 + idx * 40;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px 'Inter', sans-serif";
      ctx.fillText(item.name, nx + 15, iy);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(item.val, nx + nw - 15, iy);
      ctx.textAlign = "left";

      // Bar
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(nx + 15, iy + 6, nw - 30, 8);
      ctx.fillStyle = item.col;
      ctx.fillRect(nx + 15, iy + 6, (nw - 30) * item.bar, 8);
    });

    // Bottom system status bar
    ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
    ctx.fillRect(bx + 30, by + 375, bw - 60, 45);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
    ctx.strokeRect(bx + 30, by + 375, bw - 60, 45);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText("● SYSTEM STATUS: ACTIVE TELEMETRY LOGGING • PUMP RELAY: STANDBY", bx + 45, by + 402);

    ctx.restore();
  }

  drawAIPredictionEngine(state) {
    const ctx = this.ctx;
    ctx.save();
    const bx = 160;
    const by = 90;
    const bw = 960;
    const bh = 510;

    // Glass backdrop
    ctx.fillStyle = "rgba(10, 15, 29, 0.92)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);

    // AI Header
    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.fillText("INTELLIGENT ANALYSIS ENGINE & CROP YIELD PREDICTION", bx + 30, by + 35);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'Inter', sans-serif";
    ctx.fillText("Multi-Variable Agronomic Inference • Soil-Climate Synergy Model", bx + 30, by + 55);

    // Left: Neural Network Layer Nodes
    const nlx = bx + 50;
    const nly = by + 90;
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.fillText("FEATURE WEIGHT PROPAGATION", nlx, nly);

    const layerInputs = ["Moisture (28%)", "Temp (29.8°C)", "Humidity (44%)", "Soil pH (6.4)", "NPK Nutrients"];
    layerInputs.forEach((inp, idx) => {
      const iy = nly + 30 + idx * 45;
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.fillRect(nlx, iy, 140, 32);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
      ctx.strokeRect(nlx, iy, 140, 32);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.fillText(inp, nlx + 12, iy + 20);

      // Connecting neural lines
      ctx.strokeStyle = "rgba(139, 92, 246, 0.35)";
      ctx.beginPath();
      ctx.moveTo(nlx + 140, iy + 16);
      ctx.lineTo(nlx + 230, nly + 120);
      ctx.stroke();
    });

    // Hidden Dense Nodes
    for (let h = 0; h < 4; h++) {
      const hy = nly + 50 + h * 48;
      ctx.fillStyle = "#8b5cf6";
      ctx.beginPath();
      ctx.arc(nlx + 230, hy, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.beginPath();
      ctx.moveTo(nlx + 230, hy);
      ctx.lineTo(nlx + 340, nly + 120);
      ctx.stroke();
    }

    // Right: Health & Yield Big Meters
    const mx = bx + 470;
    const my = by + 90;

    // Crop Health Card
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fillRect(mx, my, 440, 140);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
    ctx.strokeRect(mx, my, 440, 140);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText("EVALUATED CROP HEALTH INDEX", mx + 25, my + 30);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 44px 'Inter', sans-serif";
    ctx.fillText("88 / 100", mx + 25, my + 82);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'Inter', sans-serif";
    ctx.fillText("Classification: VIGOROUS GROWTH (Minor moisture stress detected)", mx + 25, my + 115);

    // Crop Yield Prediction Card
    const yx = mx;
    const yy = my + 165;
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fillRect(yx, yy, 440, 140);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.strokeRect(yx, yy, 440, 140);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText("PROJECTED HARVEST YIELD", yx + 25, yy + 30);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 44px 'Inter', sans-serif";
    ctx.fillText("+11.2%", yx + 25, yy + 82);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'Inter', sans-serif";
    ctx.fillText("Baseline Delta: +11.2% over regional average under automated irrigation", yx + 25, yy + 115);

    ctx.restore();
  }

  drawIrrigationAlert(state) {
    const ctx = this.ctx;
    ctx.save();
    const bx = 360;
    const by = 110;
    const bw = 560;
    const bh = 145;

    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.fillText("⚠ AUTOMATIC IRRIGATION TRIGGER", bx + 25, by + 32);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText(`SOIL MOISTURE THRESHOLD VIOLATION: ${state.telemetry.soilMoisture}% (< 30% LIMIT)`, bx + 25, by + 62);

    // Relay State Indicator
    const relayText = state.actuators.relayActive ? "RELAY: [ON] (CIRCUIT CLOSED)" : "RELAY: [OFF -> SWITCHING]";
    ctx.fillStyle = state.actuators.relayActive ? "#10b981" : "#ef4444";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText(relayText, bx + 25, by + 92);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'Inter', sans-serif";
    ctx.fillText("ESP32 GPIO 23 pulsed HIGH -> Optocoupler energized -> 5V Submersible Pump Active", bx + 25, by + 120);

    ctx.restore();
  }

  drawPumpRehydrationOverlay(state) {
    const ctx = this.ctx;
    ctx.save();
    const bx = 360;
    const by = 110;
    const bw = 560;
    const bh = 145;

    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.fillText("● CLOSED-LOOP REHYDRATION IN PROGRESS", bx + 25, by + 32);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillText(`WATER PUMP: ${state.actuators.pumpActive ? "RUNNING (120 L/H)" : "OFF (TARGET RESTORED)"}`, bx + 25, by + 60);

    // Moisture Restoration Progress Bar
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillText("SOIL MOISTURE RESTORATION:", bx + 25, by + 88);

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(bx + 25, by + 98, 510, 14);

    const mPct = (state.telemetry.soilMoisture / 100);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(bx + 25, by + 98, 510 * mPct, 14);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px 'Inter', sans-serif";
    ctx.fillText(`${state.telemetry.soilMoisture}% (Target: 70%)`, bx + 25, by + 130);

    // Grand Finale Text at end of Scene 10
    if (state.visualSignals.grandFinaleText) {
      ctx.fillStyle = "rgba(2, 6, 23, 0.88)";
      ctx.fillRect(0, 200, this.width, 180);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
      ctx.strokeRect(0, 200, this.width, 180);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 34px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SMART AGRICULTURE", this.width / 2, 275);

      ctx.fillStyle = "#34d399";
      ctx.font = "600 20px 'Inter', sans-serif";
      ctx.fillText("Monitor • Analyze • Automate", this.width / 2, 320);
      ctx.textAlign = "left";
    }

    ctx.restore();
  }

  drawCaptionBar(state) {
    const ctx = this.ctx;
    const cx = 140;
    const cy = 605;
    const cw = 1000;
    const ch = 52;

    ctx.save();
    // Glassmorphic subtitle plate
    ctx.fillStyle = "rgba(9, 13, 22, 0.85)";
    ctx.fillRect(cx, cy, cw, ch);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx, cy, cw, ch);

    // Accent line
    ctx.fillStyle = "#10b981";
    ctx.fillRect(cx, cy, 4, ch);

    // Narration text wrapped
    ctx.fillStyle = "#f8fafc";
    ctx.font = "500 13px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(state.currentScene.narration, this.width / 2, cy + 31);
    ctx.restore();
  }

  drawBottomTimeline(state) {
    const ctx = this.ctx;
    const y = 695;
    const h = 8;
    const w = this.width;

    ctx.save();
    // Bar Background
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.fillRect(0, y, w, h);

    // Progress
    const prog = state.masterTime / TOTAL_DURATION;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "#10b981");
    grad.addColorStop(1, "#06b6d4");
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, w * prog, h);

    // Scene Tick marks
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    for (let i = 1; i < 10; i++) {
      const tx = (i / 10) * w;
      ctx.fillRect(tx - 1, y, 2, h);
    }
    ctx.restore();
  }
}
