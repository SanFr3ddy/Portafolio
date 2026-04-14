// Escena básica Three.js para ecosistema
let scene, camera, renderer;
// --- Fix: Declare missing globals ---
let avalancheParts = [];
let dogParts = [];
let sunnyMode = 'normal';
let tsunamiFoam = [];
// Texturas globales declaradas correctamente
let _hojasTexture = null;
let _desertTexture = null;
let _snowTexture = null;
let textureReady = false;
let modelsReady = false;
let ecosystemStarted = false;
let refreshedWithLoadedModels = false;
let currentWeather = 'sunny';
let ground, groundTexture, groundMaterial;
let river = null, riverMaterial = null;
let riverDetailParts = [];
let seaAtmosphereParts = [];
let sea = null;
let pond = null;
let pondSurfaceY = 0.2;
let pondFish = [];
let bridgeParts = [];
let houseParts = [];
let truckParts = [];
let trees = [];
let crowns = [];
let branches = [];
let treeTips = [];
let treeSnowCaps = [];
let leafClusters = [];
let winterDetails = [];
let bushes = [];
let bushSnowCaps = [];
let rocks = [];
let grassPatches = [];
let pathParts = [];
let garageParts = [];
let garageDestroyedByTsunami = false;
let backgroundBuildings = [];
let roofSurfaces = [];
let roofSnowParts = [];
let fireEffects = [];
let burningTrees = [];
let runner = null;
let runnerFire = null;
let runnerActive = false;
let runnerProgress = 0;
let runnerPath = [];

// Estado global de escena/biomas/clima (punto previo a shaders de postproceso)
let lightningLight = null;
let mouseControlsReady = false;
let worldMode = 'normal';
let tsunamiBeachLocked = false;
let weatherEffects = [];
let rainIntensity = 'normal';
let lightningEnabled = true;
let lightningFlashFrames = 0;
let winterMode = 'normal';
let fireMode = 'wildfire';
let windStrength = 0;
let sunnyWindDirection = { x: 1, z: 0 };
let windyObjects = [];
let tornadoDebris = [];

let tornadoCore = null;
let tornadoMouse = { hasTarget: false };

let pondDroplets = [];
let snowman = null;

let houseRoofMain = null;
let houseRoofHome = null;
let roofBlown = false;
let roofFlight = 0;
let roofGone = false;
let houseRoofDamaged = false;
let houseRoofDamageGroup = null;
let houseStrikeCooldown = 0;
let houseStrikePendingFrames = 0;
let houseLightningBolt = null;
let houseLightningBoltFrames = 0;
let seatedPerson = null;

let dogOwnerRescuer = null;
let dogRescueActive = false;
let dogRescueStage = 0;
const dogState = {
  mode: 'idle',
  target: null,
  speed: 0.045,
  legPhase: 0,
  wait: 80,
  lastDrink: 0,
  roamRadius: 13
};

let tsunamiWave = null;
let tsunamiActive = false;
let tsunamiBodies = [];
let floodWater = null;
let tsunamiWetTrail = null;
let volcanoGroup = null;
let lavaBlobs = [];

const WORLD_SIZE = 46;
const WORLD_HALF = WORLD_SIZE * 0.5;
const WORLD_OBJECT_RANGE = WORLD_SIZE - 2;
const WORLD_GRASS_RANGE = WORLD_SIZE - 1;
const WORLD_EFFECT_RANGE = WORLD_SIZE + 4;
const WORLD_DISASTER_X = WORLD_HALF + 3;

const HOUSE_POS = { x: 2.8, z: 3.2 };
const RIVER_CENTER_Z = -6;
const TSUNAMI_WATER_SPAN = WORLD_SIZE + 4;
const TSUNAMI_WET_MIN_Z = -TSUNAMI_WATER_SPAN * 0.5;
const TSUNAMI_WET_MAX_Z = TSUNAMI_WET_MIN_Z + TSUNAMI_WATER_SPAN;
const WATER_TIME = { value: 0 };
const WATER_STORM = { value: 0 };

const MODEL_BASE_PATH = 'assets/models/Models/GLTF format/';
const TREE_MODEL_FILES = [];
const ROCK_MODEL_FILES = [];
const BUSH_MODEL_FILES = [];
const modelsCache = {};

function init() {
  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, 1280/800, 0.1, 1000);
    camera.position.set(0, 10, 24);
    camera.lookAt(0,0,0);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene-canvas'), antialias: true });
    renderer.setClearColor(0x222222);
    renderer.setSize(1280, 800);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    // Luz ambiental y direccional
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    scene.add(dirLight);

    lightningLight = new THREE.PointLight(0xddeeff, 0, 50, 1.4);
    lightningLight.position.set(0, 12, -4);
    scene.add(lightningLight);

    // Plano base (terreno) con textura de pasto
    const loader = new THREE.TextureLoader();

    // Load hojas.png texture globally
    if (!_hojasTexture) {
      _hojasTexture = loader.load('../Materiales/hojas.png');
      _hojasTexture.wrapS = _hojasTexture.wrapT = THREE.RepeatWrapping;
      _hojasTexture.repeat.set(1.5, 1.5);
    }
    // Load desert texture
    if (!_desertTexture) {
      _desertTexture = loader.load('../Materiales/desieerto.png');
      _desertTexture.wrapS = _desertTexture.wrapT = THREE.RepeatWrapping;
      _desertTexture.repeat.set(6, 6);
    }
    // Load snow texture
    if (!_snowTexture) {
      _snowTexture = loader.load('../Materiales/nieve.png');
      _snowTexture.wrapS = _snowTexture.wrapT = THREE.RepeatWrapping;
      _snowTexture.repeat.set(6, 6);
    }
    preloadNatureModels(() => {
      modelsReady = true;
      tryBuildEcosystem();
    });

    loader.load('../Materiales/seamless_pbr_green_grass_ground_texture_with_small_white_flowers_and_leaves_4k_tile.png', function(texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(6, 6);
      groundTexture = texture;
      groundMaterial = new THREE.MeshStandardMaterial({ map: texture, color: 0x888866 });
      // Create uneven terrain
      const planeGeo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 64, 64);
      // Add base relief and some random mountain peaks
      const peaks = [
        { x: -8, z: -8, h: 1.2, r: 4 },
        { x: 7, z: 6, h: 0.9, r: 3.2 },
        { x: -10, z: 10, h: 0.7, r: 2.7 },
        { x: 10, z: -7, h: 1.1, r: 3.5 }
      ];
      for (let i = 0; i < planeGeo.attributes.position.count; i++) {
        const x = planeGeo.attributes.position.getX(i);
        const y = planeGeo.attributes.position.getY(i);
        const z = planeGeo.attributes.position.getZ(i);
        // Base relief
        let relief = 0.32 * Math.sin(x * 0.6) * Math.cos(z * 0.5) + 0.18 * Math.sin(z * 1.2 + x * 0.7);
        // Add mountain peaks
        for (const peak of peaks) {
          const dist = Math.sqrt((x - peak.x) ** 2 + (z - peak.z) ** 2);
          if (dist < peak.r) {
            relief += peak.h * Math.exp(-dist * dist / (2 * peak.r * peak.r));
          }
        }
        planeGeo.attributes.position.setY(i, y + relief);
      }
      planeGeo.computeVertexNormals();
      ground = new THREE.Mesh(planeGeo, groundMaterial);
      ground.rotation.x = -Math.PI/2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      scene.add(ground);
      textureReady = true;
      tryBuildEcosystem();
    }, undefined, function() {
      // Si falla la textura, usar color
      groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE), groundMaterial);
      ground.rotation.x = -Math.PI/2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      scene.add(ground);
      textureReady = true;
      tryBuildEcosystem();
    });

    function tryBuildEcosystem() {
      if (!textureReady || !modelsReady || ecosystemStarted) return;
      ecosystemStarted = true;
      addEcosystem();
      updateWeatherOptionVisibility();
      animate();
      document.getElementById('loading').style.display = 'none';
    }

    updateWeatherOptionVisibility();
    // Activar control de cámara con mouse
    setupMouseControls();

    // Resize (solo renderer/cámara)
    window.addEventListener('resize', () => {
      const w = window.innerWidth || 1280;
      const h = window.innerHeight || 800;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
  } catch (e) {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
      loadingDiv.innerText = 'Error al cargar el ecosistema: ' + e.message;
      loadingDiv.style.color = 'red';
      loadingDiv.style.display = 'block';
    }
    console.error('Error en init:', e);
  }
}


// Agrega río, árboles y vegetación
function addEcosystem() {
  // Limpiar objetos previos si se recarga la escena
  [...bridgeParts, ...houseParts, ...truckParts, ...branches, ...leafClusters, ...winterDetails, ...treeSnowCaps, ...trees, ...crowns, ...bushes, ...bushSnowCaps, ...rocks, ...grassPatches, ...pathParts, ...garageParts, ...backgroundBuildings, ...roofSnowParts, ...avalancheParts, ...tsunamiFoam, ...lavaBlobs, ...riverDetailParts, ...seaAtmosphereParts, ...pondFish, ...pondDroplets, ...dogParts, ...tornadoDebris]
    .filter(Boolean)
    .forEach(obj => scene.remove(obj));
  if (tsunamiWave) scene.remove(tsunamiWave);
  if (floodWater) scene.remove(floodWater);
  if (tsunamiWetTrail) scene.remove(tsunamiWetTrail);
  if (volcanoGroup) scene.remove(volcanoGroup);
  if (sea) scene.remove(sea);
  if (pond) scene.remove(pond);
  if (snowman) scene.remove(snowman);
  if (houseRoofDamageGroup) scene.remove(houseRoofDamageGroup);
  if (houseLightningBolt) scene.remove(houseLightningBolt);
  if (dogOwnerRescuer) scene.remove(dogOwnerRescuer);
  pondFish.forEach((fish) => {
    if (fish && fish.userData && fish.userData.shadow) scene.remove(fish.userData.shadow);
  });
  dogParts = [];
  bridgeParts = [];
  houseParts = [];
  truckParts = [];
  trees = [];
  crowns = [];
  branches = [];
  treeTips = [];
  treeSnowCaps = [];
  leafClusters = [];
  winterDetails = [];
  bushes = [];
  bushSnowCaps = [];
  rocks = [];
  grassPatches = [];
  pathParts = [];
  garageParts = [];
  garageDestroyedByTsunami = false;
  backgroundBuildings = [];
  roofSurfaces = [];
  roofSnowParts = [];
  avalancheParts = [];
  riverDetailParts = [];
  seaAtmosphereParts = [];
  sea = null;
  pond = null;
  snowman = null;
  pondFish = [];
  pondDroplets = [];
  windyObjects = [];
  houseRoofMain = null;
  houseRoofHome = null;
  roofBlown = false;
  roofFlight = 0;
  roofGone = false;
  houseRoofDamaged = false;
  houseRoofDamageGroup = null;
  houseStrikeCooldown = 0;
  houseStrikePendingFrames = 0;
  houseLightningBolt = null;
  houseLightningBoltFrames = 0;
  dogOwnerRescuer = null;
  dogRescueActive = false;
  dogRescueStage = 0;
  seatedPerson = null;
  tsunamiWave = null;
  tsunamiActive = false;
  tsunamiFoam = [];
  tsunamiBodies = [];
  floodWater = null;
  tsunamiWetTrail = null;
  volcanoGroup = null;
  lavaBlobs = [];
  tornadoDebris = [];

  const occupiedSpots = [];
  const reserveSpot = (x, z, radius) => occupiedSpots.push({ x, z, radius });
  const isSpotFree = (x, z, radius) => {
    for (let i = 0; i < occupiedSpots.length; i++) {
      const o = occupiedSpots[i];
      if (Math.hypot(x - o.x, z - o.z) < (radius + o.radius)) return false;
    }
    return true;
  };

  reserveSpot(HOUSE_POS.x, HOUSE_POS.z, 3.65);
  reserveSpot(-6.4, 2.6, 2.15);
  // Río o mar (según bioma)
  const riverWidth = worldMode === 'beach' ? 12 : 3;

  if (worldMode === 'beach') {
    river = null;
    riverMaterial = null;
    addSeaFromRiverBack();
  } else {
    const riverLength = WORLD_SIZE;
    const riverGeometry = new THREE.BoxGeometry(riverLength, 0.2, riverWidth);
    riverMaterial = new THREE.MeshPhongMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });
    river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.position.set(0, 0.11, -6);
    river.receiveShadow = true;
    scene.add(river);
    addRiverDetails();
  }

  // Helper para evitar el río (no poner objetos en el rango del río)
    // Puente sobre el río (no aplica en playa)
    if (worldMode !== 'beach') addBridge();

    // Casa normal o casa playera
    if (worldMode === 'beach') addBeachHouse();
    else addHouse();

    // Perro blanco sentado junto al estanque
    addDogNearPond();

    // Muñeco de nieve (se muestra solo en invierno)
    addSnowman();

    // Camioneta detallada fija (misma zona)
    addRaptorTruck();

    const backgroundAnchors = getBackgroundStructureAnchors();
    backgroundAnchors.forEach((a) => {
      reserveSpot(a.x, a.z, a.radius || (a.kind === 'building' ? 2.5 : 2.0));
    });

    // Garaje y camino a la casa (solo mundo normal)
    if (worldMode !== 'beach') {
      addGarageNearTruck();
      addPathToGarage();
      addPathToHouse();
    }
    // Camino visual desde la calle hasta la cochera
    function addPathToGarage() {
      const dirtMat = new THREE.MeshStandardMaterial({ color: 0x8b6d47, roughness: 0.98 });
      const compactedMat = new THREE.MeshStandardMaterial({ color: 0x6f5538, roughness: 0.95 });
      const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x9f7e56, roughness: 1 });

      // Desde el borde izquierdo del terreno hasta la entrada de la cochera
      const waypoints = [
        new THREE.Vector3(-14.8, 0, 3.95),
        new THREE.Vector3(-11.6, 0, 3.95),
        new THREE.Vector3(-9.5, 0, 3.95),
        new THREE.Vector3(-8.45, 0, 3.95)
      ];

      const roadWidth = 2.75;
      const shoulderWidth = 3.35;

      for (let i = 0; i < waypoints.length - 1; i++) {
        const a = waypoints[i];
        const b = waypoints[i + 1];
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        const angle = Math.atan2(dir.x, dir.z);

        const shoulder = new THREE.Mesh(new THREE.BoxGeometry(shoulderWidth, 0.03, len + 0.25), shoulderMat);
        shoulder.position.set(mid.x, 0.015, mid.z);
        shoulder.rotation.y = angle;
        shoulder.receiveShadow = true;
        scene.add(shoulder);
        pathParts.push(shoulder);

        const road = new THREE.Mesh(new THREE.BoxGeometry(roadWidth, 0.045, len + 0.2), dirtMat);
        road.position.set(mid.x, 0.028, mid.z);
        road.rotation.y = angle;
        road.receiveShadow = true;
        scene.add(road);
        pathParts.push(road);

        const compacted = new THREE.Mesh(new THREE.BoxGeometry(roadWidth * 0.62, 0.018, len + 0.12), compactedMat);
        compacted.position.set(mid.x, 0.048, mid.z);
        compacted.rotation.y = angle;
        compacted.receiveShadow = true;
        scene.add(compacted);
        pathParts.push(compacted);
      }

      // Entrada completa de lado a lado de la cochera (frente)
      const garageApron = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.055, 1.55), dirtMat);
      garageApron.position.set(-6.4, 0.028, 3.95);
      garageApron.receiveShadow = true;
      scene.add(garageApron);
      pathParts.push(garageApron);

      // Interior de cochera con piso de tierra compactada para que no termine solo en el centro
      const garageInterior = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.05, 2.55), compactedMat);
      garageInterior.position.set(-6.4, 0.026, 2.85);
      garageInterior.receiveShadow = true;
      scene.add(garageInterior);
      pathParts.push(garageInterior);
    }
    if (worldMode !== 'beach') {
      reserveSpot(HOUSE_POS.x, HOUSE_POS.z + 1.55, 1.25);
      reserveSpot(-6.4, 2.6, 2.45);
      [
        { x: -7.7, z: 3.95, r: 1.4 },
        { x: -5.1, z: 3.95, r: 1.4 },
        { x: -5.6, z: 4.0, r: 1.6 },
        { x: -3.3, z: 4.16, r: 1.6 },
        { x: -0.8, z: 4.35, r: 1.6 },
        { x: 1.6, z: 4.55, r: 1.5 },
        { x: HOUSE_POS.x, z: HOUSE_POS.z + 1.86, r: 1.55 }
      ].forEach((p) => reserveSpot(p.x, p.z, p.r));
    }

  function isOnRiver(x, z) {
    // Zona de agua (río o mar según bioma)
    return (z > -6 - riverWidth/2 - 0.7 && z < -6 + riverWidth/2 + 0.7);
  }

  function isBeachSeaZone(z) {
    return worldMode === 'beach' && z < -1.35;
  }

  function isBeachCoastBand(z) {
    return worldMode !== 'beach' || (z > -0.35 && z < 6.15);
  }

  function isNearHouse(x, z) {
    // zona de resguardo para que no haya vegetación dentro/encima de la casa
    return Math.abs(x - HOUSE_POS.x) < 3.3 && Math.abs(z - HOUSE_POS.z) < 3.1;
  }

  function isNearTruckOrGarage(x, z) {
    return Math.abs(x + 6.4) < 2.6 && Math.abs(z - 2.6) < 2.4;
  }

  const treeSpawnRange = WORLD_OBJECT_RANGE - 8;
  const objectSpawnRange = WORLD_OBJECT_RANGE;
  const grassSpawnRange = WORLD_GRASS_RANGE;

  // Árboles
  let count = 0;
  let attempts = 0;
  const treeTarget = worldMode === 'beach' ? 12 : 14;
  while (count < treeTarget && attempts < 1100) {
    attempts++;
    const x = (Math.random() - 0.5) * treeSpawnRange;
    const z = (Math.random() - 0.5) * treeSpawnRange;
    if (!isOnRiver(x, z) && !isNearHouse(x, z) && !isNearTruckOrGarage(x, z) && isSpotFree(x, z, 1.2)) {
      createTree(x, z);
      reserveSpot(x, z, 1.2);
      count++;
    }
  }

  // Arbustos
  count = 0;
  attempts = 0;
  const bushTarget = worldMode === 'beach' ? 30 : 36;
  while (count < bushTarget && attempts < 3000) {
    attempts++;
    const x = (Math.random() - 0.5) * objectSpawnRange;
    const z = (Math.random() - 0.5) * objectSpawnRange;
    const waterFree = worldMode === 'beach' ? !isBeachSeaZone(z) : !isOnRiver(x, z);
    const coastZone = worldMode !== 'beach' || isBeachCoastBand(z);
    if (waterFree && coastZone && !isNearHouse(x, z) && !isNearTruckOrGarage(x, z) && isSpotFree(x, z, 0.7)) {
      createBush(x, z);
      reserveSpot(x, z, 0.7);
      count++;
    }
  }

  // Arbustos extra bajo palmeras (solo playa)
  if (worldMode === 'beach') {
    let palmBushCount = 0;
    const palmBushLimit = 22;
    trees.forEach((tree) => {
      if (palmBushCount >= palmBushLimit) return;
      if (!tree || !tree.position || !tree.userData || !tree.userData.isPalm) return;

      const clumps = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < clumps; i++) {
        if (palmBushCount >= palmBushLimit) break;
        const ang = Math.random() * Math.PI * 2;
        const r = 0.45 + Math.random() * 0.55;
        const bx = tree.position.x + Math.cos(ang) * r;
        const bz = tree.position.z + Math.sin(ang) * r;

        if (!isBeachSeaZone(bz) && isBeachCoastBand(bz) && !isNearHouse(bx, bz) && !isNearTruckOrGarage(bx, bz) && isSpotFree(bx, bz, 0.58)) {
          createBush(bx, bz);
          reserveSpot(bx, bz, 0.58);
          palmBushCount++;
        }
      }
    });
  }

  // Rocas
  count = 0;
  attempts = 0;
  while (count < 11 && attempts < 900) {
    attempts++;
    const x = (Math.random() - 0.5) * objectSpawnRange;
    const z = (Math.random() - 0.5) * objectSpawnRange;
    if (!isOnRiver(x, z) && !isNearHouse(x, z) && !isNearTruckOrGarage(x, z) && isSpotFree(x, z, 0.78)) {
      createRock(x, z);
      reserveSpot(x, z, 0.78);
      count++;
    }
  }

  // Pasto adicional: denso en normal, disperso en playa (costa)
  count = 0;
  attempts = 0;
  const grassTarget = worldMode === 'beach' ? 56 : 240;
  const grassRadius = worldMode === 'beach' ? 0.16 : 0.2;
  const grassAttempts = worldMode === 'beach' ? 2200 : 3200;
  while (count < grassTarget && attempts < grassAttempts) {
    attempts++;
    const x = (Math.random() - 0.5) * grassSpawnRange;
    const z = (Math.random() - 0.5) * grassSpawnRange;
    const waterFree = worldMode === 'beach' ? !isBeachSeaZone(z) : !isOnRiver(x, z);
    const coastZone = worldMode !== 'beach' || isBeachCoastBand(z);
    if (waterFree && coastZone && !isNearHouse(x, z) && !isNearTruckOrGarage(x, z) && isSpotFree(x, z, grassRadius)) {
      createGrassPatch(x, z);
      reserveSpot(x, z, grassRadius);
      count++;
    }
  }

  // Casas/edificios de fondo
  addBackgroundBuildings(backgroundAnchors);

  // Viento sobre árboles, arbustos y edificios de fondo
  windyObjects = [...trees, ...bushes, ...backgroundBuildings];
  windyObjects.forEach((obj, i) => {
    if (!obj || !obj.position) return;
    obj.userData = obj.userData || {};
    obj.userData.baseX = obj.position.x;
    obj.userData.baseY = obj.position.y;
    obj.userData.baseZ = obj.position.z;
    obj.userData.baseRotX = typeof obj.userData.baseRotX === 'number' ? obj.userData.baseRotX : obj.rotation.x;
    obj.userData.baseRotZ = typeof obj.userData.baseRotZ === 'number' ? obj.userData.baseRotZ : obj.rotation.z;
    obj.userData.windPhase = i * 0.37;
    if (!obj.userData.windKind) {
      obj.userData.windKind = bushes.includes(obj) ? 'bush' : 'tree';
    }
  });
}

function createGrassPatch(x, z) {
  const h = 0.12 + Math.random() * 0.18;
  const patch = new THREE.Group();
  patch.position.set(x, 0, z);

  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(
      new THREE.PlaneGeometry(0.035 + Math.random() * 0.025, h),
      new THREE.MeshStandardMaterial({ color: 0x4f8d3e, roughness: 0.9, side: THREE.DoubleSide })
    );
    blade.position.set((Math.random() - 0.5) * 0.08, h * 0.5, (Math.random() - 0.5) * 0.08);
    blade.rotation.y = Math.random() * Math.PI;
    blade.castShadow = false;
    blade.receiveShadow = true;
    patch.add(blade);
  }

  patch.userData = { kind: 'grassPatch' };
  scene.add(patch);
  grassPatches.push(patch);
}

function addPathToHouse() {
  const dirtMat = new THREE.MeshStandardMaterial({ color: 0x8b6a44, roughness: 0.98 });
  const compactedMat = new THREE.MeshStandardMaterial({ color: 0x6f5537, roughness: 0.95 });
  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x9c7a52, roughness: 1 });

  // Tramo ancho de llegada a la casa (de lado a lado del frente)
  const houseFrontPad = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.055, 1.22), shoulderMat);
  houseFrontPad.position.set(HOUSE_POS.x, 0.028, HOUSE_POS.z + 1.86);
  houseFrontPad.receiveShadow = true;
  scene.add(houseFrontPad);
  pathParts.push(houseFrontPad);

  const houseFrontCenter = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.02, 1.05), compactedMat);
  houseFrontCenter.position.set(HOUSE_POS.x, 0.05, HOUSE_POS.z + 1.86);
  houseFrontCenter.receiveShadow = true;
  scene.add(houseFrontCenter);
  pathParts.push(houseFrontCenter);

  const waypoints = [
    new THREE.Vector3(-6.4, 0, 3.95), // salida de la cochera
    new THREE.Vector3(-4.8, 0, 4.05),
    new THREE.Vector3(-2.5, 0, 4.2),
    new THREE.Vector3(0.2, 0, 4.45),
    new THREE.Vector3(HOUSE_POS.x, 0, HOUSE_POS.z + 1.86) // entrada completa de la casa
  ];

  const roadWidth = 2.85;
  const shoulderWidth = 3.45;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const angle = Math.atan2(dir.x, dir.z);

    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(shoulderWidth, 0.03, len + 0.22), shoulderMat);
    shoulder.position.set(mid.x, 0.015, mid.z);
    shoulder.rotation.y = angle;
    shoulder.receiveShadow = true;
    scene.add(shoulder);
    pathParts.push(shoulder);

    const road = new THREE.Mesh(new THREE.BoxGeometry(roadWidth, 0.045, len + 0.18), dirtMat);
    road.position.set(mid.x, 0.028, mid.z);
    road.rotation.y = angle;
    road.receiveShadow = true;
    scene.add(road);
    pathParts.push(road);

    const compacted = new THREE.Mesh(new THREE.BoxGeometry(roadWidth * 0.58, 0.018, len + 0.08), compactedMat);
    compacted.position.set(mid.x, 0.048, mid.z);
    compacted.rotation.y = angle;
    compacted.receiveShadow = true;
    scene.add(compacted);
    pathParts.push(compacted);

    const edgeCount = Math.max(3, Math.floor(len * 2));
    const dirNorm = dir.clone().normalize();
    const side = new THREE.Vector3(dirNorm.z, 0, -dirNorm.x);
    for (let e = 0; e < edgeCount; e++) {
      const t = (e + 0.5) / edgeCount;
      const px = a.x + (b.x - a.x) * t;
      const pz = a.z + (b.z - a.z) * t;
      for (const m of [-1, 1]) {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.16), compactedMat);
        const offset = (roadWidth * 0.5 + 0.2 + Math.random() * 0.08) * m;
        edge.position.set(
          px + side.x * offset,
          0.04,
          pz + side.z * offset
        );
        edge.rotation.y = Math.random() * Math.PI;
        edge.receiveShadow = true;
        scene.add(edge);
        pathParts.push(edge);
      }
    }
  }
}

function addGarageNearTruck() {
  const gx = -6.4;
  const gz = 2.6;
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xbca98b, roughness: 0.9 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x6e5d4e, roughness: 0.86 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x8f8473, roughness: 0.94 });
  const registerGaragePart = (mesh, type) => {
    mesh.userData = mesh.userData || {};
    mesh.userData.garageType = type;
    mesh.userData.garageHome = {
      x: mesh.position.x,
      y: mesh.position.y,
      z: mesh.position.z,
      rx: mesh.rotation.x,
      ry: mesh.rotation.y,
      rz: mesh.rotation.z,
      sx: mesh.scale.x,
      sy: mesh.scale.y,
      sz: mesh.scale.z
    };
    garageParts.push(mesh);
  };

  const floor = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 2.9), floorMat);
  floor.position.set(gx, 0.05, gz);
  floor.receiveShadow = true;
  scene.add(floor);
  registerGaragePart(floor, 'floor');

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.2, 2.85), wallMat);
  leftWall.position.set(gx - 2.03, 1.13, gz); // Pared más alta
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  scene.add(leftWall);
  registerGaragePart(leftWall, 'wall');

  const rightWall = leftWall.clone();
  rightWall.position.x = gx + 2.03;
  scene.add(rightWall);
  registerGaragePart(rightWall, 'wall');

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 0.14), wallMat);
  backWall.position.set(gx, 1.13, gz - 1.38);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  scene.add(backWall);
  registerGaragePart(backWall, 'wall');

  const roof = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.12, 3.0), roofMat);
  roof.position.set(gx, 2.28, gz - 0.02); // Techo más alto
  roof.castShadow = true;
  roof.receiveShadow = true;
  scene.add(roof);
  registerGaragePart(roof, 'roof');
}

function damageGarageByTsunami() {
  if (garageDestroyedByTsunami || garageParts.length === 0) return;
  garageDestroyedByTsunami = true;

  garageParts.forEach((part, idx) => {
    if (!part || !part.userData || !part.userData.garageHome) return;
    const home = part.userData.garageHome;
    const type = part.userData.garageType;

    const lateral = (idx % 2 === 0 ? 1 : -1);
    const crack = 0.08 + Math.random() * 0.06;

    part.position.set(
      home.x + lateral * crack,
      Math.max(0.02, home.y - (type === 'roof' ? 0.35 : type === 'wall' ? 0.2 : 0.08)),
      home.z + (Math.random() - 0.5) * 0.08
    );

    part.rotation.set(
      home.rx + (type === 'wall' ? lateral * (0.12 + Math.random() * 0.08) : (Math.random() - 0.5) * 0.05),
      home.ry + (Math.random() - 0.5) * 0.1,
      home.rz + (type === 'roof' ? lateral * (0.2 + Math.random() * 0.1) : lateral * (0.08 + Math.random() * 0.06))
    );

    if (part.material && part.material.color) {
      part.material = part.material.clone();
      part.material.color.offsetHSL(0, -0.08, -0.16);
      part.material.roughness = Math.min(1, (part.material.roughness || 0.8) + 0.12);
    }
  });
}

function setupMouseControls() {
  // Control de cámara con mouse: solo giro horizontal
  mouseControlsReady = true;
  let isDragging = false;
  let lastX = 0;
  let azimuth = 0;
  let radius = 25;
  const minRadius = 9;
  const maxRadius = 62;
  const center = new THREE.Vector3(0, 4.2, 0);

  function updateCamera() {
    camera.position.x = center.x + Math.sin(azimuth) * radius;
    camera.position.z = center.z + Math.cos(azimuth) * radius;
    camera.position.y = 8;
    camera.lookAt(center);
  }

  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    azimuth -= dx * 0.008;
    updateCamera();
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  // Inicializa la cámara
  updateCamera();
  // Opcional: rueda del mouse para acercar/alejar
  renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    // Zoom in/out con la rueda
    const delta = e.deltaY > 0 ? 1 : -1;
    radius += delta * 1.2;
    radius = Math.max(minRadius, Math.min(maxRadius, radius));
    updateCamera();
  }, { passive: false });
  // Bloquea el contexto del menú derecho
  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
}

function createTornadoIfNeeded() {
  if (tornadoCore) return;
  tornadoCore = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 1.35, 6.4, 18, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x6d7881, roughness: 0.96, transparent: true, opacity: 0.58, side: THREE.DoubleSide })
  );
  body.position.y = 3.2;
  tornadoCore.add(body);

  for (let i = 0; i < 6; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72 + i * 0.1, 0.03, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0x8b969f, roughness: 0.92, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.45 + i * 0.7;
    ring.userData = { ringPhase: i * 0.8 };
    tornadoCore.add(ring);
  }

  tornadoCore.position.set(0, 0, 0);
  scene.add(tornadoCore);
}

function clearTornadoIfNeeded() {
  if (tornadoCore) {
    scene.remove(tornadoCore);
    tornadoCore = null;
  }
  tornadoDebris.forEach((d) => d && scene.remove(d));
  tornadoDebris = [];
  tornadoMouse.hasTarget = false;
}

function resolveDynamicCollisions(objects, minBase = 0.55) {
  const active = objects.filter((o) => o && o.visible !== false && o.position);
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      if (a === b) continue;
      const ar = (a.userData && a.userData.colRadius) ? a.userData.colRadius : minBase;
      const br = (b.userData && b.userData.colRadius) ? b.userData.colRadius : minBase;
      const minDist = ar + br;
      const dx = b.position.x - a.position.x;
      const dz = b.position.z - a.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz) || 0.0001;
      if (dist < minDist) {
        const push = (minDist - dist) * 0.5;
        const nx = dx / dist;
        const nz = dz / dist;
        a.position.x -= nx * push;
        a.position.z -= nz * push;
        b.position.x += nx * push;
        b.position.z += nz * push;
      }
    }
  }
}

function createTree(x, z) {
  if (worldMode === 'beach') {
    createPalmTree(x, z);
    return;
  }

  const palettes = [
    { trunk: 0x7a4a22, bark: 0x5f3618, leaf: 0x2f8f2f, leaf2: 0x3ca23c },
    { trunk: 0x6a3f1c, bark: 0x4f2f14, leaf: 0x2d7a45, leaf2: 0x4a9b63 },
    { trunk: 0x80522a, bark: 0x664022, leaf: 0x4d8d2c, leaf2: 0x6cae3d }
  ];
  const palette = palettes[Math.floor(Math.random() * palettes.length)];

  // Cargar textura de tronco solo una vez
  if (!window._maderaTroncoTexture) {
    const loader = new THREE.TextureLoader();
    window._maderaTroncoTexture = loader.load('../Materiales/madera_tronco.png');
    window._maderaTroncoTexture.wrapS = window._maderaTroncoTexture.wrapT = THREE.RepeatWrapping;
    window._maderaTroncoTexture.repeat.set(1, 1.5);
  }
  const treeType = Math.floor(Math.random() * 3); // 0: roble, 1: pino, 2: ancho

  const trunkHeight = treeType === 1 ? 3.4 + Math.random() * 1.2 : 2.2 + Math.random() * 1.1;
  const trunkRadiusTop = treeType === 2 ? 0.22 : 0.15 + Math.random() * 0.05;
  const trunkRadiusBottom = trunkRadiusTop + (treeType === 2 ? 0.13 : 0.09);

  const treeRoot = new THREE.Group();
  treeRoot.position.set(x, 0, z);
  treeRoot.userData = treeRoot.userData || {};
  treeRoot.userData.colRadius = 0.95;
  scene.add(treeRoot);
  trees.push(treeRoot);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, trunkHeight, 14),
    new THREE.MeshStandardMaterial({
      color: palette.trunk,
      roughness: 0.96,
      map: window._maderaTroncoTexture
    })
  );
  trunk.position.set(0, trunkHeight / 2, 0);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeRoot.add(trunk);

  // Corteza
  const barkStrips = 12;
  for (let i = 0; i < barkStrips; i++) {
    const ang = (i / barkStrips) * Math.PI * 2;
    const strip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.017, 0.017, trunkHeight * 0.9, 6),
      new THREE.MeshStandardMaterial({ color: palette.bark, roughness: 1 })
    );
    strip.position.set(
      Math.cos(ang) * (trunkRadiusTop + 0.012),
      trunkHeight * 0.5,
      Math.sin(ang) * (trunkRadiusTop + 0.012)
    );
    strip.castShadow = true;
    strip.receiveShadow = true;
    treeRoot.add(strip);
  }

  const crownGroup = new THREE.Group();
  if (treeType === 1) {
    // Pino (cónico por niveles)
    const levels = 4;
    for (let l = 0; l < levels; l++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.95 - l * 0.17, 1.0, 10),
        new THREE.MeshLambertMaterial({ 
          color: l % 2 === 0 ? palette.leaf : palette.leaf2,
          map: _hojasTexture,
          transparent: true
        })
      );
      cone.position.set(0, trunkHeight * 0.72 + l * 0.55, 0);
      cone.castShadow = true;
      cone.receiveShadow = true;
      crownGroup.add(cone);
    }
  } else {
    // Roble / ancho (volumen orgánico)
    const crownLayers = treeType === 2 ? 5 : 4;
    for (let l = 0; l < crownLayers; l++) {
      const pieces = (treeType === 2 ? 6 : 4) + l;
      const layerY = trunkHeight * 0.7 + l * 0.33;
      const layerRadius = (treeType === 2 ? 0.95 : 0.78) - l * 0.11;
      for (let p = 0; p < pieces; p++) {
        const t = (p / pieces) * Math.PI * 2 + Math.random() * 0.25;
        const blob = new THREE.Mesh(
          new THREE.SphereGeometry(0.42 + Math.random() * 0.2, 14, 14),
          new THREE.MeshLambertMaterial({ 
            color: Math.random() > 0.5 ? palette.leaf : palette.leaf2,
            map: _hojasTexture,
            transparent: true
          })
        );
        blob.position.set(
          Math.cos(t) * layerRadius * (0.55 + Math.random() * 0.45),
          layerY + Math.random() * 0.14,
          Math.sin(t) * layerRadius * (0.55 + Math.random() * 0.45)
        );
        blob.castShadow = true;
        blob.receiveShadow = true;
        crownGroup.add(blob);
      }
    }
  }
  treeRoot.add(crownGroup);
  crowns.push(crownGroup);

  // Sin hojas sueltas separadas
  leafClusters.push(null);

  const branchGroup = new THREE.Group();
  // More branches for fuller trees
  const branchCount = treeType === 1 ? 18 : 14;
  for (let i = 0; i < branchCount; i++) {
    const angle = (i / branchCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
    const branchLen = 0.7 + Math.random() * 0.7;
    const branchRad = 0.04 + Math.random() * 0.02;
    const attachY = trunkHeight * (0.48 + Math.random() * 0.38);
    const rAttach = trunkRadiusTop + 0.01;
    const dir = new THREE.Vector3(Math.cos(angle), 0.25 + Math.random() * 0.35, Math.sin(angle)).normalize();

    const branchSegment = new THREE.Mesh(
      new THREE.CylinderGeometry(branchRad * 0.55, branchRad, branchLen, 8),
      new THREE.MeshStandardMaterial({ color: palette.bark, roughness: 0.95 })
    );
    const branchTip = new THREE.Mesh(
      new THREE.ConeGeometry(branchRad * 0.62, branchRad * 1.2, 8),
      new THREE.MeshStandardMaterial({ color: palette.bark, roughness: 0.95 })
    );

    const yPitch = Math.asin(dir.y);
    const yYaw = Math.atan2(dir.x, dir.z);

    branchSegment.position.set(
      Math.cos(angle) * rAttach + dir.x * (branchLen * 0.5),
      attachY + dir.y * (branchLen * 0.5),
      Math.sin(angle) * rAttach + dir.z * (branchLen * 0.5)
    );
    branchSegment.rotation.x = yPitch;
    branchSegment.rotation.y = yYaw;
    branchSegment.castShadow = true;
    branchSegment.receiveShadow = true;
    branchGroup.add(branchSegment);

    branchTip.position.set(
      Math.cos(angle) * rAttach + dir.x * (branchLen + branchRad * 0.45),
      attachY + dir.y * (branchLen + branchRad * 0.45),
      Math.sin(angle) * rAttach + dir.z * (branchLen + branchRad * 0.45)
    );
    branchTip.rotation.x = yPitch - Math.PI / 2;
    branchTip.rotation.y = yYaw;
    branchTip.castShadow = true;
    branchTip.receiveShadow = true;
    branchGroup.add(branchTip);

    // Ramitas secundarias para aspecto más realista en árboles sin hojas
    for (let t = 0; t < 3; t++) {
      const twigLen = branchLen * (0.22 + Math.random() * 0.18);
      const twigRad = branchRad * (0.22 + Math.random() * 0.14);
      const side = t === 0 ? 1 : (t === 1 ? -1 : 0);
      const twig = new THREE.Mesh(
        new THREE.CylinderGeometry(twigRad * 0.65, twigRad, twigLen, 6),
        new THREE.MeshStandardMaterial({ color: palette.bark, roughness: 0.98 })
      );
      twig.position.set(
        Math.cos(angle) * rAttach + dir.x * (branchLen * (0.6 + 0.18 * t)),
        attachY + dir.y * (branchLen * (0.6 + 0.18 * t)) + 0.05,
        Math.sin(angle) * rAttach + dir.z * (branchLen * (0.6 + 0.18 * t))
      );
      twig.rotation.x = yPitch + (0.22 + Math.random() * 0.18);
      twig.rotation.y = yYaw + side * (0.42 + Math.random() * 0.18);
      twig.castShadow = true;
      twig.receiveShadow = true;
      branchGroup.add(twig);
    }
  }
  branchGroup.visible = false;
  treeRoot.add(branchGroup);
  branches.push(branchGroup);

  // Punta tipo lápiz (para calor extremo)
  const tipGroup = new THREE.Group();
  const trunkTip = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(0.09, trunkRadiusTop * 0.9), 0.65, 10),
    new THREE.MeshStandardMaterial({ color: palette.bark, roughness: 0.94 })
  );
  trunkTip.position.set(0, trunkHeight + 0.26, 0);
  trunkTip.castShadow = true;
  trunkTip.receiveShadow = true;
  tipGroup.add(trunkTip);
  tipGroup.visible = false;
  treeRoot.add(tipGroup);
  treeTips.push(tipGroup);

  // No snow caps on trees
  treeSnowCaps.push(null);

  // Placeholder de detalle invernal para mantener índices
  const winterGroup = new THREE.Group();
  winterGroup.visible = false;
  treeRoot.add(winterGroup);
  winterDetails.push(winterGroup);
}

function createPalmTree(x, z) {
  const treeRoot = new THREE.Group();
  treeRoot.position.set(x, 0, z);
  treeRoot.userData = treeRoot.userData || {};
  treeRoot.userData.colRadius = 1.05;
  treeRoot.userData.isPalm = true;
  treeRoot.userData.baseRotX = 0;
  treeRoot.userData.baseRotZ = 0;
  treeRoot.userData.tsuPalmCurrent = 0;
  treeRoot.userData.tsuPalmTarget = 0;
  treeRoot.userData.tsuPalmPhase = Math.random() * Math.PI * 2;
  scene.add(treeRoot);
  trees.push(treeRoot);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8c5e34, roughness: 0.92 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x2f9b58 });

  const trunkHeight = 3.2 + Math.random() * 1.6;
  const segments = 7;
  for (let i = 0; i < segments; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12 - i * 0.006, 0.15 - i * 0.006, trunkHeight / segments, 10),
      trunkMat
    );
    const t = i / (segments - 1);
    const bend = 0.36;
    seg.position.set(Math.sin(t * 1.6) * bend, (i + 0.5) * (trunkHeight / segments), Math.cos(t * 1.3) * bend * 0.35);
    seg.rotation.z = Math.sin(t * 1.35) * 0.18;
    seg.castShadow = true;
    seg.receiveShadow = true;
    treeRoot.add(seg);
  }

  const crownGroup = new THREE.Group();
  const topY = trunkHeight + 0.1;
  const fronds = 8;
  for (let i = 0; i < fronds; i++) {
    const ang = (i / fronds) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.11, 1.9 + Math.random() * 0.35, 8), leafMat);
    frond.position.set(Math.cos(ang) * 0.25, topY, Math.sin(ang) * 0.25);
    frond.rotation.z = Math.PI / 2;
    frond.rotation.y = ang;
    frond.rotation.x = -0.18 - Math.random() * 0.12;
    frond.castShadow = true;
    frond.receiveShadow = true;
    crownGroup.add(frond);
  }

  const coconuts = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < coconuts; i++) {
    const coco = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x6b3f26, roughness: 0.85 })
    );
    const a = (i / coconuts) * Math.PI * 2 + Math.random() * 0.3;
    coco.position.set(Math.cos(a) * 0.2, topY - 0.07 + Math.random() * 0.08, Math.sin(a) * 0.2);
    coco.castShadow = true;
    crownGroup.add(coco);
  }

  treeRoot.add(crownGroup);
  crowns.push(crownGroup);

  const emptyBranches = new THREE.Group();
  emptyBranches.visible = false;
  treeRoot.add(emptyBranches);
  branches.push(emptyBranches);

  const emptyTip = new THREE.Group();
  emptyTip.visible = false;
  treeRoot.add(emptyTip);
  treeTips.push(emptyTip);

  const emptySnowCaps = new THREE.Group();
  emptySnowCaps.visible = false;
  treeRoot.add(emptySnowCaps);
  treeSnowCaps.push(emptySnowCaps);

  const emptyWinter = new THREE.Group();
  emptyWinter.visible = false;
  treeRoot.add(emptyWinter);
  winterDetails.push(emptyWinter);
  leafClusters.push(null);
}

// Cambia el clima y actualiza el ecosistema
window.setWeather = function(weather) {
    // Restaurar color del perro si fue alcanzado por rayo
    if (dogParts.length > 0 && dogParts[0].userData && dogParts[0].userData.struckBlack) {
      const dog = dogParts[0];
      dog.userData.furMaterial.color.set(0xf4f6f8);
      dog.userData.struckBlack = false;
    }
  // En modo tsunami, el mundo se mantiene estrictamente en playa y clima soleado
  if (tsunamiBeachLocked && worldMode !== 'beach') {
    tsunamiBeachLocked = false;
    if (sunnyMode === 'tsunami') sunnyMode = 'normal';
  }
  if (tsunamiBeachLocked) {
    sunnyMode = 'tsunami';
    if (weather !== 'sunny' && weather !== 'beach') {
      weather = 'sunny';
    }
  }
  if (weather === 'beach') {
    clearRiverForBeach();
    if (worldMode !== 'beach') {
      worldMode = 'beach';
      addEcosystem();
    }
    currentWeather = 'sunny';
    updateWeatherOptionVisibility();
    return;
  } else if (weather !== 'sunny' && worldMode === 'beach' && !tsunamiBeachLocked) {
    worldMode = 'normal';
    addEcosystem();
  }
  currentWeather = weather;
  updateWeatherOptionVisibility();
  tsunamiActive = false;
  if (tsunamiWave) {
    scene.remove(tsunamiWave);
    tsunamiWave = null;
  }
  avalancheParts.forEach(p => scene.remove(p));
  avalancheParts = [];

  // Limpiar efectos climáticos anteriores
  weatherEffects.forEach(obj => scene.remove(obj));
  weatherEffects = [];

  // Pasto
  if (groundMaterial && groundTexture) {
    if (weather === 'sunny') {
      if (worldMode === 'beach') {
        groundMaterial.color.set(0xd9c189);
        groundMaterial.map = null;
      } else {
        groundMaterial.color.set(0xb6e36b);
        groundMaterial.map = groundTexture;
      }

      if (sunnyMode === 'normal') {
        scene.fog = null;
        renderer.setClearColor(0x87ceeb);
        windStrength = 0.018;
        resetRoofIfNeeded();
      } else if (sunnyMode === 'extreme') {
        // visual seco + reverberación de calor (simula ambiente árido)
        if (_desertTexture) {
          groundMaterial.map = _desertTexture;
          groundMaterial.color.set(0xffffff);
        } else {
          groundMaterial.color.set(0xcdbb7e);
          groundMaterial.map = null;
        }
        scene.fog = new THREE.Fog(0xe0c88c, 26, 92);
        renderer.setClearColor(0xe2c988);
        windStrength = 0.012;
        addHeatHazeEffect();
        resetRoofIfNeeded();
      } else if (sunnyMode === 'wind') {
        clearTornadoIfNeeded();
        scene.fog = new THREE.Fog(0xb0d3e0, 30, 85);
        renderer.setClearColor(0x99c9db);
        windStrength = 0.05;
      } else if (sunnyMode === 'windstrong') {
        clearTornadoIfNeeded();
        scene.fog = new THREE.Fog(0xa6bcc7, 22, 70);
        renderer.setClearColor(0xa1b9c5);
        windStrength = 0.09;
      } else if (sunnyMode === 'tornado') {
        createTornadoIfNeeded();
        scene.fog = new THREE.Fog(0x8ca1ad, 16, 55);
        renderer.setClearColor(0x8aa0ab);
        windStrength = 0.14;
      } else if (sunnyMode === 'tsunami') {
        if (worldMode !== 'beach') {
          sunnyMode = 'normal';
          tsunamiBeachLocked = false;
          scene.fog = null;
          renderer.setClearColor(0x87ceeb);
          windStrength = 0.018;
          resetRoofIfNeeded();
        } else {
          clearTornadoIfNeeded();
          scene.fog = new THREE.Fog(0x8db0bf, 24, 70);
          renderer.setClearColor(0x7da8ba);
          windStrength = 0.035;
          startTsunami();
        }
      } else {
        clearTornadoIfNeeded();
        scene.fog = null;
        renderer.setClearColor(0x87ceeb);
        windStrength = 0;
        resetRoofIfNeeded();
      }
    } else if (weather === 'rain') {
      clearTornadoIfNeeded();
      groundMaterial.color.set(0x4a6a3c); // Pasto oscuro
      groundMaterial.map = groundTexture;
      scene.fog = new THREE.Fog(0x6b7a8f, 20, 60);
      renderer.setClearColor(0x6b7a8f); // gris azulado
      windStrength = rainIntensity === 'heavy' ? 0.03 : 0.015;
    } else if (weather === 'winter') {
      clearTornadoIfNeeded();
      if (_snowTexture) {
        groundMaterial.map = _snowTexture;
        groundMaterial.color.set(0xffffff);
      } else {
        groundMaterial.color.set(0xe0e0e0); // Pasto nevado
        groundMaterial.map = null;
      }
      if (winterMode === 'storm') {
        scene.fog = new THREE.Fog(0xc3ccd2, 6, 28);
        renderer.setClearColor(0xbec8cf);
        windStrength = 0.055;
      } else if (winterMode === 'avalanche') {
        scene.fog = new THREE.Fog(0xc0c7cd, 7, 30);
        renderer.setClearColor(0xb6c0c8);
        windStrength = 0.04;
        startAvalanche();
      } else {
        scene.fog = new THREE.Fog(0xcfd8dc, 10, 40);
        renderer.setClearColor(0xcfd8dc);
        windStrength = 0.01;
      }
      addSnowOnRoofs();
    } else if (weather === 'fire') {
      clearTornadoIfNeeded();
      groundMaterial.color.set(0x6b4a2a); // Pasto quemado
      groundMaterial.map = groundTexture;
      scene.fog = new THREE.Fog(0x8b2a22, 8, 32);
      renderer.setClearColor(0x8b2a22);
      windStrength = 0.02;
      addFireRedCloudEffect();

      bridgeParts.forEach((p) => {
        if (p && p.material && p.material.color) {
          p.material.color.set(0x7c7f84);
          p.material.roughness = 0.95;
        }
      });

      // Sin volcán y sin río de lava en este modo
      setRiverAsLava(false);
      clearVolcano();
    }

      if (weather !== 'winter') {
      clearRoofSnow();
    }
    if (weather !== 'fire') {
      setRiverAsLava(false);
      clearVolcano();
      bridgeParts.forEach((p) => {
        if (p && p.material && p.material.color) {
          p.material.color.set(0x8B5A2B);
          p.material.roughness = 0.7;
        }
      });
    }
    groundMaterial.needsUpdate = true;
  }
  // Árboles y copas
  crowns.forEach((crown, i) => {
    if (branches[i]) branches[i].visible = false;
    if (treeTips[i]) treeTips[i].visible = false;
    if (treeSnowCaps[i]) treeSnowCaps[i].visible = false;

    // Change foliage appearance by weather
    let foliageColor, foliageOpacity;
    if (weather === 'sunny') {
      if (sunnyMode === 'extreme') {
        crown.visible = false;
        if (treeTips[i]) treeTips[i].visible = true;
      } else {
        foliageColor = 0x228B22; // Verde
        foliageOpacity = 1.0;
        crown.visible = true;
      }
      if (leafClusters[i]) leafClusters[i].visible = true;
      if (winterDetails[i]) winterDetails[i].visible = false;
    } else if (weather === 'rain') {
      foliageColor = 0x2e8b57; // Verde oscuro
      foliageOpacity = 0.95;
      crown.visible = true;
      if (leafClusters[i]) leafClusters[i].visible = true;
      if (winterDetails[i]) winterDetails[i].visible = false;
    } else if (weather === 'winter') {
      foliageColor = 0x5f7f60;
      foliageOpacity = 0.7;
      crown.visible = true;
      if (treeSnowCaps[i]) treeSnowCaps[i].visible = true;
      if (leafClusters[i]) leafClusters[i].visible = false;
      if (winterDetails[i]) winterDetails[i].visible = true;
    } else if (weather === 'fire') {
      crown.visible = false;
      if (leafClusters[i]) leafClusters[i].visible = false;
      if (winterDetails[i]) winterDetails[i].visible = false;
    }
    // Update hojas.png material color/opacity for all meshes in crown
    if (crown.visible && typeof foliageColor !== 'undefined') {
      crown.traverse(obj => {
        if (obj.isMesh && obj.material && obj.material.map === _hojasTexture) {
          obj.material.color.set(foliageColor);
          obj.material.opacity = foliageOpacity;
          obj.material.transparent = foliageOpacity < 1.0;
          obj.material.needsUpdate = true;
        }
      });
    }
  });

  // Arbustos y capas de nieve en arbustos
  bushes.forEach((bush, i) => {
    if (!bush) return;
    const baseScale = (bush.userData && typeof bush.userData.baseScale === 'number') ? bush.userData.baseScale : 1;
    if (bushSnowCaps[i]) bushSnowCaps[i].visible = false;

    let bushColor, bushOpacity;
    if (weather === 'sunny') {
      if (sunnyMode === 'extreme') {
        bush.visible = false;
        return;
      } else {
        bushColor = 0x2e8b57;
        bushOpacity = 1.0;
        bush.visible = true;
        bush.scale.y = baseScale;
      }
    } else if (weather === 'rain') {
      bushColor = 0x2b7a4f;
      bushOpacity = 0.95;
      bush.visible = true;
      bush.scale.y = baseScale * 1.02;
    } else if (weather === 'winter') {
      bushColor = 0x5f7f60;
      bushOpacity = 0.7;
      bush.visible = true;
      bush.scale.y = baseScale;
      if (bushSnowCaps[i]) bushSnowCaps[i].visible = true;
    } else if (weather === 'fire') {
      bushColor = 0x5a4838;
      bushOpacity = 0.6;
      bush.visible = true;
      bush.scale.y = baseScale * 0.76;
    }
    // Update hojas.png material color/opacity for bush
    if (bush.visible && bush.material && bush.material.map === _hojasTexture) {
      bush.material.color.set(bushColor);
      bush.material.opacity = bushOpacity;
      bush.material.transparent = bushOpacity < 1.0;
      bush.material.needsUpdate = true;
    }
  });

  if (snowman) {
    snowman.visible = weather === 'winter';
  }

  setDogStyleByWeather();

  // Limpiar efectos de fuego previos
  fireEffects.forEach(fg => scene.remove(fg));
  fireEffects = [];
  burningTrees = [];
  if (runnerFire) {
    if (runner && runnerFire.parent === runner) {
      runner.remove(runnerFire);
    } else {
      scene.remove(runnerFire);
    }
    runnerFire = null;
  }
  if (runner) {
    scene.remove(runner);
    runner = null;
  }
  runnerActive = false;
  runnerProgress = 0;

  // Si es clima de fuego, poner fuego grande en el terreno y en algunos árboles
  if (weather === 'fire') {
    // Fuego grande en el centro del terreno
    const fire = createFireEffect(0, 0, 2.2, 2.5, 32);
    scene.add(fire);
    fireEffects.push(fire);

    // Fuego en la casa
    const houseFire = createFireEffect(HOUSE_POS.x, HOUSE_POS.z, 1.9, 1.8, 28);
    scene.add(houseFire);
    fireEffects.push(houseFire);

    // Camioneta en llamas
    if (truckParts.length > 0 && truckParts[0] && truckParts[0].position) {
      const truck = truckParts[0];
      const truckFire = createFireEffect(truck.position.x, truck.position.z, 1.2, 1.5, 24);
      scene.add(truckFire);
      fireEffects.push(truckFire);
    }

    // Fuego en árboles aleatorios (no todos)
    let treeIndexes = Array.from({length: trees.length}, (_, i) => i);
    // Selecciona 3-5 árboles aleatorios
    let count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count && treeIndexes.length > 0; i++) {
      let idx = treeIndexes.splice(Math.floor(Math.random() * treeIndexes.length), 1)[0];
      let t = trees[idx];
      if (t) {
        let fireTree = createFireEffect(t.position.x, t.position.z, t.position.y + 1.2, 1.1, 16);
        scene.add(fireTree);
        fireEffects.push(fireTree);
        burningTrees.push(idx);
      }
    }

    // Perro bombero: rayo de agua hacia árbol en llamas
    if (dogParts.length > 0 && burningTrees.length > 0) {
      const dog = dogParts[0];
      const targetTree = trees[burningTrees[0]];
      if (dog && targetTree) {
        const sprayGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3()
        ]);
        const sprayMat = new THREE.LineBasicMaterial({ color: 0x7fd3ff, transparent: true, opacity: 0.9 });
        const spray = new THREE.Line(sprayGeom, sprayMat);
        spray.userData = { type: 'dogHose', target: targetTree };
        scene.add(spray);
        dog.userData.hoseStream = spray;
      }
    }

    // Personaje en llamas saliendo de la casa hacia el río
    createRunnerFromHouse();

  } else if (weather === 'rain') {
    addRainEffect();
  } else if (weather === 'winter') {
    addSnowEffect();
  }
}

// Agrega un puente sencillo sobre el río
function addBridge() {
  // Puente recto para cruzar el río (perpendicular al cauce)
  const bridgeX = 0;
  const startZ = -8.2;
  const endZ = -3.8;
  const plankCount = 12;
  for (let i = 0; i < plankCount; i++) {
    const t = i / (plankCount - 1);
    const z = startZ + (endZ - startZ) * t;
    const plankGeom = new THREE.BoxGeometry(1.25, 0.12, 0.32);
    const plankMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B });
    const plank = new THREE.Mesh(plankGeom, plankMat);
    plank.position.set(bridgeX, 0.24, z);
    bridgeParts.push(plank);
    scene.add(plank);
  }

  // Barandales laterales rectos
  for (const sideX of [-0.62, 0.62]) {
    const railGeom = new THREE.BoxGeometry(0.08, 0.45, endZ - startZ + 0.2);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a });
    const rail = new THREE.Mesh(railGeom, railMat);
    rail.position.set(sideX, 0.55, (startZ + endZ) / 2);
    bridgeParts.push(rail);
    scene.add(rail);
  }

  // Postes del puente
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const z = startZ + (endZ - startZ) * t;
    for (const sideX of [-0.62, 0.62]) {
      const postGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x5a3418 });
      const post = new THREE.Mesh(postGeom, postMat);
      post.position.set(sideX, 0.35, z);
      bridgeParts.push(post);
      scene.add(post);
    }
  }
}

function addRiverDetails() {
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x8a7a56, roughness: 0.95 });
  const wetBankMat = new THREE.MeshStandardMaterial({ color: 0x736142, roughness: 0.9 });
  const riverRange = WORLD_SIZE - 2;

  for (const side of [-1, 1]) {
    const bank = new THREE.Mesh(new THREE.BoxGeometry(WORLD_SIZE, 0.08, 0.68), bankMat);
    bank.position.set(0, 0.04, RIVER_CENTER_Z + side * 1.92);
    bank.receiveShadow = true;
    scene.add(bank);
    riverDetailParts.push(bank);

    const wetEdge = new THREE.Mesh(new THREE.BoxGeometry(WORLD_SIZE, 0.03, 0.26), wetBankMat);
    wetEdge.position.set(0, 0.115, RIVER_CENTER_Z + side * 1.55);
    wetEdge.receiveShadow = true;
    scene.add(wetEdge);
    riverDetailParts.push(wetEdge);
  }

  for (let i = 0; i < 30; i++) {
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.13),
      new THREE.MeshStandardMaterial({ color: 0x7d7d7d, roughness: 0.98 })
    );
    const side = Math.random() > 0.5 ? 1 : -1;
    stone.position.set(
      (Math.random() - 0.5) * riverRange,
      0.12,
      RIVER_CENTER_Z + side * (1.7 + Math.random() * 0.65)
    );
    stone.rotation.set(Math.random(), Math.random(), Math.random());
    stone.castShadow = true;
    stone.receiveShadow = true;
    scene.add(stone);
    riverDetailParts.push(stone);
  }

  for (let i = 0; i < 20; i++) {
    const reed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.03, 0.42 + Math.random() * 0.3, 6),
      new THREE.MeshStandardMaterial({ color: 0x4f7e37, roughness: 1 })
    );
    const side = Math.random() > 0.5 ? 1 : -1;
    reed.position.set(
      (Math.random() - 0.5) * (WORLD_SIZE - 4),
      0.2,
      RIVER_CENTER_Z + side * (1.45 + Math.random() * 0.4)
    );
    reed.rotation.z = (Math.random() - 0.5) * 0.3;
    reed.castShadow = true;
    scene.add(reed);
    riverDetailParts.push(reed);
  }

  for (let i = 0; i < 36; i++) {
    const foam = new THREE.Mesh(
      new THREE.SphereGeometry(0.06 + Math.random() * 0.03, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xe9f4ff, transparent: true, opacity: 0.62 })
    );
    foam.position.set((Math.random() - 0.5) * riverRange, 0.19 + Math.random() * 0.05, RIVER_CENTER_Z + (Math.random() - 0.5) * 2.2);
    foam.userData = {
      kind: 'riverFoam',
      waterOnly: true,
      speed: 0.03 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2
    };
    scene.add(foam);
    riverDetailParts.push(foam);
  }
}

function addSeaFromRiverBack() {
  const seaGeom = new THREE.PlaneGeometry(WORLD_SIZE + 2, 22, 72, 44);
  const seaMat = createStylizedWaterShaderMaterial({
    deepColor: 0x1f6f95,
    shallowColor: 0x58b7d7,
    foamColor: 0xf2fbff,
    skyTopColor: 0x98d5ff,
    skyHorizonColor: 0xd8efff,
    alpha: 0.88,
    amplitude: 0.17,
    frequency: 0.48,
    speed: 1.35,
    foamStrength: 0.5,
    reflectivity: 0.42,
    fresnelPower: 3.3,
    specularStrength: 0.24,
    choppiness: 0.45,
    detailNormal: 0.2,
    refractionStrength: 0.17,
    absorption: 0.019,
    glitterStrength: 0.23,
    stormReactive: 0.75,
    side: THREE.DoubleSide
  });
  sea = new THREE.Mesh(seaGeom, seaMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(0, 0.13, -10.5);
  sea.receiveShadow = true;
  sea.userData.kind = 'sea';

  scene.add(sea);
  riverDetailParts.push(sea);

  const createShoreFoamMaterial = (baseOpacity = 0.42) => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: WATER_TIME,
      uStorm: WATER_STORM,
      uOpacity: { value: baseOpacity }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uStorm;
      uniform float uOpacity;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        float t = uTime * 0.38;
        vec2 uv = vec2(vUv.x * 7.0 + t, vUv.y * 2.8 - t * 0.5);
        float n = noise(uv) * 0.7 + noise(uv * 1.9 + vec2(5.7, -2.3)) * 0.3;
        float stripe = smoothstep(0.22, 0.95, sin((vUv.x + t * 0.8) * 16.0) * 0.5 + 0.5);
        float edge = smoothstep(1.0, 0.08, abs(vUv.y - 0.5) * 2.0);
        float stormBoost = 1.0 + uStorm * 0.55;
        float foam = smoothstep(0.4, 0.92, n * stripe) * edge * stormBoost;
        float alpha = clamp(foam * uOpacity, 0.0, 1.0);
        gl_FragColor = vec4(vec3(0.94, 0.98, 1.0), alpha);
      }
    `
  });

  for (let i = 0; i < 3; i++) {
    const band = new THREE.Mesh(
      new THREE.PlaneGeometry((WORLD_SIZE + 0.5) - i * 1.6, 0.9 + i * 0.22, 1, 1),
      createShoreFoamMaterial(0.36 - i * 0.06)
    );
    band.rotation.x = -Math.PI / 2;
    band.position.set(0, 0.155 + i * 0.012, -2.15 - i * 0.35);
    band.userData = { kind: 'shoreFoamBand', phase: i * 0.9 };
    scene.add(band);
    seaAtmosphereParts.push(band);
  }

  const mistCount = 260;
  const mistPos = new Float32Array(mistCount * 3);
  const mistDrift = new Float32Array(mistCount);
  for (let i = 0; i < mistCount; i++) {
    mistPos[i * 3] = (Math.random() - 0.5) * (WORLD_SIZE - 2);
    mistPos[i * 3 + 1] = 0.2 + Math.random() * 1.35;
    mistPos[i * 3 + 2] = -2.9 - Math.random() * 6.4;
    mistDrift[i] = 0.002 + Math.random() * 0.004;
  }
  const mistGeom = new THREE.BufferGeometry();
  mistGeom.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
  const mist = new THREE.Points(
    mistGeom,
    new THREE.PointsMaterial({ color: 0xe7f6ff, size: 0.2, transparent: true, opacity: 0.15, depthWrite: false })
  );
  mist.userData = { kind: 'seaMist', drift: mistDrift };
  scene.add(mist);
  seaAtmosphereParts.push(mist);
}

function createFishMesh(colorHex) {
  const fish = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45, metalness: 0.2 });
  const finMat = new THREE.MeshStandardMaterial({ color: 0xf2d08a, roughness: 0.55 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), bodyMat);
  body.scale.set(1.5, 0.85, 0.85);
  body.castShadow = true;
  fish.add(body);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.19, 10), bodyMat);
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-0.2, 0, 0);
  tail.castShadow = true;
  fish.add(tail);

  const finTop = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 8), finMat);
  finTop.position.set(0.02, 0.08, 0);
  finTop.rotation.z = Math.PI;
  fish.add(finTop);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), eyeMat);
  eyeL.position.set(0.12, 0.02, 0.055);
  fish.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.055;
  fish.add(eyeR);

  return fish;
}

function addPondNearHouse() {
  pond = new THREE.Group();
  const pondCenter = { x: HOUSE_POS.x + 3.6, z: HOUSE_POS.z + 0.4 };

  const pit = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 1.95, 0.24, 42),
    new THREE.MeshStandardMaterial({ color: 0x665745, roughness: 0.98 })
  );
  pit.position.set(pondCenter.x, 0.07, pondCenter.z);
  pit.receiveShadow = true;
  pond.add(pit);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(1.58, 1.65, 0.16, 42),
    createStylizedWaterShaderMaterial({
      deepColor: 0x2d84ae,
      shallowColor: 0x75c9e6,
      foamColor: 0xf0fbff,
      skyTopColor: 0xa6dcff,
      skyHorizonColor: 0xe0f4ff,
      alpha: 0.8,
      amplitude: 0.07,
      frequency: 0.52,
      speed: 1.15,
      foamStrength: 0.26,
      reflectivity: 0.28,
      fresnelPower: 2.8,
      specularStrength: 0.16,
      choppiness: 0.24,
      detailNormal: 0.11,
      refractionStrength: 0.12,
      absorption: 0.012,
      glitterStrength: 0.14,
      stormReactive: 0.0,
      side: THREE.DoubleSide
    })
  );
  water.position.set(pondCenter.x, 0.14, pondCenter.z);
  water.receiveShadow = true;
  water.userData = { kind: 'pondWater' };
  pondSurfaceY = water.position.y + 0.08;
  pond.add(water);

  // borde de piedras
  for (let i = 0; i < 20; i++) {
    const ang = (i / 20) * Math.PI * 2;
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.06),
      new THREE.MeshStandardMaterial({ color: 0x7f7b74, roughness: 0.95 })
    );
    const r = 1.78 + Math.random() * 0.22;
    stone.position.set(
      pondCenter.x + Math.cos(ang) * r,
      0.11,
      pondCenter.z + Math.sin(ang) * r
    );
    stone.castShadow = true;
    stone.receiveShadow = true;
    pond.add(stone);
  }

  // plantas alrededor del estanque
  for (let i = 0; i < 14; i++) {
    const reed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, 0.3 + Math.random() * 0.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x4e8a3f, roughness: 1 })
    );
    const ang = Math.random() * Math.PI * 2;
    const r = 1.85 + Math.random() * 0.3;
    reed.position.set(
      pondCenter.x + Math.cos(ang) * r,
      0.19,
      pondCenter.z + Math.sin(ang) * r
    );
    reed.rotation.z = (Math.random() - 0.5) * 0.4;
    reed.castShadow = true;
    pond.add(reed);
  }

  scene.add(pond);

  const fishColors = [0xff9f43, 0xfeca57, 0xff6b6b, 0x48dbfb, 0xf368e0, 0xffc069];
  for (let i = 0; i < 6; i++) {
    const fish = createFishMesh(fishColors[i % fishColors.length]);
    fish.position.set(pondCenter.x + (Math.random() - 0.5) * 1.2, pondSurfaceY - 0.08, pondCenter.z + (Math.random() - 0.5) * 1.2);
    fish.rotation.y = Math.random() * Math.PI * 2;
    fish.castShadow = true;
    fish.receiveShadow = true;
    fish.userData = {
      centerX: pondCenter.x,
      centerZ: pondCenter.z,
      radius: 0.4 + Math.random() * 0.72,
      angle: Math.random() * Math.PI * 2,
      swimSpeed: 0.007 + Math.random() * 0.005,
      jumpHeight: 0.6 + Math.random() * 0.55,
      jumping: false,
      jumpT: 0,
      splashOut: false,
      splashIn: false,
      wigglePhase: Math.random() * Math.PI * 2
    };

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.17, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.24 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(fish.position.x, pondSurfaceY + 0.002, fish.position.z);
    fish.userData.shadow = shadow;

    scene.add(fish);
    scene.add(shadow);
    pondFish.push(fish);
  }
}

function spawnPondSplash(x, z, power = 1) {
  const count = 8 + Math.floor(Math.random() * 8);
  for (let i = 0; i < count; i++) {
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(0.018 + Math.random() * 0.015, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xd8efff, transparent: true, opacity: 0.86 })
    );
    drop.position.set(x + (Math.random() - 0.5) * 0.16, pondSurfaceY + 0.01, z + (Math.random() - 0.5) * 0.16);
    drop.userData = {
      vx: (Math.random() - 0.5) * 0.05 * power,
      vy: 0.09 + Math.random() * 0.06 * power,
      vz: (Math.random() - 0.5) * 0.05 * power,
      life: 1
    };
    drop.castShadow = true;
    scene.add(drop);
    pondDroplets.push(drop);
  }
}

function addDogNearPond() {
  const dog = new THREE.Group();
  const baseX = HOUSE_POS.x + 3.85;
  const baseZ = HOUSE_POS.z + 0.9;

  const furWhite = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.86 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.45 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.25, metalness: 0.05 });

  // Cuerpo
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), furWhite);
  body.scale.set(1.08, 0.86, 0.78);
  body.position.set(0, 0.45, 0);
  body.castShadow = true;
  dog.add(body);

  // Pecho
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), furWhite);
  chest.position.set(0.24, 0.37, 0);
  chest.castShadow = true;
  dog.add(chest);

  // Cabeza
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), furWhite);
  head.position.set(0.44, 0.62, 0);
  head.castShadow = true;
  dog.add(head);

  // Hocico
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), furWhite);
  snout.scale.set(1.15, 0.82, 0.86);
  snout.position.set(0.58, 0.56, 0);
  snout.castShadow = true;
  dog.add(snout);

  // Nariz
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), noseMat);
  nose.position.set(0.67, 0.56, 0);
  dog.add(nose);

  // Orejas
  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10), furWhite);
  earL.position.set(0.39, 0.81, 0.11);
  earL.rotation.z = 0.35;
  earL.castShadow = true;
  dog.add(earL);
  const earR = earL.clone();
  earR.position.z = -0.11;
  earR.rotation.z = -0.35;
  dog.add(earR);

  // Ojos
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), eyeMat);
  eyeL.position.set(0.55, 0.63, 0.07);
  dog.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.07;
  dog.add(eyeR);

  // Patas delanteras y traseras (animables)
  const frontLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.28, 10), furWhite);
  frontLegL.position.set(0.24, 0.17, -0.12);
  frontLegL.castShadow = true;
  dog.add(frontLegL);
  const frontLegR = frontLegL.clone();
  frontLegR.position.z = 0.12;
  dog.add(frontLegR);

  const pawL = new THREE.Mesh(new THREE.SphereGeometry(0.047, 10, 10), furWhite);
  pawL.position.set(0.24, 0.03, -0.12);
  pawL.castShadow = true;
  dog.add(pawL);
  const pawR = pawL.clone();
  pawR.position.z = 0.12;
  dog.add(pawR);

  const backLegL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), furWhite);
  backLegL.position.set(-0.12, 0.18, -0.12);
  backLegL.castShadow = true;
  dog.add(backLegL);
  const backLegR = backLegL.clone();
  backLegR.position.z = 0.12;
  dog.add(backLegR);

  // Cola
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.3, 10), furWhite);
  tail.position.set(-0.44, 0.58, 0);
  tail.rotation.z = -0.9;
  tail.castShadow = true;
  dog.add(tail);

  dog.position.set(baseX, 0, baseZ);
  dog.rotation.y = -0.55;

  // Accesorios climáticos
  const sunglasses = new THREE.Group();
  const sunGlassMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.25, metalness: 0.55 });
  const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.05), sunGlassMat);
  lensL.position.set(0.56, 0.64, -0.055);
  sunglasses.add(lensL);
  const lensR = lensL.clone();
  lensR.position.z = 0.055;
  sunglasses.add(lensR);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.02, 0.13), sunGlassMat);
  bridge.position.set(0.56, 0.64, 0);
  sunglasses.add(bridge);
  sunglasses.visible = false;
  dog.add(sunglasses);

  const firefighterGear = new THREE.Group();
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xcc2f2f, roughness: 0.75 })
  );
  helmet.rotation.z = Math.PI;
  helmet.position.set(0.44, 0.79, 0);
  firefighterGear.add(helmet);

  const vest = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.22, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xd23b3b, roughness: 0.8 })
  );
  vest.position.set(0.05, 0.45, 0);
  firefighterGear.add(vest);
  firefighterGear.visible = false;
  dog.add(firefighterGear);

  const winterSweater = new THREE.Group();
  // Suéter rojo con franja blanca
  const sweaterBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.25, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.85 })
  );
  sweaterBody.position.set(0.02, 0.45, 0);
  winterSweater.add(sweaterBody);
  const sweaterStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.04, 0.29),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
  );
  sweaterStripe.position.set(0.02, 0.45, 0);
  winterSweater.add(sweaterStripe);
  winterSweater.visible = false;
  dog.add(winterSweater);

  // Barco para tsunami
  const surfBoat = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.23, 1.1, 10, 16),
    new THREE.MeshStandardMaterial({ color: 0x7f5330, roughness: 0.78, metalness: 0.06 })
  );
  hull.rotation.z = Math.PI / 2;
  hull.scale.set(1.25, 0.22, 0.62);
  hull.position.set(0.03, -0.05, 0);
  hull.castShadow = true;
  hull.receiveShadow = true;
  surfBoat.add(hull);

  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.06, 0.44),
    new THREE.MeshStandardMaterial({ color: 0xb89065, roughness: 0.85 })
  );
  inner.position.set(0.1, 0.01, 0);
  surfBoat.add(inner);

  const bow = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.34, 10),
    new THREE.MeshStandardMaterial({ color: 0x6b4328, roughness: 0.76 })
  );
  bow.position.set(0.74, 0.04, 0);
  bow.rotation.z = -Math.PI / 2;
  surfBoat.add(bow);

  surfBoat.visible = false;
  dog.add(surfBoat);

  scene.add(dog);
  dogParts.push(dog);

  // Guardar referencias para animación
  dog.userData = {
    frontLegL, frontLegR, backLegL, backLegR, head,
    body, chest, snout, tail,
    furMaterial: furWhite,
    sunglasses,
    firefighterGear,
    winterSweater,
    surfBoat,
    hoseStream: null,
    blownAway: false,
    flyVelY: 0,
    struckBlack: false,
    surfing: false
  };
}

function startDogRescue() {
  if (dogRescueActive) return;
  const dog = dogParts.length > 0 ? dogParts[0] : null;
  if (!dog) return;

  const owner = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.14, 0.45, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x2f4a68 })
  );
  body.position.set(0, 0.34, 0);
  owner.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf0c9a3 })
  );
  head.position.set(0, 0.73, 0);
  owner.add(head);

  owner.position.set(HOUSE_POS.x, 0, HOUSE_POS.z + 1.25);
  owner.castShadow = true;
  scene.add(owner);

  dogOwnerRescuer = owner;
  dogRescueActive = true;
  dogRescueStage = 0;
  dogState.mode = 'idle';
  dogState.wait = 1200;
}

function addSnowman() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf4f8ff, roughness: 0.72 });
  const coalMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.55 });
  const carrotMat = new THREE.MeshStandardMaterial({ color: 0xf08a2a, roughness: 0.6 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6a4327, roughness: 0.95 });
  const hatMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.88 });
  const scarfMat = new THREE.MeshStandardMaterial({ color: 0xc83f3f, roughness: 0.8 });

  const base = new THREE.Mesh(new THREE.SphereGeometry(0.54, 18, 18), bodyMat);
  base.position.y = 0.54;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const mid = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 18), bodyMat);
  mid.position.y = 1.2;
  mid.castShadow = true;
  mid.receiveShadow = true;
  group.add(mid);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), bodyMat);
  head.position.y = 1.75;
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head);

  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), coalMat);
    btn.position.set(0.31, 1.02 + i * 0.19, 0);
    group.add(btn);
  }

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), coalMat);
  eyeL.position.set(0.23, 1.8, -0.08);
  group.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = 0.08;
  group.add(eyeR);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.23, 10), carrotMat);
  nose.position.set(0.27, 1.73, 0);
  nose.rotation.z = -Math.PI / 2;
  group.add(nose);

  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.78, 8), woodMat);
  armL.position.set(-0.2, 1.28, -0.34);
  armL.rotation.set(0.28, 0.08, 1.05);
  armL.castShadow = true;
  group.add(armL);

  const armR = armL.clone();
  armR.position.z = 0.34;
  armR.rotation.set(-0.28, -0.08, 1.05);
  group.add(armR);

  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.24, 16), hatMat);
  hatTop.position.y = 2.07;
  hatTop.castShadow = true;
  group.add(hatTop);
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 18), hatMat);
  hatBrim.position.y = 1.94;
  hatBrim.castShadow = true;
  group.add(hatBrim);

  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.05, 10, 24), scarfMat);
  scarf.position.y = 1.52;
  scarf.rotation.x = Math.PI / 2;
  group.add(scarf);

  group.position.set(HOUSE_POS.x - 2.7, 0, HOUSE_POS.z - 0.6);
  group.rotation.y = 0.35;
  group.visible = false;
  scene.add(group);
  snowman = group;
}


// Agrega una pequeña casa de madera
function addHouse() {
  // Casa más hacia el centro (pero sin estorbar el río)
  const x = HOUSE_POS.x, z = HOUSE_POS.z;
  const loader = new THREE.TextureLoader();
  const troncosTexture = loader.load('../Materiales/troncos.png');
  troncosTexture.wrapS = troncosTexture.wrapT = THREE.RepeatWrapping;
  troncosTexture.repeat.set(2, 1.2);
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, map: troncosTexture });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x6d4528, roughness: 0.92 });
  // Flat roof with lamina texture
  const laminaTexture = loader.load('../Materiales/lamina.png');
  laminaTexture.wrapS = laminaTexture.wrapT = THREE.RepeatWrapping;
  laminaTexture.repeat.set(2.5, 1.2);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38, metalness: 0.82, map: laminaTexture });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x9ec7e8, roughness: 0.2, metalness: 0.1 });

  const addHousePart = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    houseParts.push(mesh);
    scene.add(mesh);
  };

  // Base hueca: piso + muros (sin techo interno)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 2.6), woodMat);
  floor.position.set(x, 0.07, z);
  addHousePart(floor);

  const wallT = 0.14;
  const wallH = 1.35;
  const wallZBack = new THREE.Mesh(new THREE.BoxGeometry(3.2, wallH, wallT), woodMat);
  wallZBack.position.set(x, wallH / 2, z - 1.23);
  addHousePart(wallZBack);
  const wallXLeft = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, 2.6), woodMat);
  wallXLeft.position.set(x - 1.53, wallH / 2, z);
  addHousePart(wallXLeft);
  const wallXRight = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, 2.6), woodMat);
  wallXRight.position.set(x + 1.53, wallH / 2, z);
  addHousePart(wallXRight);
  // Frente con hueco de puerta
  const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, wallH, wallT), woodMat);
  frontLeft.position.set(x - 1.0, wallH / 2, z + 1.23);
  addHousePart(frontLeft);
  const frontRight = new THREE.Mesh(new THREE.BoxGeometry(1.2, wallH, wallT), woodMat);
  frontRight.position.set(x + 1.0, wallH / 2, z + 1.23);
  addHousePart(frontRight);
  const frontTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, wallT), woodMat);
  frontTop.position.set(x, 1.2, z + 1.23);
  addHousePart(frontTop);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.25, 2.75), darkWoodMat);
  plinth.position.set(x, 0.13, z);
  addHousePart(plinth);

  // Flat roof sits just above walls
  const roofHeight = 0.13;
  const roofY = wallH + floor.position.y + roofHeight / 2; // wallH + floor Y + half roof height
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.3, roofHeight, 2.7), roofMat);
  roof.position.set(x, roofY, z);
  addHousePart(roof);
  houseRoofMain = roof;
  houseRoofHome = {
    x: roof.position.x,
    y: roof.position.y,
    z: roof.position.z,
    rx: roof.rotation.x,
    ry: roof.rotation.y,
    rz: roof.rotation.z
  };
  roofSurfaces.push(roof);

  // Chimenea eliminada

  // Puerta con marco
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.9, 0.1), darkWoodMat);
  door.position.set(x, 0.46, z + 1.35);
  addHousePart(door);

  const doorFrameTop = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.12), new THREE.MeshStandardMaterial({ color: 0x4c2f1a }));
  doorFrameTop.position.set(x, 0.95, z + 1.34);
  addHousePart(doorFrameTop);

  // Ventanas con marco
  const createWindow = (wx, wy, wz) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.1), darkWoodMat);
    frame.position.set(wx, wy, wz);
    addHousePart(frame);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.38, 0.06), glassMat);
    pane.position.set(wx, wy, wz + 0.02);
    addHousePart(pane);
  };
  createWindow(x - 1.0, 0.92, z + 1.33);
  createWindow(x + 1.0, 0.92, z + 1.33);
  createWindow(x - 1.35, 0.95, z);
  createWindow(x + 1.35, 0.95, z);

  // Porche frontal
  const porch = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.7), new THREE.MeshStandardMaterial({ color: 0x7b5636, roughness: 0.9 }));
  porch.position.set(x, 0.07, z + 1.75);
  addHousePart(porch);
  roofSurfaces.push(porch);

  // Postes del porche
  for (const px of [-0.55, 0.55]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.0, 8), darkWoodMat);
    post.position.set(x + px, 0.56, z + 1.62);
    addHousePart(post);
  }

  // Sillón interior
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x7a2f2f, roughness: 0.85 });
  const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.55), sofaMat);
  sofaSeat.position.set(x - 0.55, 0.45, z - 0.35);
  addHousePart(sofaSeat);
  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.12), sofaMat);
  sofaBack.position.set(x - 0.55, 0.7, z - 0.58);
  addHousePart(sofaBack);

  // Persona sentada
  const person = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.14, 0.45, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x2f4a68 })
  );
  body.position.set(0, 0.32, 0);
  person.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf0c9a3 })
  );
  head.position.set(0, 0.72, 0);
  person.add(head);
  person.position.set(x - 0.55, 0.45, z - 0.34);
  person.castShadow = true;
  seatedPerson = person;
  houseParts.push(person);
  scene.add(person);
}

function addBeachHouse() {
  const x = HOUSE_POS.x, z = HOUSE_POS.z;
  const palmWood = new THREE.MeshStandardMaterial({ color: 0xa17248, roughness: 0.96 });
  const palmWoodDark = new THREE.MeshStandardMaterial({ color: 0x7a5535, roughness: 0.98 });

  const roofLeafMap = _hojasTexture ? _hojasTexture.clone() : null;
  if (roofLeafMap) {
    roofLeafMap.wrapS = roofLeafMap.wrapT = THREE.RepeatWrapping;
    roofLeafMap.repeat.set(2.2, 1.6);
    roofLeafMap.needsUpdate = true;
  }
  const palmLeafRoof = new THREE.MeshLambertMaterial({
    color: 0xb6a567,
    map: roofLeafMap,
    transparent: !!roofLeafMap,
    alphaTest: roofLeafMap ? 0.25 : 0,
    side: THREE.DoubleSide
  });

  const addPart = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    houseParts.push(mesh);
    scene.add(mesh);
  };

  const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.35, 0.18, 20), palmWood);
  deck.position.set(x, 0.16, z);
  addPart(deck);

  // Solo postes de palma en las 4 esquinas
  const cornerPosts = [
    [-1.45, -1.05],
    [1.45, -1.05],
    [-1.45, 1.05],
    [1.45, 1.05]
  ];
  cornerPosts.forEach(([px, pz], i) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.105, 1.8, 12), palmWoodDark);
    post.position.set(x + px, 1.1, z + pz);
    post.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.02;
    addPart(post);
  });

  // Vigas superiores
  const beamFront = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.12, 0.14), palmWoodDark);
  beamFront.position.set(x, 1.95, z + 1.05);
  addPart(beamFront);
  const beamBack = beamFront.clone();
  beamBack.position.z = z - 1.05;
  addPart(beamBack);
  const beamLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 2.1), palmWoodDark);
  beamLeft.position.set(x - 1.45, 1.95, z);
  addPart(beamLeft);
  const beamRight = beamLeft.clone();
  beamRight.position.x = x + 1.45;
  addPart(beamRight);

  // Techo principal de palmas
  const roofCore = new THREE.Mesh(new THREE.ConeGeometry(2.65, 1.55, 4), palmLeafRoof);
  roofCore.position.set(x, 2.4, z);
  roofCore.rotation.y = Math.PI / 4;
  addPart(roofCore);
  houseRoofMain = roofCore;
  houseRoofHome = {
    x: roofCore.position.x,
    y: roofCore.position.y,
    z: roofCore.position.z,
    rx: roofCore.rotation.x,
    ry: roofCore.rotation.y,
    rz: roofCore.rotation.z
  };
  roofSurfaces.push(roofCore);

  const stairs = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.9), palmWoodDark);
  stairs.position.set(x, 0.08, z + 1.75);
  addPart(stairs);
}

function getBackgroundStructureAnchors() {
  if (worldMode === 'beach') {
    return [
      { kind: 'house', x: -18.2, z: 12.4, scale: 0.92, rotY: 0.18, radius: 2.0 },
      { kind: 'house', x: -13.6, z: 10.8, scale: 0.9, rotY: 0.22, radius: 1.95 },
      { kind: 'house', x: -9.4, z: 12.8, scale: 0.85, rotY: -0.1, radius: 1.85 },
      { kind: 'house', x: -5.1, z: 10.4, scale: 0.95, rotY: 0.35, radius: 2.0 },
      { kind: 'house', x: 6.4, z: 10.9, scale: 0.92, rotY: -0.25, radius: 1.98 },
      { kind: 'house', x: 10.4, z: 9.2, scale: 1.0, rotY: -0.18, radius: 2.1 },
      { kind: 'house', x: 14.2, z: 12.6, scale: 0.86, rotY: 0.3, radius: 1.88 },
      { kind: 'house', x: 18.4, z: 11.2, scale: 0.9, rotY: -0.24, radius: 1.95 }
    ];
  }

  return [
    { kind: 'house', x: -18.6, z: 13.2, scale: 0.9, rotY: 0.14, radius: 2.0 },
    { kind: 'house', x: -15.4, z: -13.9, scale: 0.94, rotY: -0.32, radius: 2.05 },
    { kind: 'house', x: -10.6, z: 11.6, scale: 0.92, rotY: 0.2, radius: 1.98 },
    { kind: 'house', x: -9.8, z: -12.1, scale: 0.96, rotY: -0.3, radius: 2.02 },
    { kind: 'house', x: 11.7, z: 11.2, scale: 1.0, rotY: -0.2, radius: 2.12 },
    { kind: 'house', x: 14.2, z: -12.8, scale: 0.9, rotY: 0.36, radius: 1.96 },
    { kind: 'house', x: 18.7, z: 12.6, scale: 0.9, rotY: -0.16, radius: 2.0 },
    { kind: 'building', x: -2.6, z: 14.8, floors: 8, rotY: 0.1, radius: 3.05 },
    { kind: 'building', x: 15.8, z: -2.4, floors: 7, rotY: -0.18, radius: 2.95 },
    { kind: 'building', x: -16.8, z: -2.9, floors: 9, rotY: 0.08, radius: 3.2 },
    { kind: 'building', x: 1.2, z: -15.6, floors: 8, rotY: -0.06, radius: 3.05 },
    { kind: 'building', x: 18.8, z: 2.5, floors: 7, rotY: 0.12, radius: 2.95 },
    { kind: 'building', x: -18.5, z: 4.2, floors: 8, rotY: -0.14, radius: 3.1 }
  ];
}

function createBackgroundHouse(anchor, idx) {
  const group = new THREE.Group();
  const scale = anchor.scale || 1;
  const wallMat = new THREE.MeshStandardMaterial({ color: worldMode === 'beach' ? 0xc9ad8a : 0xbda88f, roughness: 0.92 });
  const roofMat = new THREE.MeshStandardMaterial({ color: worldMode === 'beach' ? 0x8f6a48 : 0x734f35, roughness: 0.9 });
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x8ebad8, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.82 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.2, 1.7), wallMat);
  body.position.y = 0.65;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.55, 0.9, 4), roofMat);
  roof.position.y = 1.55;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);
  roofSurfaces.push(roof);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.72, 0.08), roofMat);
  door.position.set(0, 0.38, 0.9);
  group.add(door);

  const winL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.07), windowMat);
  winL.position.set(-0.62, 0.76, 0.88);
  group.add(winL);
  const winR = winL.clone();
  winR.position.x = 0.62;
  group.add(winR);

  group.position.set(anchor.x, 0, anchor.z);
  group.rotation.y = typeof anchor.rotY === 'number' ? anchor.rotY : (idx % 2 ? -0.2 : 0.2);
  group.scale.setScalar(scale);
  group.userData = {
    windKind: 'building',
    windPhase: idx * 0.71,
    baseRotX: group.rotation.x,
    baseRotZ: group.rotation.z,
    colRadius: anchor.radius || 2
  };

  scene.add(group);
  backgroundBuildings.push(group);
}

function createBackgroundBuilding(anchor, idx) {
  const group = new THREE.Group();
  const floors = Math.max(5, (anchor.floors || 4) + 1 + (idx % 2));
  const floorHeight = 0.56;
  const width = 2.0 + (idx % 3 === 0 ? 0.32 : 0.14);
  const depth = 1.7 + (idx % 2 === 0 ? 0.36 : 0.18);
  const height = 0.9 + floors * floorHeight;

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9ca3ab, roughness: 0.86 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x5d6369, roughness: 0.9 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x7f8790, roughness: 0.88 });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    bodyMat
  );
  body.position.y = height * 0.5;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Volumen secundario lateral para romper silueta plana
  const sideWing = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.42, height * 0.68, depth * 0.52),
    accentMat
  );
  sideWing.position.set((idx % 2 === 0 ? 1 : -1) * (width * 0.44), height * 0.34, -depth * 0.18);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  group.add(sideWing);

  // Núcleo trasero más alto
  const rearTower = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.34, height * 0.88, depth * 0.36),
    trimMat
  );
  rearTower.position.set(0, height * 0.44, -depth * 0.54);
  rearTower.castShadow = true;
  rearTower.receiveShadow = true;
  group.add(rearTower);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.07, 0.14, depth * 1.06),
    trimMat
  );
  roof.position.y = height + 0.07;
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);
  roofSurfaces.push(roof);

  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.58, 0.34, depth * 0.48),
    trimMat
  );
  crown.position.set(0, height + 0.26, -depth * 0.05);
  crown.castShadow = true;
  crown.receiveShadow = true;
  group.add(crown);
  roofSurfaces.push(crown);

  const roofTower = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.24, 0.55, depth * 0.24),
    accentMat
  );
  roofTower.position.set(width * 0.2, height + 0.45, depth * 0.12);
  roofTower.castShadow = true;
  roofTower.receiveShadow = true;
  group.add(roofTower);

  const winMat = new THREE.MeshStandardMaterial({ color: 0x9ec6e2, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.78 });
  const columns = width > 2.2 ? [-0.68, -0.22, 0.22, 0.68] : [-0.54, 0, 0.54];
  for (let f = 0; f < floors; f++) {
    const y = 0.5 + f * floorHeight;
    for (const sx of columns) {
      const wFront = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.05), winMat);
      wFront.position.set(sx, y, depth * 0.52);
      group.add(wFront);
      const wBack = wFront.clone();
      wBack.position.z = -depth * 0.52;
      group.add(wBack);
    }

    if (f % 2 === 0) {
      const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.24), winMat);
      sideWindow.position.set(width * 0.52, y, 0.22);
      group.add(sideWindow);
      const sideWindow2 = sideWindow.clone();
      sideWindow2.position.x = -width * 0.52;
      group.add(sideWindow2);
    }
  }

  group.position.set(anchor.x, 0, anchor.z);
  group.rotation.y = typeof anchor.rotY === 'number' ? anchor.rotY : 0;
  group.userData = {
    windKind: 'building',
    windPhase: idx * 0.83,
    baseRotX: group.rotation.x,
    baseRotZ: group.rotation.z,
    colRadius: anchor.radius || Math.max(2.75, width * 1.38)
  };

  scene.add(group);
  backgroundBuildings.push(group);
}

function addBackgroundBuildings(anchors = []) {
  anchors.forEach((anchor, idx) => {
    if (anchor.kind === 'building') createBackgroundBuilding(anchor, idx);
    else createBackgroundHouse(anchor, idx);
  });
}

function createRunnerFromHouse() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22, 0.8, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x2f3b52 })
  );
  body.position.set(0, 0.85, 0);
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf2c9a1 })
  );
  head.position.set(0, 1.45, 0);
  group.add(head);

  group.position.set(HOUSE_POS.x, 0, HOUSE_POS.z + 1.25);
  scene.add(group);
  runner = group;

  // Fuego pegado al personaje (coordenadas locales)
  runnerFire = createFireEffect(0, 0, 1.0, 1.1, 18);
  group.add(runnerFire);

  // Ruta: sale de la puerta, da la vuelta a la casa y luego corre al río
  runnerPath = [
    { x: HOUSE_POS.x, z: HOUSE_POS.z + 1.25 }, // salida de puerta
    { x: HOUSE_POS.x + 2.1, z: HOUSE_POS.z + 0.8 }, // lateral derecho
    { x: HOUSE_POS.x + 2.1, z: HOUSE_POS.z - 1.4 }, // detrás de casa
    { x: HOUSE_POS.x + 3.4, z: HOUSE_POS.z - 2.6 }, // toma impulso hacia zona derecha
    { x: 4.8, z: RIVER_CENTER_Z } // llega al río lejos del puente
  ];

  runnerActive = true;
  runnerProgress = 0;
}
function createBush(x, z) {
  const selectedBushFile = BUSH_MODEL_FILES[Math.floor(Math.random() * BUSH_MODEL_FILES.length)];
  const bushModel = cloneModel(selectedBushFile);
  if (bushModel) {
    bushModel.position.set(x, 0, z);
    const s = 0.8 + Math.random() * 0.45;
    bushModel.scale.set(s, s, s);
    bushModel.rotation.y = Math.random() * Math.PI * 2;
    bushModel.userData = bushModel.userData || {};
    bushModel.userData.baseScale = s;
    bushModel.userData.windKind = 'bush';
    bushModel.userData.colRadius = 0.62;

    const snowCap = createBushSnowCapGroup();
    snowCap.visible = false;
    bushModel.add(snowCap);

    scene.add(bushModel);
    bushes.push(bushModel);
    bushSnowCaps.push(snowCap);
    return;
  }

  // More detailed bush: cluster of spheres with less transparent hojas texture
  const bush = new THREE.Group();
  const sphereCount = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < sphereCount; i++) {
    const geo = new THREE.SphereGeometry(0.22 + Math.random() * 0.18, 16, 16);
    const mat = new THREE.MeshLambertMaterial({
      color: 0x2e8b57,
      map: _hojasTexture,
      transparent: true,
      opacity: 0.92,
      alphaTest: 0.35 // Hide very transparent pixels
    });
    const mesh = new THREE.Mesh(geo, mat);
    const angle = (i / sphereCount) * Math.PI * 2 + Math.random() * 0.5;
    const radius = 0.18 + Math.random() * 0.13;
    mesh.position.set(Math.cos(angle) * radius, 0.22 + Math.random() * 0.13, Math.sin(angle) * radius);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bush.add(mesh);
  }
  bush.position.set(x, 0.01, z);
  bush.userData = bush.userData || {};
  bush.userData.baseScale = bush.scale.y || 1;
  bush.userData.windKind = 'bush';
  bush.userData.colRadius = 0.58;

  const fallbackSnowCap = createBushSnowCapGroup();
  fallbackSnowCap.visible = false;
  bush.add(fallbackSnowCap);

  scene.add(bush);
  bushes.push(bush);
  bushSnowCaps.push(fallbackSnowCap);
}

function createBushSnowCapGroup() {
  const group = new THREE.Group();
  const pieces = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < pieces; i++) {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.11 + Math.random() * 0.07, 9, 9),
      new THREE.MeshStandardMaterial({ color: 0xf7fbff, roughness: 0.84, metalness: 0.02 })
    );
    const a = (i / pieces) * Math.PI * 2 + Math.random() * 0.35;
    const r = 0.16 + Math.random() * 0.15;
    cap.position.set(Math.cos(a) * r, 0.34 + Math.random() * 0.14, Math.sin(a) * r);
    cap.scale.y = 0.55 + Math.random() * 0.22;
    cap.castShadow = true;
    cap.receiveShadow = true;
    group.add(cap);
  }
  return group;
}

function createRock(x, z) {
  const selectedRockFile = ROCK_MODEL_FILES[Math.floor(Math.random() * ROCK_MODEL_FILES.length)];
  const rockModel = cloneModel(selectedRockFile);
  if (rockModel) {
    rockModel.position.set(x, 0, z);
    const s = 0.7 + Math.random() * 0.5;
    rockModel.scale.set(s, s, s);
    rockModel.rotation.y = Math.random() * Math.PI * 2;
    rockModel.userData = rockModel.userData || {};
    rockModel.userData.colRadius = 0.7;
    scene.add(rockModel);
    rocks.push(rockModel);
    return;
  }

  const rockGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.2);
  const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);
  rock.position.set(x, 0.2, z);
  rock.userData = rock.userData || {};
  rock.userData.colRadius = 0.66;
  scene.add(rock);
  rocks.push(rock);
}


// Crea un efecto de fuego con partículas (esferas naranjas/rojas animadas)
function createFireEffect(x, z, y, size, count) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  for (let i = 0; i < count; i++) {
    const color = new THREE.Color().setHSL(0.05 + Math.random() * 0.08, 1, 0.5 + Math.random() * 0.2);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
    const geom = new THREE.SphereGeometry(size * (0.13 + Math.random() * 0.18), 8, 8);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(
      (Math.random() - 0.5) * size * 0.7,
      Math.random() * size * 0.7,
      (Math.random() - 0.5) * size * 0.7
    );
    mesh.userData = {
      baseY: mesh.position.y,
      speed: 0.01 + Math.random() * 0.03,
      amplitude: 0.2 + Math.random() * 0.3
    };
    group.add(mesh);
  }
  return group;
}

function preloadNatureModels(onDone) {
  // Fallback: si GLTFLoader no está disponible, continuar sin modelos 3D
  if (!THREE.GLTFLoader) {
    onDone();
    return;
  }

  const gltfLoader = new THREE.GLTFLoader();
  const files = [...new Set([...TREE_MODEL_FILES, ...ROCK_MODEL_FILES, ...BUSH_MODEL_FILES])];
  let pending = files.length;
  let resolved = false;

  const finishOnce = () => {
    if (resolved) return;
    resolved = true;
    onDone();
  };

  if (pending === 0) {
    finishOnce();
    return;
  }

  // Evita bloqueo infinito si algún archivo se queda colgado
  const safetyTimeout = setTimeout(() => {
    finishOnce();
  }, 7000);

  const tryLoad = (candidates, ok, fail, idx = 0) => {
    if (idx >= candidates.length) {
      fail();
      return;
    }
    gltfLoader.load(
      candidates[idx],
      (gltf) => ok(gltf),
      undefined,
      () => tryLoad(candidates, ok, fail, idx + 1)
    );
  };

  files.forEach(file => {
    const candidates = [
      encodeURI(MODEL_BASE_PATH + file),
      MODEL_BASE_PATH + file,
      encodeURI('assets/models/Models/GLTF format/' + file),
      'assets/models/Models/GLTF format/' + file,
      encodeURI('/Albercas/Portafolio/Proyecto/assets/models/Models/GLTF format/' + file)
    ];

    tryLoad(
      candidates,
      (gltf) => {
        modelsCache[file] = gltf.scene;

        // Si la escena ya arrancó con fallback, al tener modelos reales refrescamos una sola vez
        if (ecosystemStarted && !refreshedWithLoadedModels) {
          const loadedTrees = TREE_MODEL_FILES.some(f => !!modelsCache[f]);
          const loadedRocks = ROCK_MODEL_FILES.some(f => !!modelsCache[f]);
          const loadedBushes = BUSH_MODEL_FILES.some(f => !!modelsCache[f]);
          if (loadedTrees || loadedRocks || loadedBushes) {
            refreshedWithLoadedModels = true;
            addEcosystem();
          }
        }

        pending--;
        if (pending === 0) {
          clearTimeout(safetyTimeout);
          finishOnce();
        }
      },
      () => {
        pending--;
        if (pending === 0) {
          clearTimeout(safetyTimeout);
          finishOnce();
        }
      }
    );
  });
}

function cloneModel(fileName) {
  const model = modelsCache[fileName];
  if (!model) return null;
  const cloned = model.clone(true);
  cloned.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = false;
      obj.receiveShadow = true;
    }
  });
  return cloned;
}

function setObjectColor(object3D, colorHex) {
  if (!object3D) return;
  object3D.traverse((obj) => {
    if (obj.isMesh && obj.material && obj.material.color) {
      obj.material.color.set(colorHex);
    }
  });
}

function createStylizedWaterShaderMaterial(options = {}) {
  const uniforms = {
    uTime: WATER_TIME,
    uStorm: WATER_STORM,
    uDeepColor: { value: new THREE.Color(options.deepColor ?? 0x1e6f9a) },
    uShallowColor: { value: new THREE.Color(options.shallowColor ?? 0x52b8d8) },
    uFoamColor: { value: new THREE.Color(options.foamColor ?? 0xeef8ff) },
    uSkyTopColor: { value: new THREE.Color(options.skyTopColor ?? 0x9fd8ff) },
    uSkyHorizonColor: { value: new THREE.Color(options.skyHorizonColor ?? 0xd9f0ff) },
    uSunDir: { value: (options.sunDirection ?? new THREE.Vector3(0.35, 0.9, 0.2)).clone().normalize() },
    uAlpha: { value: options.alpha ?? 0.82 },
    uAmp: { value: options.amplitude ?? 0.16 },
    uFreq: { value: options.frequency ?? 0.42 },
    uSpeed: { value: options.speed ?? 1.4 },
    uFoamStrength: { value: options.foamStrength ?? 0.55 },
    uReflectivity: { value: options.reflectivity ?? 0.4 },
    uFresnelPower: { value: options.fresnelPower ?? 3.2 },
    uSpecularStrength: { value: options.specularStrength ?? 0.25 },
    uChoppiness: { value: options.choppiness ?? 0.42 },
    uDetailNormal: { value: options.detailNormal ?? 0.18 },
    uRefractionStrength: { value: options.refractionStrength ?? 0.14 },
    uAbsorption: { value: options.absorption ?? 0.02 },
    uGlitterStrength: { value: options.glitterStrength ?? 0.2 },
    uStormDarkness: { value: options.stormDarkness ?? 0.28 },
    uStormFoamBoost: { value: options.stormFoamBoost ?? 0.42 },
    uStormWaveBoost: { value: options.stormWaveBoost ?? 0.52 },
    uStormReactive: { value: options.stormReactive ?? 1.0 }
  };

  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: options.side ?? THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      varying float vWave;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec2 vLocalXZ;
      uniform float uTime;
      uniform float uStorm;
      uniform float uAmp;
      uniform float uFreq;
      uniform float uSpeed;
      uniform float uChoppiness;
      uniform float uStormWaveBoost;
      uniform float uStormReactive;

      void main() {
        vUv = uv;
        vec3 p = position;
        vLocalXZ = p.xz;
        float storm = uStorm * uStormReactive;

        float waveA = sin((p.x + uTime * uSpeed) * uFreq);
        float waveB = cos((p.z - uTime * (uSpeed * 0.73)) * (uFreq * 0.9));
        float waveC = sin((p.x + p.z + uTime * 0.6) * (uFreq * 0.55));
        float waveHi = sin((p.x * 2.3 - p.z * 1.7 + uTime * uSpeed * 3.2) * (uFreq * 1.7));
        float waveRip = cos((p.x * 4.1 + p.z * 3.6 + uTime * uSpeed * 5.8) * (uFreq * 1.25));
        float waveBase = (waveA * 0.55 + waveB * 0.35 + waveC * 0.25);
        float waveDetail = waveHi * (0.18 + 0.24 * uChoppiness) + waveRip * (0.08 + 0.16 * uChoppiness);
        vWave = waveBase + waveDetail * (0.35 + 0.65 * storm);
        float ampBoost = 1.0 + storm * uStormWaveBoost;
        p.y += vWave * uAmp * ampBoost;

        float dWaveDx = (uAmp * ampBoost) * (
          cos((position.x + uTime * uSpeed) * uFreq) * uFreq * 0.55
          + cos((position.x + position.z + uTime * 0.6) * (uFreq * 0.55)) * (uFreq * 0.55) * 0.25
          + cos((position.x * 2.3 - position.z * 1.7 + uTime * uSpeed * 3.2) * (uFreq * 1.7)) * (uFreq * 1.7) * 2.3 * (0.12 + 0.2 * uChoppiness)
          - sin((position.x * 4.1 + position.z * 3.6 + uTime * uSpeed * 5.8) * (uFreq * 1.25)) * (uFreq * 1.25) * 4.1 * (0.06 + 0.12 * uChoppiness)
        );
        float dWaveDz = (uAmp * ampBoost) * (
          -sin((position.z - uTime * (uSpeed * 0.73)) * (uFreq * 0.9)) * (uFreq * 0.9) * 0.35
          + cos((position.x + position.z + uTime * 0.6) * (uFreq * 0.55)) * (uFreq * 0.55) * 0.25
          - cos((position.x * 2.3 - position.z * 1.7 + uTime * uSpeed * 3.2) * (uFreq * 1.7)) * (uFreq * 1.7) * 1.7 * (0.12 + 0.2 * uChoppiness)
          - sin((position.x * 4.1 + position.z * 3.6 + uTime * uSpeed * 5.8) * (uFreq * 1.25)) * (uFreq * 1.25) * 3.6 * (0.06 + 0.12 * uChoppiness)
        );
        vec3 localNormal = normalize(vec3(-dWaveDx, 1.0, -dWaveDz));
        vNormalW = normalize(mat3(modelMatrix) * localNormal);

        vec4 worldPos = modelMatrix * vec4(p, 1.0);
        vWorldPos = worldPos.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vWave;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec2 vLocalXZ;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uFoamColor;
      uniform vec3 uSkyTopColor;
      uniform vec3 uSkyHorizonColor;
      uniform vec3 uSunDir;
      uniform float uTime;
      uniform float uAlpha;
      uniform float uStorm;
      uniform float uFoamStrength;
      uniform float uReflectivity;
      uniform float uFresnelPower;
      uniform float uSpecularStrength;
      uniform float uChoppiness;
      uniform float uDetailNormal;
      uniform float uRefractionStrength;
      uniform float uAbsorption;
      uniform float uGlitterStrength;
      uniform float uStormDarkness;
      uniform float uStormFoamBoost;
      uniform float uStormReactive;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amp * noise(p);
          p *= 2.03;
          amp *= 0.5;
        }
        return value;
      }

      void main() {
        float storm = uStorm * uStormReactive;
        vec2 flowUv = vLocalXZ * (0.14 + uChoppiness * 0.06);
        flowUv += vec2(uTime * 0.09, -uTime * 0.06);
        float n1 = fbm(flowUv);
        float n2 = fbm(flowUv * 1.37 + vec2(13.7, -9.2));
        float detailN = (n1 - 0.5) * 2.0;
        float detailN2 = (n2 - 0.5) * 2.0;

        float depthMix = smoothstep(0.0, 1.0, vUv.y + vWave * (0.08 + storm * 0.04));
        vec3 water = mix(uDeepColor, uShallowColor, depthMix);
        water *= (1.0 - storm * uStormDarkness);

        float crest = smoothstep(0.18 - storm * 0.08, 0.85, vWave + detailN * (0.12 + uChoppiness * 0.08));
        float foamBase = smoothstep(0.24 - storm * 0.14, 0.95 - storm * 0.1, vWave + 0.36 + storm * 0.12);
        foamBase = max(foamBase, crest * 0.75);
        float foamMask = foamBase * uFoamStrength * (1.0 + storm * uStormFoamBoost);
        vec3 baseColor = mix(water, uFoamColor, clamp(foamMask, 0.0, 1.0));

        vec3 n = normalize(vNormalW + vec3(detailN * uDetailNormal, 0.0, detailN2 * uDetailNormal));
        vec3 v = normalize(cameraPosition - vWorldPos);
        vec3 l = normalize(uSunDir);

        float fresnel = pow(1.0 - max(dot(n, v), 0.0), uFresnelPower + storm * 0.7);
        float skyMix = clamp(0.5 + n.y * 0.5, 0.0, 1.0);
        vec3 skyRef = mix(uSkyHorizonColor, uSkyTopColor, skyMix);
        skyRef *= (1.0 - storm * 0.22);

        float dist = length(cameraPosition - vWorldPos);
        float absorb = 1.0 - exp(-dist * uAbsorption);

        vec3 refractedTint = mix(uShallowColor, uFoamColor, clamp(0.35 + detailN * 0.25, 0.0, 1.0));
        baseColor = mix(baseColor, refractedTint, uRefractionStrength * (0.35 + (1.0 - fresnel) * 0.65));
        baseColor = mix(baseColor, uDeepColor, absorb * 0.42);

        vec3 h = normalize(v + l);
        float spec = pow(max(dot(n, h), 0.0), mix(52.0, 76.0, storm)) * (uSpecularStrength + storm * 0.08);

        float glitterNoise = smoothstep(0.72, 1.0, fbm(flowUv * 2.6 + vec2(uTime * 0.35, -uTime * 0.22)));
        float glitter = spec * glitterNoise * uGlitterStrength;

        vec3 finalColor = baseColor
          + skyRef * fresnel * uReflectivity
          + vec3(spec + glitter);
        float alpha = clamp(uAlpha + foamMask * (0.14 + storm * 0.06) + fresnel * 0.05, 0.0, 1.0);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  });
}

function addRainEffect() {
  const isHeavy = rainIntensity === 'heavy';
  const count = isHeavy ? 1800 : 900;
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
    pos[i * 3 + 1] = 4 + Math.random() * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
    speed[i] = isHeavy ? 0.28 + Math.random() * 0.2 : 0.16 + Math.random() * 0.15;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xaed8ff, size: isHeavy ? 0.08 : 0.06, transparent: true, opacity: 0.85 });
  const points = new THREE.Points(geom, mat);
  points.userData = { type: 'rain', speed };
  scene.add(points);
  weatherEffects.push(points);
}

window.setRainIntensity = function(mode) {
  rainIntensity = mode === 'heavy' ? 'heavy' : 'normal';
  if (currentWeather === 'rain') {
    weatherEffects.forEach(obj => scene.remove(obj));
    weatherEffects = [];
    addRainEffect();
  }
}

window.toggleLightning = function() {
  lightningEnabled = !lightningEnabled;
}

function addSnowEffect() {
  const count = winterMode === 'storm' ? 1200 : 500;
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
    pos[i * 3 + 1] = 4 + Math.random() * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
    speed[i] = winterMode === 'storm' ? 0.05 + Math.random() * 0.06 : 0.02 + Math.random() * 0.04;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: winterMode === 'storm' ? 0.1 : 0.12, transparent: true, opacity: 0.9 });
  const points = new THREE.Points(geom, mat);
  points.userData = { type: 'snow', speed };
  scene.add(points);
  weatherEffects.push(points);
}

function addHeatHazeEffect() {
  const count = 680;
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
    pos[i * 3 + 1] = 0.08 + Math.random() * 1.3;
    pos[i * 3 + 2] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
    speed[i] = 0.005 + Math.random() * 0.008;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xf2d08c, size: 0.07, transparent: true, opacity: 0.22 });
  const haze = new THREE.Points(geom, mat);
  haze.userData = { type: 'heat', speed };
  scene.add(haze);
  weatherEffects.push(haze);
}

function addFireRedCloudEffect() {
  const count = 600; // Menos humo
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * (WORLD_EFFECT_RANGE + 4);
    pos[i * 3 + 1] = 5.5 + Math.random() * 6.5;
    pos[i * 3 + 2] = (Math.random() - 0.5) * (WORLD_EFFECT_RANGE + 4);
    speed[i] = 0.001 + Math.random() * 0.003;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xbf2d1b, size: 0.22, transparent: true, opacity: 0.34 });
  const cloud = new THREE.Points(geom, mat);
  cloud.userData = { type: 'firecloud', speed };
  scene.add(cloud);
  weatherEffects.push(cloud);
}

function setDogStyleByWeather() {
  const dog = dogParts.length > 0 ? dogParts[0] : null;
  if (!dog || !dog.userData) return;
  const u = dog.userData;
  if (!u.furMaterial) return;

  // Base
  u.furMaterial.color.set(0xf4f6f8);
  if (u.sunglasses) u.sunglasses.visible = false;
  if (u.firefighterGear) u.firefighterGear.visible = false;
  if (u.winterSweater) u.winterSweater.visible = false;
  if (u.surfBoat) u.surfBoat.visible = false;
  if (u.hoseStream) {
    scene.remove(u.hoseStream);
    u.hoseStream = null;
  }

  if (currentWeather === 'sunny' && sunnyMode === 'extreme') {
    u.furMaterial.color.set(0x242424); // tono oscuro por calor extremo
  }

  if (worldMode === 'beach' && currentWeather === 'sunny') {
    if (u.sunglasses) u.sunglasses.visible = true;
  }

  if (currentWeather === 'winter') {
    if (u.winterSweater) u.winterSweater.visible = true;
  }

  if (currentWeather === 'fire') {
    if (u.firefighterGear) u.firefighterGear.visible = true;
  }

  if (u.struckBlack) {
    u.furMaterial.color.set(0x151515);
  }
}

function addRaptorTruck() {
  const vehicle = new THREE.Group();
  vehicle.position.set(-6.4, 0, 2.6);
  vehicle.rotation.y = -0.35;
  vehicle.userData = vehicle.userData || {};
  vehicle.userData.colRadius = 1.45;

  const bodyMain = new THREE.MeshStandardMaterial({ color: 0x2d4c7a, roughness: 0.42, metalness: 0.52 });
  const bodyTrim = new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.85, metalness: 0.18 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x89abc3, roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.82 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xc8ced7, roughness: 0.28, metalness: 0.78 });

  const addPart = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    vehicle.add(mesh);
  };

  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.66, 1.6), bodyMain);
  lowerBody.position.set(0, 0.72, 0);
  addPart(lowerBody);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.82, 1.48), bodyMain);
  cabin.position.set(0.35, 1.19, 0);
  addPart(cabin);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.26, 1.42), bodyMain);
  hood.position.set(1.44, 1.05, 0);
  hood.rotation.z = -0.04;
  addPart(hood);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.2, 1.32), bodyTrim);
  roof.position.set(0.1, 1.68, 0);
  addPart(roof);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.38, 0.04), glass);
  windshield.position.set(0.94, 1.37, 0);
  windshield.rotation.y = Math.PI / 2;
  windshield.rotation.z = -0.18;
  addPart(windshield);

  const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.33, 0.04), glass);
  rearWindow.position.set(-0.72, 1.36, 0);
  rearWindow.rotation.y = Math.PI / 2;
  rearWindow.rotation.z = 0.16;
  addPart(rearWindow);

  const sideWindowL = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.28, 0.04), glass);
  sideWindowL.position.set(0.03, 1.35, -0.76);
  addPart(sideWindowL);
  const sideWindowR = sideWindowL.clone();
  sideWindowR.position.z = 0.76;
  addPart(sideWindowR);

  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 1.18), chrome);
  grille.position.set(1.72, 0.92, 0);
  addPart(grille);

  const bumperFront = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 1.38), bodyTrim);
  bumperFront.position.set(1.82, 0.62, 0);
  addPart(bumperFront);

  const bumperRear = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 1.36), bodyTrim);
  bumperRear.position.set(-1.82, 0.62, 0);
  addPart(bumperRear);

  const roofRack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 1.08), bodyTrim);
  roofRack.position.set(0.08, 1.82, 0);
  addPart(roofRack);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.92, metalness: 0.1 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x90959e, roughness: 0.45, metalness: 0.75 });
  const wheelGeom = new THREE.CylinderGeometry(0.34, 0.34, 0.3, 22);
  const wheelCenters = [
    [1.05, 0.36, -0.86],
    [1.05, 0.36, 0.86],
    [-1.15, 0.36, -0.86],
    [-1.15, 0.36, 0.86]
  ];
  wheelCenters.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.position.set(x, y, z);
    wheel.rotation.z = Math.PI / 2;
    addPart(wheel);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.31, 16), rimMat);
    rim.position.set(x, y, z);
    rim.rotation.z = Math.PI / 2;
    addPart(rim);
  });

  const lightMat = new THREE.MeshStandardMaterial({ color: 0xf9fbff, emissive: 0x444444, roughness: 0.2 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0xd73d3d, emissive: 0x381111, roughness: 0.5 });
  const hL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.24), lightMat);
  hL.position.set(1.9, 0.9, -0.42);
  addPart(hL);
  const hR = hL.clone();
  hR.position.z = 0.42;
  addPart(hR);

  const tL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.22), tailMat);
  tL.position.set(-1.9, 0.88, -0.42);
  addPart(tL);
  const tR = tL.clone();
  tR.position.z = 0.42;
  addPart(tR);

  scene.add(vehicle);
  truckParts.push(vehicle);
}

function createTruckPaintTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f3f3f3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // franjas laterales tipo pickup
  ctx.fillStyle = '#d9d9d9';
  ctx.fillRect(0, 150, canvas.width, 16);
  ctx.fillStyle = '#b8b8b8';
  ctx.fillRect(0, 172, canvas.width, 8);

  // ruido sutil de pintura
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const c = 235 + Math.floor(Math.random() * 18);
    ctx.fillStyle = `rgb(${c},${c},${c})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.needsUpdate = true;
  return tex;
}

function clearRiverForBeach() {
  if (river) {
    scene.remove(river);
    river = null;
  }
  riverMaterial = null;
}

window.setWorldMode = function(mode) {
  worldMode = mode === 'beach' ? 'beach' : 'normal';
  if (worldMode !== 'beach') {
    tsunamiBeachLocked = false;
    if (sunnyMode === 'tsunami') sunnyMode = 'normal';
  } else {
    clearRiverForBeach();
  }

  // En playa siempre usamos base soleada para evitar que el clima fuerce mundo normal
  if (worldMode === 'beach' && currentWeather !== 'sunny') {
    currentWeather = 'sunny';
    sunnyMode = sunnyMode === 'tsunami' ? 'tsunami' : 'normal';
  }

  // Siempre regenera al presionar para aplicar estructura completa del bioma
  // (palmeras, mar/orilla, casa playera, sin puente de río)
  addEcosystem();
  setWeather(worldMode === 'beach' ? 'sunny' : currentWeather);
};

window.setBeachMode = function() {
  worldMode = 'beach';
  tsunamiBeachLocked = false;
  currentWeather = 'sunny';
  sunnyMode = 'normal';
  clearRiverForBeach();
  addEcosystem();
  setWeather('sunny');
};

window.setSunnyMode = function(mode) {
  const requestedMode = ['normal', 'extreme', 'wind', 'windstrong', 'tornado', 'tsunami'].includes(mode) ? mode : 'normal';
  if (requestedMode === 'tsunami' && worldMode !== 'beach') {
    sunnyMode = 'normal';
    tsunamiBeachLocked = false;
    updateWeatherOptionVisibility();
    if (currentWeather === 'sunny') setWeather('sunny');
    return;
  }

  sunnyMode = requestedMode;
  tsunamiBeachLocked = (sunnyMode === 'tsunami');
  if (currentWeather === 'sunny') setWeather('sunny');
  updateWeatherOptionVisibility();
};

window.setTsunamiMode = function() {
  if (worldMode !== 'beach') {
    tsunamiBeachLocked = false;
    if (sunnyMode === 'tsunami') sunnyMode = 'normal';
    updateWeatherOptionVisibility();
    return;
  }

  tsunamiBeachLocked = true;
  sunnyMode = 'tsunami';
  currentWeather = 'sunny';
  clearRiverForBeach();
  updateWeatherOptionVisibility();
  setWeather('sunny');
};

window.setSunnyWindDirection = function(direction) {
  if (direction === 'north') sunnyWindDirection = { x: 0, z: -1 };
  else if (direction === 'south') sunnyWindDirection = { x: 0, z: 1 };
  else if (direction === 'east') sunnyWindDirection = { x: 1, z: 0 };
  else if (direction === 'west') sunnyWindDirection = { x: -1, z: 0 };
};

window.setWinterMode = function(mode) {
  winterMode = ['normal', 'storm', 'avalanche'].includes(mode) ? mode : 'normal';
  if (currentWeather === 'winter') setWeather('winter');
};

window.setFireMode = function(mode) {
  if (mode === 'lava') {
    fireMode = 'lavaflow';
    if (currentWeather === 'fire') {
      startLavaAvalanche();
    }
    return;
  }
  fireMode = 'wildfire';
  if (currentWeather === 'fire') setWeather('fire');
};

// Lava tipo avalancha, baja y lenta
function startLavaAvalanche() {
  avalancheParts.forEach(p => scene.remove(p));
  avalancheParts = [];
  // Parámetros de la lava
  const startX = -WORLD_DISASTER_X;
  const endX = WORLD_DISASTER_X;
  const lowY = 0.7;
  const initialHeight = 0.65;
  const width = 3.2;
  const length = 31;
  const vx = 0.045; // Muy lenta
  // Pared de lava
  const lavaWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, initialHeight, length),
    new THREE.MeshStandardMaterial({
      color: 0xff5a1f,
      roughness: 0.7,
      metalness: 0.2,
      emissive: 0x7a1f00,
      opacity: 0.92,
      transparent: true
    })
  );
  lavaWall.position.set(startX, lowY, 0);
  lavaWall.castShadow = true;
  lavaWall.receiveShadow = true;
  lavaWall.userData = {
    kind: 'lava',
    vx,
    startX,
    endX,
    lowY,
    initialHeight,
    finished: false
  };
  scene.add(lavaWall);
  avalancheParts.push(lavaWall);
  // Restaurar objetos destruidos al cambiar de escena
  if (typeof window.resetDestroyedObjects === 'function') window.resetDestroyedObjects();
}

function setRiverAsLava(enable) {
  if (!river || !river.material) return;
  if (enable) {
    river.material.color.set(0xff5a1f);
    river.material.emissive = new THREE.Color(0x7a1f00);
    river.material.opacity = 0.93;
  } else {
    river.material.color.set(0x3399ff);
    river.material.emissive = new THREE.Color(0x000000);
    river.material.opacity = 0.7;
  }

  riverDetailParts.forEach((part) => {
    if (!part || !part.userData) return;
    if (part.userData.waterOnly) {
      part.visible = !enable;
    }
  });
}

function addSnowOnRoofs() {
  clearRoofSnow();
  roofSurfaces.forEach((obj) => {
    if (!obj || !obj.geometry) return;
    const snow = new THREE.Mesh(
      obj.geometry.clone(),
      new THREE.MeshStandardMaterial({ color: 0xf3f7fb, roughness: 0.84, metalness: 0.02 })
    );
    snow.position.copy(obj.position);
    snow.rotation.copy(obj.rotation);
    snow.scale.copy(obj.scale).multiplyScalar(1.03);
    snow.position.y += 0.035;
    snow.castShadow = true;
    snow.receiveShadow = true;
    scene.add(snow);
    roofSnowParts.push(snow);
  });
}

function clearRoofSnow() {
  roofSnowParts.forEach(s => scene.remove(s));
  roofSnowParts = [];
}

function startTsunami() {
  if (worldMode !== 'beach') return;
  tsunamiActive = true;
  if (!tsunamiWave) {
    const waveSpan = TSUNAMI_WATER_SPAN;

    trees.forEach((tree, idx) => {
      if (!tree || !tree.userData || !tree.userData.isPalm) return;
      tree.userData.baseRotX = typeof tree.userData.baseRotX === 'number' ? tree.userData.baseRotX : tree.rotation.x;
      tree.userData.baseRotZ = typeof tree.userData.baseRotZ === 'number' ? tree.userData.baseRotZ : tree.rotation.z;
      tree.userData.tsuPalmCurrent = 0;
      tree.userData.tsuPalmTarget = 0;
      tree.userData.tsuPalmPhase = typeof tree.userData.tsuPalmPhase === 'number' ? tree.userData.tsuPalmPhase : idx * 0.63;
    });

    const dog = dogParts.length > 0 ? dogParts[0] : null;
    if (dog && dog.userData) {
      dog.userData.surfing = true;
      if (dog.userData.surfBoat) dog.userData.surfBoat.visible = true;
    }

    tsunamiWave = new THREE.Group();

    const front = new THREE.Mesh(
      new THREE.PlaneGeometry(waveSpan, 8.8, 96, 44),
      createStylizedWaterShaderMaterial({
        deepColor: 0x081f2e,
        shallowColor: 0x1b4a66,
        foamColor: 0xf6fcff,
        skyTopColor: 0x5f8fa8,
        skyHorizonColor: 0xaecddf,
        alpha: 0.97,
        amplitude: 0.45,
        frequency: 0.56,
        speed: 2.2,
        foamStrength: 0.84,
        reflectivity: 0.58,
        fresnelPower: 3.8,
        specularStrength: 0.34,
        choppiness: 0.9,
        detailNormal: 0.32,
        refractionStrength: 0.07,
        absorption: 0.052,
        glitterStrength: 0.34,
        stormDarkness: 0.9,
        stormFoamBoost: 0.62,
        stormWaveBoost: 0.82,
        stormReactive: 1.0,
        side: THREE.DoubleSide
      })
    );
    front.rotation.y = Math.PI;
    front.position.set(0, 2.8, 0);
    tsunamiWave.add(front);

    const body = new THREE.Mesh(
      new THREE.PlaneGeometry(waveSpan, 7.4, 84, 32),
      createStylizedWaterShaderMaterial({
        deepColor: 0x0a2433,
        shallowColor: 0x1c5268,
        foamColor: 0xe8f5ff,
        skyTopColor: 0x668fa8,
        skyHorizonColor: 0xa8c8da,
        alpha: 0.93,
        amplitude: 0.32,
        frequency: 0.47,
        speed: 1.75,
        foamStrength: 0.38,
        reflectivity: 0.52,
        fresnelPower: 3.6,
        specularStrength: 0.3,
        choppiness: 0.72,
        detailNormal: 0.27,
        refractionStrength: 0.06,
        absorption: 0.048,
        glitterStrength: 0.28,
        stormDarkness: 0.84,
        stormFoamBoost: 0.54,
        stormWaveBoost: 0.67,
        stormReactive: 1.0,
        side: THREE.DoubleSide
      })
    );
    body.rotation.y = Math.PI;
    body.position.set(0, 2.1, -0.65);
    tsunamiWave.add(body);

    const crest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.34, waveSpan - 0.8, 14),
      new THREE.MeshStandardMaterial({
        color: 0xf2fbff,
        emissive: 0x6db1cf,
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.05,
        transparent: true,
        opacity: 0.94
      })
    );
    crest.rotation.z = Math.PI / 2;
    crest.position.set(0, 4.45, 0.22);
    crest.userData = { kind: 'tsunamiCrest' };
    tsunamiWave.add(crest);

    tsunamiWave.position.set(0, 1.35, -20);
    scene.add(tsunamiWave);

    if (!tsunamiWetTrail) {
      tsunamiWetTrail = new THREE.Mesh(
        new THREE.PlaneGeometry(waveSpan, waveSpan, 32, 32),
        createStylizedWaterShaderMaterial({
          deepColor: 0x1f5f82,
          shallowColor: 0x3f89ad,
          foamColor: 0xdceefa,
          skyTopColor: 0x7ab3cf,
          skyHorizonColor: 0xbbd9eb,
          alpha: 0.18,
          amplitude: 0.04,
          frequency: 0.34,
          speed: 0.78,
          foamStrength: 0.1,
          reflectivity: 0.22,
          fresnelPower: 2.7,
          specularStrength: 0.08,
          choppiness: 0.18,
          detailNormal: 0.08,
          refractionStrength: 0.08,
          absorption: 0.03,
          glitterStrength: 0.06,
          stormDarkness: 0.5,
          stormReactive: 0.5,
          side: THREE.DoubleSide
        })
      );
      tsunamiWetTrail.rotation.x = -Math.PI / 2;
      tsunamiWetTrail.position.set(0, 0.08, TSUNAMI_WET_MIN_Z + (TSUNAMI_WATER_SPAN * 0.0001) * 0.5);
      tsunamiWetTrail.scale.set(1, 0.0001, 1);
      tsunamiWetTrail.userData = { minZ: TSUNAMI_WET_MIN_Z, maxZ: TSUNAMI_WET_MAX_Z, span: TSUNAMI_WATER_SPAN };
      scene.add(tsunamiWetTrail);
    } else {
      tsunamiWetTrail.scale.y = 0.0001;
      tsunamiWetTrail.position.z = TSUNAMI_WET_MIN_Z + (TSUNAMI_WATER_SPAN * tsunamiWetTrail.scale.y) * 0.5;
      if (tsunamiWetTrail.material && tsunamiWetTrail.material.uniforms && tsunamiWetTrail.material.uniforms.uAlpha) {
        tsunamiWetTrail.material.uniforms.uAlpha.value = 0.13;
      }
    }

    createFloodWaterIfNeeded(true);

    const movableTrees = trees.filter((tree) => !(tree && tree.userData && tree.userData.isPalm));
    const movers = [...movableTrees, ...bushes, ...rocks, ...bridgeParts, ...houseParts, ...truckParts, ...backgroundBuildings];
    movers.forEach((obj, idx) => {
      if (!obj || !obj.position) return;
      obj.userData = obj.userData || {};
      obj.userData.tsuVel = {
        x: (Math.random() - 0.5) * 0.01,
        y: 0,
        z: 0.12 + Math.random() * 0.08
      };
      obj.userData.tsuSpin = {
        x: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      };
      obj.userData.tsuMass = 1 + (idx % 4) * 0.5;
      obj.userData.tsuDestroyed = false;
      obj.userData.tsuActivated = false;
    });
    tsunamiBodies = movers;
  }
}

function createFloodWaterIfNeeded(resetCoverage = false) {
  if (!floodWater) {
    floodWater = new THREE.Mesh(
      new THREE.PlaneGeometry(TSUNAMI_WATER_SPAN, TSUNAMI_WATER_SPAN, 48, 48),
      createStylizedWaterShaderMaterial({
        deepColor: 0x2c7ca5,
        shallowColor: 0x6cbfdf,
        foamColor: 0xeef8ff,
        skyTopColor: 0x9fd8ff,
        skyHorizonColor: 0xdcf3ff,
        alpha: 0.24,
        amplitude: 0.09,
        frequency: 0.36,
        speed: 1.0,
        foamStrength: 0.3,
        reflectivity: 0.3,
        fresnelPower: 2.9,
        specularStrength: 0.16,
        choppiness: 0.28,
        detailNormal: 0.13,
        refractionStrength: 0.11,
        absorption: 0.016,
        glitterStrength: 0.12,
        stormReactive: 0.42,
        side: THREE.DoubleSide
      })
    );
    floodWater.rotation.x = -Math.PI / 2;
    floodWater.userData = { minZ: TSUNAMI_WET_MIN_Z, maxZ: TSUNAMI_WET_MAX_Z, span: TSUNAMI_WATER_SPAN };
    scene.add(floodWater);
  }

  if (resetCoverage) {
    floodWater.visible = true;
    floodWater.position.set(0, 0.1, TSUNAMI_WET_MIN_Z + (TSUNAMI_WATER_SPAN * 0.0001) * 0.5);
    floodWater.scale.set(1, 0.0001, 1);
    if (floodWater.material && floodWater.material.uniforms && floodWater.material.uniforms.uAlpha) {
      floodWater.material.uniforms.uAlpha.value = 0.2;
    }
  }
}

function clearVolcano() {
  if (volcanoGroup) {
    scene.remove(volcanoGroup);
    volcanoGroup = null;
  }
  lavaBlobs.forEach(b => scene.remove(b));
  lavaBlobs = [];
}

function addVolcano() {
  if (volcanoGroup) return;
  volcanoGroup = new THREE.Group();
  volcanoGroup.position.set(0, 0, -13.8);

  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(4.8, 5.6, 24),
    new THREE.MeshStandardMaterial({ color: 0x4a3a35, roughness: 0.95 })
  );
  mountain.position.y = 2.8;
  mountain.castShadow = true;
  mountain.receiveShadow = true;
  volcanoGroup.add(mountain);

  const crater = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.22, 12, 30),
    new THREE.MeshStandardMaterial({ color: 0x2c2321, roughness: 0.9 })
  );
  crater.position.y = 5.35;
  crater.rotation.x = Math.PI / 2;
  volcanoGroup.add(crater);

  scene.add(volcanoGroup);

  for (let i = 0; i < 18; i++) {
    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xff7b2a, emissive: 0x8a2c00, roughness: 0.5 })
    );
    blob.position.set((Math.random() - 0.5) * 1.2, 5.4 + Math.random() * 0.35, -13.8 + (Math.random() - 0.5) * 1.2);
    blob.userData = { phase: Math.random() * Math.PI * 2, speed: 0.01 + Math.random() * 0.02 };
    scene.add(blob);
    lavaBlobs.push(blob);
  }
}

function resetRoofIfNeeded() {
  if (!houseRoofMain || !houseRoofHome) return;
  if (houseRoofDamageGroup) {
    scene.remove(houseRoofDamageGroup);
    houseRoofDamageGroup = null;
  }
  houseRoofDamaged = false;
  if (houseRoofMain.material) {
    houseRoofMain.material.transparent = false;
    houseRoofMain.material.opacity = 1;
    houseRoofMain.material.needsUpdate = true;
  }
  if (roofGone) {
    houseRoofMain.visible = true;
    roofGone = false;
  }
  roofFlight = 0;
  roofBlown = false;
  houseRoofMain.position.set(houseRoofHome.x, houseRoofHome.y, houseRoofHome.z);
  houseRoofMain.rotation.set(houseRoofHome.rx, houseRoofHome.ry, houseRoofHome.rz);
}

function strikeDogByLightning() {
  const dog = dogParts.length > 0 ? dogParts[0] : null;
  if (!dog || !dog.userData || !lightningLight) return;

  const hit = new THREE.Vector3(dog.position.x, 0.55, dog.position.z);
  const sky = new THREE.Vector3(dog.position.x + (Math.random() - 0.5) * 1.2, 13.5, dog.position.z + (Math.random() - 0.5) * 1.2);

  lightningLight.position.copy(hit).add(new THREE.Vector3(0, 2.2, 0));
  lightningLight.intensity = 6.5;
  lightningFlashFrames = 4;

  if (houseLightningBolt) {
    scene.remove(houseLightningBolt);
    houseLightningBolt = null;
  }

  const points = [sky];
  const steps = 7;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    points.push(new THREE.Vector3(
      sky.x + (hit.x - sky.x) * t + (Math.random() - 0.5) * 0.7,
      sky.y + (hit.y - sky.y) * t,
      sky.z + (hit.z - sky.z) * t + (Math.random() - 0.5) * 0.7
    ));
  }
  points.push(hit);

  houseLightningBolt = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0xe8f3ff, transparent: true, opacity: 0.95 })
  );
  scene.add(houseLightningBolt);
  houseLightningBoltFrames = 6;

  if (dog.userData.furMaterial) {
    dog.userData.furMaterial.color.set(0x151515);
  }
  dog.userData.struckBlack = true;
  dogState.mode = 'idle';
  dogState.wait = 1200;

  startDogRescue();
  houseStrikeCooldown = 420;
}

function startAvalanche() {
  avalancheParts.forEach(p => scene.remove(p));
  avalancheParts = [];

  // Parámetros de la avalancha
  const startX = -WORLD_DISASTER_X;
  const endX = WORLD_DISASTER_X;
  const highY = 5.2;
  const lowY = 1.8;
  const initialHeight = 4.8;
  const width = 3.6;
  const length = 31;
  const vx = 0.19;

  // Pared de la avalancha
  const avalancheWall = new THREE.Mesh(
    new THREE.BoxGeometry(width, initialHeight, length),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      map: _snowTexture || null
    })
  );
  avalancheWall.position.set(startX, highY, 0);
  avalancheWall.castShadow = true;
  avalancheWall.receiveShadow = true;
  avalancheWall.userData = {
    kind: 'wall',
    vx,
    startX,
    endX,
    highY,
    lowY,
    initialHeight,
    finished: false
  };
  scene.add(avalancheWall);
  avalancheParts.push(avalancheWall);

  // Rastro de la avalancha
  const snowCover = new THREE.Mesh(
    new THREE.BoxGeometry(35, initialHeight, 35),
    new THREE.MeshStandardMaterial({
      color: 0xf7fbff,
      roughness: 0.88,
      metalness: 0.0,
      map: _snowTexture || null
    })
  );
  snowCover.position.set(startX, highY - initialHeight * 0.5, 0);
  snowCover.scale.x = 0.001;
  snowCover.scale.y = 1;
  snowCover.receiveShadow = true;
  snowCover.userData = { kind: 'cover', minScaleX: 0.001 };
  scene.add(snowCover);
  avalancheParts.push(snowCover);
}

function updateTsunamiButtonsState() {
  const tsunamiEnabled = worldMode === 'beach';
  ['btn-tsunami-main', 'btn-tsunami-sunny'].forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = !tsunamiEnabled;
    btn.title = tsunamiEnabled ? 'Activar tsunami en playa' : 'Tsunami solo disponible en mapa Playa';
    btn.style.opacity = tsunamiEnabled ? '1' : '0.58';
    btn.style.cursor = tsunamiEnabled ? 'pointer' : 'not-allowed';
  });
}

function updateWeatherOptionVisibility() {
  const groups = {
    sunny: document.getElementById('options-sunny'),
    rain: document.getElementById('options-rain'),
    winter: document.getElementById('options-winter'),
    fire: document.getElementById('options-fire')
  };

  Object.keys(groups).forEach((k) => {
    const el = groups[k];
    if (!el) return;
    el.classList.toggle('active', k === currentWeather);
  });

  updateTsunamiButtonsState();
}

function pickDogTarget(fromX, fromZ) {
  let tx = fromX;
  let tz = fromZ;
  let tries = 0;
  do {
    tx = (Math.random() * 2 - 1) * dogState.roamRadius;
    tz = (Math.random() * 2 - 1) * dogState.roamRadius;

    const nearRiver = Math.abs(tz - RIVER_CENTER_Z) < 2.25;
    const nearHouse = Math.abs(tx - HOUSE_POS.x) < 3.45 && Math.abs(tz - HOUSE_POS.z) < 3.1;
    const farEnough = Math.hypot(tx - fromX, tz - fromZ) > 4.6;
    if (!nearRiver && !nearHouse && farEnough) {
      return { x: tx, z: tz };
    }
    tries++;
  } while (tries < 40);

  return { x: tx, z: tz };
}

function animate() {
  requestAnimationFrame(animate);
  WATER_TIME.value = Date.now() * 0.001;
  const stormTarget = (currentWeather === 'sunny' && sunnyMode === 'tsunami' && worldMode === 'beach') ? 1 : 0;
  WATER_STORM.value += (stormTarget - WATER_STORM.value) * 0.06;

  if (houseStrikeCooldown > 0) houseStrikeCooldown--;
  if (houseStrikePendingFrames > 0) {
    houseStrikePendingFrames--;
    if (houseStrikePendingFrames <= 0 && currentWeather === 'rain' && lightningEnabled) {
      strikeDogByLightning();
    }
  }
  if (houseLightningBolt && houseLightningBoltFrames > 0) {
    houseLightningBoltFrames--;
    if (houseLightningBolt.material) {
      houseLightningBolt.material.opacity = Math.max(0, houseLightningBoltFrames / 5);
    }
    if (houseLightningBoltFrames <= 0) {
      scene.remove(houseLightningBolt);
      houseLightningBolt = null;
    }
  }

  // --- Movimiento mejorado del perro ---
    if (dogParts.length > 0) {
      const dog = dogParts[0];
      const { frontLegL, frontLegR, backLegL, backLegR, head } = dog.userData || {};
      const surfingNow = currentWeather === 'sunny' && sunnyMode === 'tsunami' && worldMode === 'beach' && tsunamiActive && !!tsunamiWave;

      if (surfingNow) {
        const surfX = Math.sin(Date.now() * 0.00095) * 2.5;
        const surfZ = tsunamiWave.position.z - 0.2;
        const surfY = 1.34 + Math.sin(Date.now() * 0.0041) * 0.09;
        dog.visible = true;
        dog.position.set(surfX, surfY, surfZ);
        dog.rotation.y = Math.PI;
        dog.rotation.x = Math.sin(Date.now() * 0.0033) * 0.04;
        dog.rotation.z = Math.sin(Date.now() * 0.0042) * 0.1;
        if (dog.userData) {
          dog.userData.surfing = true;
          if (dog.userData.surfBoat) {
            dog.userData.surfBoat.visible = true;
            dog.userData.surfBoat.position.set(-0.08, -0.12, 0);
            dog.userData.surfBoat.rotation.y = 0;
            dog.userData.surfBoat.rotation.x = Math.sin(Date.now() * 0.0048) * 0.06;
            dog.userData.surfBoat.rotation.z = Math.sin(Date.now() * 0.0051) * 0.11;
          }
        }
        dogState.mode = 'idle';
        dogState.wait = 999;
      } else if (currentWeather === 'sunny' && (sunnyMode === 'windstrong' || sunnyMode === 'tornado')) {
        dog.userData.blownAway = true;
        dog.userData.flyVelY = Math.min(0.22, (dog.userData.flyVelY || 0) + 0.01);
        const push = sunnyMode === 'tornado' ? 0.32 : 0.24;
        dog.position.x += sunnyWindDirection.x * push;
        dog.position.z += sunnyWindDirection.z * push;
        dog.position.y += dog.userData.flyVelY;
        dog.rotation.z += sunnyWindDirection.x * 0.14;
        dog.rotation.x += -sunnyWindDirection.z * 0.14;
        if (Math.abs(dog.position.x) > (WORLD_HALF + 6) || Math.abs(dog.position.z) > (WORLD_HALF + 6) || dog.position.y > 15) {
          dog.visible = false;
        }
      } else if (dog.userData.blownAway) {
        dog.userData.blownAway = false;
        dog.userData.flyVelY = 0;
        dog.visible = true;
        dog.position.set(HOUSE_POS.x + 3.6, 0, HOUSE_POS.z + 0.9);
        dog.rotation.set(0, -0.55, 0);
      }

      if (!surfingNow && dog.userData && dog.userData.surfing) {
        dog.userData.surfing = false;
        if (dog.userData.surfBoat) dog.userData.surfBoat.visible = false;
        dog.position.set(HOUSE_POS.x + 3.6, 0, HOUSE_POS.z + 0.9);
        dog.rotation.set(0, -0.55, 0);
      }

      if (currentWeather === 'fire' && burningTrees.length > 0) {
        const targetTree = trees[burningTrees[0]];
        if (targetTree && targetTree.position) {
          const tx = targetTree.position.x;
          const tz = targetTree.position.z;
          dog.position.set(tx - 1.35, 0, tz + 0.35);
          dog.lookAt(tx, 0, tz);
        }
        dogState.mode = 'idle';
        dogState.wait = 999;
      } else if (dogState.wait > 0) {
        dogState.wait -= 1;
        if (dogState.mode === 'drink') {
          if (head) head.rotation.x = Math.min(0.7, head.rotation.x + 0.03);
        }
      } else {
        // Decidir nueva acción
        if (dogState.mode === 'drink') {
          if (head) head.rotation.x = 0;
          dogState.mode = 'idle';
          dogState.wait = 40 + Math.random() * 60;
        } else if (Math.random() < 0.01 && Date.now() - dogState.lastDrink > 8000 &&
          Math.abs(dog.position.x - 0) < 4 && Math.abs(dog.position.z + 6) < 2) {
          dogState.mode = 'drink';
          dogState.wait = 80 + Math.random() * 40;
          dogState.lastDrink = Date.now();
        } else if (!dogState.target || Math.random() < 0.08) {
          // Elegir destino aleatorio en todo el terreno
          let tries = 0;
          let tx, tz;
          do {
            tx = (Math.random() - 0.5) * (WORLD_OBJECT_RANGE - 6);
            tz = (Math.random() - 0.5) * (WORLD_OBJECT_RANGE - 6);
            tries++;
          } while ((Math.abs(tx - HOUSE_POS.x) < 3.4 && Math.abs(tz - HOUSE_POS.z) < 3.05) ||
                   (Math.abs(tz - RIVER_CENTER_Z) < 2.25) && tries < 10);
          dogState.target = { x: tx, z: tz };
          dogState.mode = 'walk';
        } else {
          dogState.mode = 'idle';
          dogState.wait = 12 + Math.random() * 24;
        }
      }
      if (dogState.mode === 'walk' && dogState.target) {
        // Mover hacia el destino
        const dx = dogState.target.x - dog.position.x;
        const dz = dogState.target.z - dog.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.12) {
          const angle = Math.atan2(dx, dz);
          dog.rotation.y = angle;
          const nx = dog.position.x + Math.sin(angle) * dogState.speed;
          const nz = dog.position.z + Math.cos(angle) * dogState.speed;
          const insideHouse = Math.abs(nx - HOUSE_POS.x) < 3.4 && Math.abs(nz - HOUSE_POS.z) < 3.05;
          const insideRiver = Math.abs(nz - RIVER_CENTER_Z) < 2.25;
          if (!insideHouse && !insideRiver) {
            dog.position.x = nx;
            dog.position.z = nz;
          } else {
            dogState.target = null;
          }
          // Animar patas
          dogState.legPhase += 0.18;
          if (frontLegL && frontLegR && backLegL && backLegR) {
            frontLegL.rotation.x = Math.sin(dogState.legPhase) * 0.5;
            frontLegR.rotation.x = -Math.sin(dogState.legPhase) * 0.5;
            backLegL.rotation.x = -Math.sin(dogState.legPhase) * 0.4;
            backLegR.rotation.x = Math.sin(dogState.legPhase) * 0.4;
          }
        } else {
          dogState.target = null;
          dogState.mode = 'idle';
          dogState.wait = 8 + Math.random() * 18;
          if (frontLegL && frontLegR && backLegL && backLegR) {
            frontLegL.rotation.x = 0;
            frontLegR.rotation.x = 0;
            backLegL.rotation.x = 0;
            backLegR.rotation.x = 0;
          }
        }
      } else if (dogState.mode !== 'drink') {
        if (frontLegL && frontLegR && backLegL && backLegR) {
          frontLegL.rotation.x = 0;
          frontLegR.rotation.x = 0;
          backLegL.rotation.x = 0;
          backLegR.rotation.x = 0;
        }
      }
      if (dogState.mode === 'drink' && head) {
        head.rotation.x = Math.min(0.7, head.rotation.x + 0.03);
      } else if (head) {
        head.rotation.x = Math.max(0, head.rotation.x - 0.03);
      }
    }

  // Mucho viento (meciendo copas y ramas)
  if (windStrength > 0 && currentWeather !== 'winter') {
    const t = Date.now() * 0.0015;
    crowns.forEach((crown, i) => {
      if (!crown) return;
      crown.rotation.z = Math.sin(t + i * 0.7) * windStrength;
      crown.rotation.x = Math.cos(t * 0.8 + i * 0.5) * windStrength * 0.6;
    });
    branches.forEach((b, i) => {
      if (!b) return;
      b.rotation.y = Math.sin(t * 1.2 + i) * windStrength * 1.2;
    });
  }

  // Viento: tambaleo del árbol completo (sin deslizarlo de lado a lado)
  if (currentWeather === 'sunny' && (sunnyMode === 'wind' || sunnyMode === 'windstrong')) {
    const t = Date.now() * 0.0018;
    const ampRot = sunnyMode === 'windstrong' ? 0.16 : 0.08;
    windyObjects.forEach((obj) => {
      if (!obj || !obj.userData) return;
      const phase = obj.userData.windPhase || 0;
      const baseRotX = typeof obj.userData.baseRotX === 'number' ? obj.userData.baseRotX : 0;
      const baseRotZ = typeof obj.userData.baseRotZ === 'number' ? obj.userData.baseRotZ : 0;
      let factor = 1;
      let speedMul = 1;
      if (obj.userData.windKind === 'bush') {
        factor = 0.42;
      } else if (obj.userData.windKind === 'building') {
        factor = 0.28;
        speedMul = 0.62;
      }
      const wobble = Math.sin(t * speedMul + phase);
      obj.rotation.z = baseRotZ + sunnyWindDirection.x * (0.25 + wobble * 0.75) * ampRot * factor;
      obj.rotation.x = baseRotX - sunnyWindDirection.z * (0.2 + Math.cos(t * 0.9 * speedMul + phase) * 0.6) * ampRot * 0.9 * factor;
    });
  } else {
    windyObjects.forEach((obj) => {
      if (!obj || !obj.userData) return;
      if (worldMode === 'beach' && sunnyMode === 'tsunami' && obj.userData.isPalm) return;
      const baseRotX = typeof obj.userData.baseRotX === 'number' ? obj.userData.baseRotX : 0;
      const baseRotZ = typeof obj.userData.baseRotZ === 'number' ? obj.userData.baseRotZ : 0;
      obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, baseRotX, 0.12);
      obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, baseRotZ, 0.12);
    });
  }

  // Palmeras en tsunami: se inclinan lento y regresan lento (sin salir volando)
  if (worldMode === 'beach' && trees.length > 0) {
    const tPalm = Date.now() * 0.001;
    trees.forEach((tree, i) => {
      if (!tree || !tree.userData || !tree.userData.isPalm) return;
      const u = tree.userData;
      const baseX = typeof u.baseRotX === 'number' ? u.baseRotX : 0;
      const baseZ = typeof u.baseRotZ === 'number' ? u.baseRotZ : 0;

      let targetLean = 0;
      if (tsunamiActive && tsunamiWave) {
        const dist = Math.abs(tsunamiWave.position.z - tree.position.z);
        const impact = THREE.MathUtils.clamp(1 - dist / 8.5, 0, 1);
        targetLean = -0.28 * impact;
      }

      u.tsuPalmTarget = targetLean;
      u.tsuPalmCurrent = THREE.MathUtils.lerp(u.tsuPalmCurrent || 0, u.tsuPalmTarget, 0.02);

      const sideSway = Math.sin(tPalm * 0.72 + (u.tsuPalmPhase || i * 0.6)) * 0.03 * Math.abs(u.tsuPalmCurrent);
      tree.rotation.x = baseX + u.tsuPalmCurrent;
      tree.rotation.z = baseZ + sideSway;
    });
  }

  // Tornado automático: succión y destrucción de objetos
  if (currentWeather === 'sunny' && sunnyMode === 'tornado' && tornadoCore) {
    const tAuto = Date.now() * 0.00045;
    const targetX = Math.sin(tAuto) * 10.2;
    const targetZ = Math.cos(tAuto * 0.82) * 7.2;
    tornadoCore.position.x = THREE.MathUtils.lerp(tornadoCore.position.x, targetX, 0.08);
    tornadoCore.position.z = THREE.MathUtils.lerp(tornadoCore.position.z, targetZ, 0.08);
    tornadoCore.rotation.y += 0.25;
    tornadoCore.children.forEach((ch, i) => {
      if (!ch || !ch.userData || typeof ch.userData.ringPhase !== 'number') return;
      ch.rotation.z += 0.08 + i * 0.005;
      ch.position.x = Math.sin(Date.now() * 0.004 + ch.userData.ringPhase) * 0.16;
      ch.position.z = Math.cos(Date.now() * 0.004 + ch.userData.ringPhase) * 0.16;
    });

    const candidates = [...trees, ...bushes, ...rocks, ...bridgeParts, ...houseParts, ...truckParts, ...backgroundBuildings, ...grassPatches, ...dogParts];
    candidates.forEach((obj, idx) => {
      if (!obj || !obj.position || obj.visible === false) return;
      if (obj.userData && obj.userData.tornadoDestroyed) return;
      const dx = obj.position.x - tornadoCore.position.x;
      const dz = obj.position.z - tornadoCore.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const pullRadius = (obj.userData && obj.userData.windKind === 'bush') ? 2.2 : 2.9;
      if (dist < pullRadius) {
        obj.userData = obj.userData || {};
        obj.userData.tornadoCaptured = true;
        obj.userData.torAngle = Math.atan2(dz, dx);
        obj.userData.torRadius = Math.max(0.2, dist);
        obj.userData.torLift = obj.userData.torLift || 0.05;
        obj.userData.torSpin = 0.08 + (idx % 5) * 0.02;
      }
    });

    const captured = candidates.filter((o) => o && o.userData && o.userData.tornadoCaptured && !o.userData.tornadoDestroyed);
    captured.forEach((obj) => {
      obj.userData.torAngle += 0.23;
      obj.userData.torRadius = Math.max(0.08, obj.userData.torRadius * 0.97);
      obj.userData.torLift = Math.min(0.28, (obj.userData.torLift || 0.05) + 0.008);

      obj.position.x = tornadoCore.position.x + Math.cos(obj.userData.torAngle) * obj.userData.torRadius;
      obj.position.z = tornadoCore.position.z + Math.sin(obj.userData.torAngle) * obj.userData.torRadius;
      obj.position.y += obj.userData.torLift;
      obj.rotation.y += obj.userData.torSpin;
      obj.rotation.x += obj.userData.torSpin * 0.6;

      if (obj.position.y > 7.5) {
        obj.userData.tornadoDestroyed = true;
        obj.visible = false;
        scene.remove(obj);
      }
    });

    resolveDynamicCollisions(captured, 0.35);
  }

  // Viento muy fuerte: techo vuela y revela interior
  if (currentWeather === 'sunny' && sunnyMode === 'windstrong' && houseRoofMain && houseRoofHome) {
    roofBlown = true;
    roofFlight = Math.min(1, roofFlight + 0.012);
    houseRoofMain.position.x = houseRoofHome.x + sunnyWindDirection.x * (roofFlight * 4.2);
    houseRoofMain.position.y = houseRoofHome.y + roofFlight * 5.5;
    houseRoofMain.position.z = houseRoofHome.z + sunnyWindDirection.z * (roofFlight * 4.2);
    houseRoofMain.rotation.z = houseRoofHome.rz + roofFlight * 1.1;
    houseRoofMain.rotation.x = houseRoofHome.rx + roofFlight * 0.45;

    if (roofFlight > 0.98 && !roofGone) {
      roofGone = true;
      houseRoofMain.visible = false; // ya no se ve en el plano del mapa
    }
  } else if (houseRoofMain && houseRoofHome && roofBlown) {
    resetRoofIfNeeded();
  }
  // Animar partículas de fuego
  if (fireEffects.length > 0) {
    fireEffects.forEach(group => {
      group.children.forEach(mesh => {
        mesh.position.y += mesh.userData.speed;
        if (mesh.position.y > mesh.userData.baseY + mesh.userData.amplitude) {
          mesh.position.y = mesh.userData.baseY;
        }
        mesh.material.opacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.002 + mesh.position.x);
      });
    });
  }

  // Animar lluvia y nieve
  if (weatherEffects.length > 0) {
    weatherEffects.forEach(effect => {
      const attr = effect.geometry.getAttribute('position');
      const speed = effect.userData.speed;
      for (let i = 0; i < attr.count; i++) {
        if (effect.userData.type === 'heat') {
          attr.array[i * 3 + 1] += speed[i];
          attr.array[i * 3] += Math.sin((Date.now() * 0.003) + i) * 0.004;
          attr.array[i * 3 + 2] += Math.cos((Date.now() * 0.0026) + i) * 0.003;
          if (attr.array[i * 3 + 1] > 2.2) {
            attr.array[i * 3 + 1] = 0.08 + Math.random() * 0.35;
            attr.array[i * 3] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
            attr.array[i * 3 + 2] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
          }
          continue;
        }

        if (effect.userData.type === 'firecloud') {
          attr.array[i * 3] += Math.sin((Date.now() * 0.0007) + i) * 0.01;
          attr.array[i * 3 + 2] += Math.cos((Date.now() * 0.0006) + i) * 0.01;
          attr.array[i * 3 + 1] += speed[i];
          if (attr.array[i * 3 + 1] > 13.5) {
            attr.array[i * 3 + 1] = 5.5 + Math.random() * 1.2;
          }
          continue;
        }

        attr.array[i * 3 + 1] -= speed[i];
        if (effect.userData.type === 'snow') {
          attr.array[i * 3] += Math.sin((Date.now() * 0.001) + i) * 0.003;
          attr.array[i * 3 + 2] += Math.cos((Date.now() * 0.0012) + i) * 0.002;
        }
        if (attr.array[i * 3 + 1] < 0.1) {
          attr.array[i * 3 + 1] = 10 + Math.random() * 6;
          attr.array[i * 3] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
          attr.array[i * 3 + 2] = (Math.random() - 0.5) * WORLD_EFFECT_RANGE;
        }
      }
      attr.needsUpdate = true;
    });
  }

  // Manguera del perro bombero hacia árbol en llamas
  if (currentWeather === 'fire' && dogParts.length > 0) {
    const dog = dogParts[0];
    const hose = dog && dog.userData ? dog.userData.hoseStream : null;
    if (hose && hose.userData && hose.userData.target && hose.userData.target.position) {
      const start = new THREE.Vector3(dog.position.x + 0.6, 0.62, dog.position.z);
      const target = hose.userData.target.position;
      const end = new THREE.Vector3(target.x, target.y + 1.0, target.z);
      hose.geometry.setFromPoints([start, end]);
      hose.material.opacity = 0.65 + Math.sin(Date.now() * 0.01) * 0.2;
      dog.lookAt(target.x, dog.position.y, target.z);
    }
  }

  // Tsunami arrastra elementos
  if (tsunamiActive && tsunamiWave) {
    tsunamiWave.position.z += 0.13;
    tsunamiWave.position.y = 1.35 + Math.sin(Date.now() * 0.0032) * 0.18;
    tsunamiWave.rotation.x = Math.sin(Date.now() * 0.0023) * 0.03;
    if (tsunamiWave.children && tsunamiWave.children.length > 0) {
      tsunamiWave.children.forEach((ch) => {
        if (ch && ch.userData && ch.userData.kind === 'tsunamiCrest' && ch.material) {
          ch.material.opacity = 0.72 + Math.sin(Date.now() * 0.005) * 0.12;
          ch.material.emissiveIntensity = 0.46 + Math.sin(Date.now() * 0.0042) * 0.22;
        }
      });
    }

    if (!garageDestroyedByTsunami && tsunamiWave.position.z > 2.1) {
      damageGarageByTsunami();
    }

    tsunamiBodies.forEach((obj, idx) => {
      if (!obj) return;
      if (obj.position && tsunamiWave.position.z > obj.position.z - 1.0) {
        if (!obj.userData.tsuActivated) {
          obj.userData.tsuActivated = true;
          const vel = obj.userData.tsuVel || { x: 0, y: 0, z: 0.12 };
          vel.z += 0.06;
          vel.y += 0.045;
          obj.userData.tsuVel = vel;
        }

        const vel = obj.userData.tsuVel || { x: 0, y: 0, z: 0.12 };
        const spin = obj.userData.tsuSpin || { x: 0.01, z: 0.01 };
        const mass = obj.userData.tsuMass || 1;
        vel.z += 0.004 / mass;
        vel.y += 0.002 - 0.0012 * mass;
        vel.x += Math.sin(Date.now() * 0.002 + idx) * 0.0008;
        vel.y *= 0.96;
        vel.z *= 0.992;
        vel.x *= 0.992;

        obj.position.x += vel.x;
        obj.position.y = Math.max(0, obj.position.y + vel.y);
        obj.position.z += vel.z;
        if (obj !== ground && obj !== sea && obj !== river) {
          obj.rotation.x += spin.x;
          obj.rotation.z += spin.z;
        }
      }
    });

    resolveDynamicCollisions(tsunamiBodies, 0.5);

    if (tsunamiWave.position.z > 22) {
      tsunamiActive = false;
    }
  }

  // Línea húmeda persistente que deja el tsunami a su paso
  if (tsunamiWetTrail) {
    const minZ = tsunamiWetTrail.userData ? tsunamiWetTrail.userData.minZ : TSUNAMI_WET_MIN_Z;
    const maxZ = tsunamiWetTrail.userData ? tsunamiWetTrail.userData.maxZ : TSUNAMI_WET_MAX_Z;
    const span = tsunamiWetTrail.userData ? (tsunamiWetTrail.userData.span || (maxZ - minZ)) : (maxZ - minZ);
    const waveZ = tsunamiWave ? tsunamiWave.position.z : maxZ + 2;
    const trailEnd = Math.min(maxZ, Math.max(minZ, waveZ - 1.1));
    const progress = Math.min(1, Math.max(0, (trailEnd - minZ) / (maxZ - minZ)));
    tsunamiWetTrail.scale.y = Math.max(0.0001, progress);
    tsunamiWetTrail.position.z = minZ + (span * tsunamiWetTrail.scale.y) * 0.5;
    if (tsunamiWetTrail.material && tsunamiWetTrail.material.uniforms && tsunamiWetTrail.material.uniforms.uAlpha) {
      tsunamiWetTrail.material.uniforms.uAlpha.value = 0.13 + progress * 0.16 + Math.sin(Date.now() * 0.0018) * 0.01;
    }

    if (floodWater) {
      floodWater.scale.y = Math.max(0.0001, progress);
      floodWater.position.z = minZ + (span * floodWater.scale.y) * 0.5;
      if (floodWater.material && floodWater.material.uniforms && floodWater.material.uniforms.uAlpha) {
        floodWater.material.uniforms.uAlpha.value = 0.16 + progress * 0.26 + Math.sin(Date.now() * 0.0014) * 0.014;
      }
    }
  }

  // Avalancha
  if (avalancheParts.length > 0 && currentWeather === 'winter' && winterMode === 'avalanche') {
    const wall = avalancheParts.find((p) => p && p.userData && p.userData.kind === 'wall');
    const cover = avalancheParts.find((p) => p && p.userData && p.userData.kind === 'cover');
    if (wall && !wall.userData.finished) {
      wall.position.x += wall.userData.vx;
      const { startX, endX, highY, lowY, initialHeight } = wall.userData;
      const progress = Math.min(1, Math.max(0, (wall.position.x - startX) / Math.max(0.001, (endX - startX))));
      // Altura disminuye con el progreso
      const currentHeight = initialHeight - progress * (initialHeight - 1.1);
      wall.scale.y = currentHeight / initialHeight;
      wall.position.y = highY - progress * (highY - lowY) + Math.sin(Date.now() * 0.0023) * 0.1;
      // Detener la avalancha al llegar al final
      if (wall.position.x >= endX) {
        wall.position.x = endX;
        wall.userData.finished = true;
      }

      // Inclinar objetos tocados por la avalancha
      const affected = [...trees, ...bushes, ...rocks, ...houseParts, ...bridgeParts, ...garageParts, ...truckParts, ...backgroundBuildings];
      const wallMinX = wall.position.x - (wall.geometry.parameters.width / 2);
      const wallMaxX = wall.position.x + (wall.geometry.parameters.width / 2);
      affected.forEach(obj => {
        if (!obj || !obj.position) return;
        // Si el objeto está dentro del rango X de la avalancha
        if (obj.position.x > wallMinX && obj.position.x < wallMaxX) {
          // Inclina solo en X, como si lo empujara
          obj.rotation.x = Math.PI / 7;
        } else {
          // Si ya pasó la avalancha, regresa a posición normal
          obj.rotation.x = 0;
        }
      });

      if (cover) {
        // El rastro crece y su altura se sincroniza con la pared
        const traveled = Math.max(0.001, wall.position.x - startX);
        const total = Math.max(0.001, endX - startX);
        const filledRatio = Math.min(1, traveled / total);
        cover.scale.x = Math.max(cover.userData.minScaleX || 0.001, filledRatio);
        cover.scale.y = wall.scale.y;
        cover.position.x = startX + (35 * cover.scale.x) * 0.5;
        // La base del rastro sigue la base de la pared
        const baseY = wall.position.y - (currentHeight * 0.5);
        cover.position.y = baseY + (currentHeight * 0.5);

        if (cover.material) {
          cover.material.transparent = false;
          cover.material.opacity = 1;
        }
      }
    }
  }

  // Lava animada (río + volcán)
  if (currentWeather === 'fire' && fireMode === 'volcano' && river && river.material) {
    const t = Date.now() * 0.002;
    const c = 0.55 + 0.45 * Math.sin(t);
    river.material.emissive.setRGB(0.5 + c * 0.3, 0.12 + c * 0.08, 0.02);
    river.material.color.setRGB(0.9, 0.32 + c * 0.08, 0.08);
    river.material.opacity = 0.86 + 0.07 * Math.sin(t * 1.3);
    lavaBlobs.forEach((b, i) => {
      b.position.y += Math.sin(t * 2 + i) * 0.01;
      b.material.emissive.setHex(0x7a2c00 + (i % 3) * 0x050000);
    });
  }

  // Rayos en clima lluvia (destellos aleatorios)
  if (currentWeather === 'rain' && lightningEnabled && lightningLight) {
    if (lightningFlashFrames <= 0 && Math.random() < (rainIntensity === 'heavy' ? 0.02 : 0.008)) {
      lightningFlashFrames = 2 + Math.floor(Math.random() * 2);
      const strikeDogNow = houseStrikeCooldown <= 0 && houseStrikePendingFrames <= 0 && dogParts.length > 0 && Math.random() < (rainIntensity === 'heavy' ? 0.55 : 0.35);
      if (strikeDogNow) {
        houseStrikePendingFrames = 160 + Math.floor(Math.random() * 120); // 2.6s - 4.6s
        const dog = dogParts[0];
        lightningLight.position.set(dog.position.x, 11.8, dog.position.z);
        lightningLight.intensity = 3.2;
      } else {
        lightningLight.position.set((Math.random() - 0.5) * 20, 10 + Math.random() * 7, -6 + (Math.random() - 0.5) * 12);
        lightningLight.intensity = rainIntensity === 'heavy' ? 5.5 : 4.0;
      }
    } else if (lightningFlashFrames > 0) {
      lightningFlashFrames--;
      if (lightningFlashFrames <= 0) lightningLight.intensity = 0;
    }
  } else if (lightningLight) {
    lightningFlashFrames = 0;
    lightningLight.intensity = 0;
    houseStrikePendingFrames = 0;
    if (houseLightningBolt) {
      scene.remove(houseLightningBolt);
      houseLightningBolt = null;
      houseLightningBoltFrames = 0;
    }
  }

  // Animación del personaje en llamas: sale de casa y se avienta al río
  if (runnerActive && runner) {
    // Más lento que antes
    runnerProgress += 0.0032;
    const totalSegments = Math.max(runnerPath.length - 1, 1);
    const u = Math.min(runnerProgress, 1) * totalSegments;
    const seg = Math.min(Math.floor(u), totalSegments - 1);
    const localT = u - seg;

    const p0 = runnerPath[seg] || runnerPath[0];
    const p1 = runnerPath[seg + 1] || runnerPath[runnerPath.length - 1];

    runner.position.x = p0.x + (p1.x - p0.x) * localT;
    runner.position.z = p0.z + (p1.z - p0.z) * localT;

    // pequeño salto al final cuando ya va hacia el río
    const isFinalSegment = seg === totalSegments - 1;
    runner.position.y = isFinalSegment ? Math.sin(Math.PI * localT) * 1.2 : 0;

    // orientar hacia el siguiente punto de la ruta
    runner.lookAt(p1.x, runner.position.y, p1.z);

    if (runnerFire) {
      runnerFire.position.y = 1.0 + Math.sin(Date.now() * 0.015) * 0.04;
    }

    // Al llegar al río, se apaga y desaparece
    if (runnerProgress >= 1) {
      runnerActive = false;
      if (runnerFire) {
        scene.remove(runnerFire);
        runnerFire = null;
      }
      runner.visible = false;
    }
  }

  // Rescate del perro tras rayo: dueño sale, lo toma y lo mete a la casa
  if (dogRescueActive && dogOwnerRescuer && dogParts.length > 0) {
    const dog = dogParts[0];
    if (dogRescueStage === 0) {
      const tx = dog.position.x;
      const tz = dog.position.z;
      const dx = tx - dogOwnerRescuer.position.x;
      const dz = tz - dogOwnerRescuer.position.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.12) {
        dogOwnerRescuer.position.x += (dx / d) * 0.06;
        dogOwnerRescuer.position.z += (dz / d) * 0.06;
        dogOwnerRescuer.lookAt(tx, 0, tz);
      } else {
        dogRescueStage = 1;
      }
    } else if (dogRescueStage === 1) {
      const inX = HOUSE_POS.x - 0.35;
      const inZ = HOUSE_POS.z - 0.2;
      const dx = inX - dogOwnerRescuer.position.x;
      const dz = inZ - dogOwnerRescuer.position.z;
      const d = Math.hypot(dx, dz);

      dog.position.set(dogOwnerRescuer.position.x + 0.18, 0.06, dogOwnerRescuer.position.z);
      dog.rotation.y = dogOwnerRescuer.rotation.y;

      if (d > 0.12) {
        dogOwnerRescuer.position.x += (dx / d) * 0.06;
        dogOwnerRescuer.position.z += (dz / d) * 0.06;
        dogOwnerRescuer.lookAt(inX, 0, inZ);
      } else {
        dog.position.set(inX, 0, inZ);
        dog.visible = true;
        scene.remove(dogOwnerRescuer);
        dogOwnerRescuer = null;
        dogRescueActive = false;
        dogRescueStage = 0;
        dogState.mode = 'idle';
        dogState.wait = 220;
      }
    }
  }

  // Animación de detalles del río
  if (riverDetailParts.length > 0) {
    const t = Date.now() * 0.001;
    riverDetailParts.forEach((part, i) => {
      if (!part || !part.userData) return;
      if (part.userData.kind === 'sea') {
        if (part.material && part.material.uniforms && part.material.uniforms.uTime) {
          part.material.uniforms.uTime.value = t;
        }
      }
      if (part.userData.kind === 'riverFoam') {
        part.position.x += part.userData.speed;
        part.position.y = 0.19 + Math.sin(t * 2.4 + part.userData.phase) * 0.025;
        part.material.opacity = 0.45 + Math.sin(t * 3.2 + i) * 0.2;
        if (part.position.x > (WORLD_HALF - 0.2)) part.position.x = -(WORLD_HALF - 0.2);
      }
    });
  }

  if (seaAtmosphereParts.length > 0) {
    const t = Date.now() * 0.001;
    seaAtmosphereParts.forEach((part, i) => {
      if (!part || !part.userData) return;
      if (part.userData.kind === 'shoreFoamBand') {
        part.position.z += Math.sin(t * 1.35 + part.userData.phase) * 0.0025;
        part.position.y = 0.155 + i * 0.012 + Math.sin(t * 2.2 + part.userData.phase) * 0.004;
        if (part.material && part.material.uniforms && part.material.uniforms.uOpacity) {
          const stormBoost = 1 + WATER_STORM.value * 0.45;
          part.material.uniforms.uOpacity.value = (0.3 - i * 0.05) * stormBoost + Math.sin(t * 1.4 + i) * 0.03;
        }
      } else if (part.userData.kind === 'seaMist') {
        const attr = part.geometry.getAttribute('position');
        const drift = part.userData.drift;
        if (!attr || !drift) return;
        for (let p = 0; p < attr.count; p++) {
          attr.array[p * 3] += Math.sin(t * 0.7 + p * 0.3) * drift[p];
          attr.array[p * 3 + 2] += (0.0012 + WATER_STORM.value * 0.0024);
          attr.array[p * 3 + 1] += Math.sin(t * 0.9 + p) * 0.0009;
          if (attr.array[p * 3 + 2] > -1.5) {
            attr.array[p * 3 + 2] = -9.4 - Math.random() * 2.8;
            attr.array[p * 3] = (Math.random() - 0.5) * (WORLD_SIZE - 2);
            attr.array[p * 3 + 1] = 0.2 + Math.random() * 1.35;
          }
        }
        attr.needsUpdate = true;
        part.material.opacity = 0.11 + WATER_STORM.value * 0.1 + Math.sin(t * 0.7) * 0.015;
      }
    });
  }

  // Peces del estanque: nadan, saltan, proyectan sombra y salpican gotas
  if (pondFish.length > 0) {
    const t = Date.now() * 0.001;
    pondFish.forEach((fish, i) => {
      const data = fish.userData;
      if (!data) return;

      if (!data.jumping) {
        data.angle += data.swimSpeed;
        fish.position.x = data.centerX + Math.cos(data.angle) * data.radius;
        fish.position.z = data.centerZ + Math.sin(data.angle) * data.radius;
        fish.position.y = pondSurfaceY - 0.08 + Math.sin(t * 4 + data.wigglePhase) * 0.012;
        fish.rotation.y = -data.angle + Math.PI / 2;
        fish.rotation.z = Math.sin(t * 8 + i) * 0.08;

        if (Math.random() < 0.0028) {
          data.jumping = true;
          data.jumpT = 0;
          data.splashOut = false;
          data.splashIn = false;
        }
      } else {
        data.jumpT += 0.052;
        const jumpArc = Math.sin(Math.PI * Math.min(data.jumpT, 1));
        fish.position.y = pondSurfaceY - 0.02 + jumpArc * data.jumpHeight;
        fish.rotation.z = jumpArc * 0.95;

        if (!data.splashOut && data.jumpT > 0.06) {
          spawnPondSplash(fish.position.x, fish.position.z, 0.85);
          data.splashOut = true;
        }
        if (!data.splashIn && data.jumpT > 0.9) {
          spawnPondSplash(fish.position.x, fish.position.z, 1.1);
          data.splashIn = true;
        }
        if (data.jumpT >= 1) {
          data.jumping = false;
          data.jumpT = 0;
          fish.position.y = pondSurfaceY - 0.08;
          fish.rotation.z = 0;
        }
      }

      if (data.shadow) {
        const h = Math.max(0, fish.position.y - pondSurfaceY);
        const s = Math.max(0.1, 1 - h * 0.75);
        data.shadow.position.set(fish.position.x, pondSurfaceY + 0.003, fish.position.z);
        data.shadow.scale.set(s, s, 1);
        data.shadow.material.opacity = Math.max(0.07, 0.24 - h * 0.16);
      }
    });
  }

  // Gotas de salpicadura del estanque
  if (pondDroplets.length > 0) {
    for (let i = pondDroplets.length - 1; i >= 0; i--) {
      const d = pondDroplets[i];
      if (!d || !d.userData) continue;
      d.userData.vy -= 0.0065;
      d.position.x += d.userData.vx;
      d.position.y += d.userData.vy;
      d.position.z += d.userData.vz;
      d.userData.life -= 0.03;
      d.material.opacity = Math.max(0, d.userData.life * 0.86);

      if (d.userData.life <= 0 || d.position.y <= pondSurfaceY - 0.02) {
        scene.remove(d);
        pondDroplets.splice(i, 1);
      }
    }
  }
  renderer.render(scene, camera);
}

window.onload = init;
