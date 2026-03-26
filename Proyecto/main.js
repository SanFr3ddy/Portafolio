// Escena básica Three.js para ecosistema
let scene, camera, renderer;
let currentWeather = 'sunny';
let ground, groundTexture, groundMaterial;
let river = null, riverMaterial = null;
let riverDetailParts = [];
let pond = null;
let pondSurfaceY = 0.2;
let pondFish = [];
let pondDroplets = [];
let dogParts = [];
let trees = [], crowns = [], branches = [], bridgeParts = [], houseParts = [], leafClusters = [];
let winterDetails = [];
let bushes = [], rocks = [];
let roofSurfaces = [], roofSnowParts = [];
let fireEffects = [];
let burningTrees = [];
let runner = null;
let runnerFire = null;
let runnerActive = false;
let runnerProgress = 0;
let runnerPath = [];
let weatherEffects = [];
let truckParts = [];
let rainIntensity = 'normal';
let lightningEnabled = false;
let lightningLight = null;
let lightningFlashFrames = 0;
let sunnyMode = 'normal';
let sunnyWindDirection = { x: 1, z: 0 };
let winterMode = 'normal';
let fireMode = 'volcano';
let worldMode = 'normal';
let windStrength = 0;
let windyObjects = [];
let houseRoofMain = null;
let houseRoofHome = null;
let roofBlown = false;
let roofFlight = 0;
let roofGone = false;
let seatedPerson = null;
let tsunamiWave = null;
let tsunamiActive = false;
let tsunamiFoam = [];
let tsunamiBodies = [];
let floodWater = null;
let avalancheParts = [];
let volcanoGroup = null;
let lavaBlobs = [];
let modelsCache = {};
let modelsReady = false;
let textureReady = false;
let ecosystemStarted = false;
let refreshedWithLoadedModels = false;

const MODEL_BASE_PATH = './assets/models/Models/GLTF format/';
const TREE_MODEL_FILES = [];
const ROCK_MODEL_FILES = ['rock_largeA.glb', 'rock_smallC.glb', 'rock_tallB.glb'];
const BUSH_MODEL_FILES = ['plant_bushDetailed.glb', 'plant_bushLarge.glb', 'plant_bushSmall.glb'];

const HOUSE_POS = { x: 2, z: 4 };
const RIVER_CENTER_Z = -6;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, 1280/800, 0.1, 1000);
  camera.position.set(0, 8, 18);
  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene-canvas'), antialias: true });
  renderer.setClearColor(0x222222);
  renderer.setSize(1280, 800);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
  preloadNatureModels(() => {
    modelsReady = true;
    tryBuildEcosystem();
  });

  loader.load('../Materiales/seamless_pbr_green_grass_ground_texture_with_small_white_flowers_and_leaves_4k_tile.png', function(texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    groundTexture = texture;
    groundMaterial = new THREE.MeshStandardMaterial({ map: texture, color: 0x888866 });
    ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), groundMaterial);
    ground.rotation.x = -Math.PI/2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    textureReady = true;
    tryBuildEcosystem();
  }, undefined, function() {
    // Si falla la textura, usar color
    groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), groundMaterial);
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


// Agrega río, árboles y vegetación
function addEcosystem() {
  // Limpiar objetos previos si se recarga la escena
  [...bridgeParts, ...houseParts, ...truckParts, ...branches, ...leafClusters, ...winterDetails, ...trees, ...crowns, ...bushes, ...rocks, ...roofSnowParts, ...avalancheParts, ...tsunamiFoam, ...lavaBlobs, ...riverDetailParts, ...pondFish, ...pondDroplets, ...dogParts]
    .filter(Boolean)
    .forEach(obj => scene.remove(obj));
  if (tsunamiWave) scene.remove(tsunamiWave);
  if (floodWater) scene.remove(floodWater);
  if (volcanoGroup) scene.remove(volcanoGroup);
  if (pond) scene.remove(pond);
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
  leafClusters = [];
  winterDetails = [];
  bushes = [];
  rocks = [];
  roofSurfaces = [];
  roofSnowParts = [];
  avalancheParts = [];
  riverDetailParts = [];
  pond = null;
  pondFish = [];
  pondDroplets = [];
  windyObjects = [];
  houseRoofMain = null;
  houseRoofHome = null;
  roofBlown = false;
  roofFlight = 0;
  roofGone = false;
  seatedPerson = null;
  tsunamiWave = null;
  tsunamiActive = false;
  tsunamiFoam = [];
  tsunamiBodies = [];
  floodWater = null;
  volcanoGroup = null;
  lavaBlobs = [];
  // Río
  const riverWidth = 3;
  const riverLength = 30;
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

  // Helper para evitar el río (no poner objetos en el rango del río)
    // Puente sobre el río
    addBridge();

    // Casa de madera lejos del río
    addHouse();

    // Perro blanco sentado junto al estanque
    addDogNearPond();

    // Camioneta detallada fija (misma zona)
    addRaptorTruck();
  function isOnRiver(x, z) {
    // El río está centrado en z=-6, ancho 3, largo 30
    return (z > -6 - riverWidth/2 - 0.7 && z < -6 + riverWidth/2 + 0.7);
  }

  function isNearHouse(x, z) {
    // zona de resguardo para que no haya vegetación dentro/encima de la casa
    return Math.abs(x - HOUSE_POS.x) < 3.3 && Math.abs(z - HOUSE_POS.z) < 3.1;
  }

  // Árboles
  let count = 0;
  while (count < 8) {
    const x = (Math.random() - 0.5) * 24;
    const z = (Math.random() - 0.5) * 24;
    if (!isOnRiver(x, z) && !isNearHouse(x, z)) {
      createTree(x, z);
      count++;
    }
  }

  // Arbustos
  count = 0;
  while (count < 10) {
    const x = (Math.random() - 0.5) * 28;
    const z = (Math.random() - 0.5) * 28;
    if (!isOnRiver(x, z) && !isNearHouse(x, z)) {
      createBush(x, z);
      count++;
    }
  }

  // Rocas
  count = 0;
  while (count < 7) {
    const x = (Math.random() - 0.5) * 28;
    const z = (Math.random() - 0.5) * 28;
    if (!isOnRiver(x, z) && !isNearHouse(x, z)) {
      createRock(x, z);
      count++;
    }
  }

  // Viento solo sobre árboles (cada árbol como objeto completo)
  windyObjects = [...trees];
  windyObjects.forEach((obj, i) => {
    if (!obj || !obj.position) return;
    obj.userData = obj.userData || {};
    obj.userData.baseX = obj.position.x;
    obj.userData.baseY = obj.position.y;
    obj.userData.baseZ = obj.position.z;
    obj.userData.windPhase = i * 0.37;
  });
}

function createTree(x, z) {
  const palettes = [
    { trunk: 0x7a4a22, bark: 0x5f3618, leaf: 0x2f8f2f, leaf2: 0x3ca23c },
    { trunk: 0x6a3f1c, bark: 0x4f2f14, leaf: 0x2d7a45, leaf2: 0x4a9b63 },
    { trunk: 0x80522a, bark: 0x664022, leaf: 0x4d8d2c, leaf2: 0x6cae3d }
  ];
  const palette = palettes[Math.floor(Math.random() * palettes.length)];
  const treeType = Math.floor(Math.random() * 3); // 0: roble, 1: pino, 2: ancho

  const trunkHeight = treeType === 1 ? 3.4 + Math.random() * 1.2 : 2.2 + Math.random() * 1.1;
  const trunkRadiusTop = treeType === 2 ? 0.22 : 0.15 + Math.random() * 0.05;
  const trunkRadiusBottom = trunkRadiusTop + (treeType === 2 ? 0.13 : 0.09);

  const treeRoot = new THREE.Group();
  treeRoot.position.set(x, 0, z);
  scene.add(treeRoot);
  trees.push(treeRoot);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, trunkHeight, 14),
    new THREE.MeshStandardMaterial({ color: palette.trunk, roughness: 0.96 })
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
        new THREE.MeshLambertMaterial({ color: l % 2 === 0 ? palette.leaf : palette.leaf2 })
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
          new THREE.MeshLambertMaterial({ color: Math.random() > 0.5 ? palette.leaf : palette.leaf2 })
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
  const branchCount = treeType === 1 ? 10 : 8;
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
  }
  branchGroup.visible = false;
  treeRoot.add(branchGroup);
  branches.push(branchGroup);

  // Detalles extra de invierno para tronco y ramas
  const winterGroup = new THREE.Group();
  for (let i = 0; i < 10; i++) {
    const frostBand = new THREE.Mesh(
      new THREE.CylinderGeometry(trunkRadiusTop + 0.015, trunkRadiusTop + 0.015, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0xe7edf5, roughness: 0.75, metalness: 0.05 })
    );
    frostBand.position.set(0, trunkHeight * (0.2 + i * 0.07), 0);
    winterGroup.add(frostBand);
  }
  for (let i = 0; i < 18; i++) {
    const snowDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.03 + Math.random() * 0.03, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.8 })
    );
    snowDot.position.set(
      (Math.random() - 0.5) * 0.9,
      trunkHeight * 0.75 + Math.random() * 1.1,
      (Math.random() - 0.5) * 0.9
    );
    winterGroup.add(snowDot);
  }
  winterGroup.visible = false;
  treeRoot.add(winterGroup);
  winterDetails.push(winterGroup);
}

// Cambia el clima y actualiza el ecosistema
window.setWeather = function(weather) {
  currentWeather = weather;
  updateWeatherOptionVisibility();
  tsunamiActive = false;
  if (tsunamiWave) {
    scene.remove(tsunamiWave);
    tsunamiWave = null;
  }
  avalancheParts.forEach(p => scene.remove(p));
  avalancheParts = [];

  // Limpiar efectos climáticos anteriores (lluvia/nieve/camioneta)
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
        scene.fog = new THREE.Fog(0xe8d58b, 30, 95);
        renderer.setClearColor(0xe7cf85);
        windStrength = 0.012;
        resetRoofIfNeeded();
      } else if (sunnyMode === 'wind') {
        scene.fog = new THREE.Fog(0xb0d3e0, 30, 85);
        renderer.setClearColor(0x99c9db);
        windStrength = 0.05;
      } else if (sunnyMode === 'windstrong') {
        scene.fog = new THREE.Fog(0xa6bcc7, 22, 70);
        renderer.setClearColor(0xa1b9c5);
        windStrength = 0.09;
      } else if (sunnyMode === 'tsunami') {
        scene.fog = new THREE.Fog(0x8db0bf, 24, 70);
        renderer.setClearColor(0x7da8ba);
        windStrength = 0.035;
        startTsunami();
      } else {
        scene.fog = null;
        renderer.setClearColor(0x87ceeb);
        windStrength = 0;
        resetRoofIfNeeded();
      }
    } else if (weather === 'rain') {
      groundMaterial.color.set(0x4a6a3c); // Pasto oscuro
      groundMaterial.map = groundTexture;
      scene.fog = new THREE.Fog(0x6b7a8f, 20, 60);
      renderer.setClearColor(0x6b7a8f); // gris azulado
      windStrength = rainIntensity === 'heavy' ? 0.03 : 0.015;
    } else if (weather === 'winter') {
      groundMaterial.color.set(0xe0e0e0); // Pasto nevado
      groundMaterial.map = null;
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
      groundMaterial.color.set(0x6b4a2a); // Pasto quemado
      groundMaterial.map = null;
      scene.fog = new THREE.Fog(0x3e2723, 10, 40);
      renderer.setClearColor(0x3e2723); // marrón oscuro
      windStrength = 0.01;

      bridgeParts.forEach((p) => {
        if (p && p.material && p.material.color) {
          p.material.color.set(0x7c7f84);
          p.material.roughness = 0.95;
        }
      });

      if (fireMode === 'volcano') {
        setRiverAsLava(true);
        addVolcano();
      }
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
    if (weather === 'sunny') {
      if (sunnyMode === 'extreme') {
        crown.visible = false;
        if (branches[i]) {
          branches[i].visible = true;
          setObjectColor(branches[i], 0x7a5a32);
        }
      } else {
        setObjectColor(crown, 0x228B22); // Verde
        crown.visible = true;
        if (branches[i]) branches[i].visible = false;
      }
      if (leafClusters[i]) leafClusters[i].visible = true;
      if (winterDetails[i]) winterDetails[i].visible = false;
    } else if (weather === 'rain') {
      setObjectColor(crown, 0x2e8b57); // Verde oscuro
      crown.visible = true;
      if (branches[i]) branches[i].visible = false;
      if (leafClusters[i]) leafClusters[i].visible = true;
      if (winterDetails[i]) winterDetails[i].visible = false;
    } else if (weather === 'winter') {
      crown.visible = false;
      if (branches[i]) branches[i].visible = true;
      if (leafClusters[i]) leafClusters[i].visible = false;
      if (winterDetails[i]) winterDetails[i].visible = true;
    } else if (weather === 'fire') {
      crown.visible = false;
      if (branches[i]) branches[i].visible = true;
      if (leafClusters[i]) leafClusters[i].visible = false;
      if (winterDetails[i]) winterDetails[i].visible = false;
    }
  });

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

  for (const side of [-1, 1]) {
    const bank = new THREE.Mesh(new THREE.BoxGeometry(30, 0.08, 0.68), bankMat);
    bank.position.set(0, 0.04, RIVER_CENTER_Z + side * 1.92);
    bank.receiveShadow = true;
    scene.add(bank);
    riverDetailParts.push(bank);

    const wetEdge = new THREE.Mesh(new THREE.BoxGeometry(30, 0.03, 0.26), wetBankMat);
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
      (Math.random() - 0.5) * 28,
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
      (Math.random() - 0.5) * 26,
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
    foam.position.set((Math.random() - 0.5) * 28, 0.19 + Math.random() * 0.05, RIVER_CENTER_Z + (Math.random() - 0.5) * 2.2);
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
    new THREE.MeshPhongMaterial({ color: 0x4eb4db, transparent: true, opacity: 0.8, shininess: 120 })
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
  const baseX = HOUSE_POS.x + 2.55;
  const baseZ = HOUSE_POS.z + 1.45;

  const furWhite = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.86 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.45 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.25, metalness: 0.05 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), furWhite);
  body.scale.set(1.2, 0.9, 0.9);
  body.position.set(0, 0.45, 0);
  body.castShadow = true;
  dog.add(body);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), furWhite);
  chest.position.set(0.24, 0.38, 0);
  chest.castShadow = true;
  dog.add(chest);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), furWhite);
  head.position.set(0.44, 0.62, 0);
  head.castShadow = true;
  dog.add(head);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), furWhite);
  snout.scale.set(1.15, 0.82, 0.86);
  snout.position.set(0.58, 0.56, 0);
  snout.castShadow = true;
  dog.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), noseMat);
  nose.position.set(0.67, 0.56, 0);
  dog.add(nose);

  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10), furWhite);
  earL.position.set(0.39, 0.81, 0.11);
  earL.rotation.z = 0.35;
  earL.castShadow = true;
  dog.add(earL);
  const earR = earL.clone();
  earR.position.z = -0.11;
  earR.rotation.z = -0.35;
  dog.add(earR);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), eyeMat);
  eyeL.position.set(0.55, 0.63, 0.07);
  dog.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.07;
  dog.add(eyeR);

  // sentado: patas delanteras rectas y traseras recogidas
  for (const z of [-0.12, 0.12]) {
    const frontLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.28, 10), furWhite);
    frontLeg.position.set(0.24, 0.17, z);
    frontLeg.castShadow = true;
    dog.add(frontLeg);

    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), furWhite);
    paw.position.set(0.24, 0.03, z);
    paw.castShadow = true;
    dog.add(paw);

    const backLeg = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), furWhite);
    backLeg.position.set(-0.12, 0.18, z);
    backLeg.castShadow = true;
    dog.add(backLeg);
  }

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 10), furWhite);
  tail.position.set(-0.44, 0.58, 0);
  tail.rotation.z = -0.9;
  tail.castShadow = true;
  dog.add(tail);

  dog.position.set(baseX, 0, baseZ);
  dog.rotation.y = -0.55;
  scene.add(dog);
  dogParts.push(dog);
}

// Agrega una pequeña casa de madera
function addHouse() {
  // Casa más hacia el centro (pero sin estorbar el río)
  const x = HOUSE_POS.x, z = HOUSE_POS.z;
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xa67c52, roughness: 0.9 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x6d4528, roughness: 0.92 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x6b3f1e, roughness: 0.88 });
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

  // Techo principal a dos aguas simplificado
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.25, 1.25, 4), roofMat);
  roof.position.set(x, 1.9, z);
  roof.rotation.y = Math.PI / 4;
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

  // Chimenea
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.35), new THREE.MeshStandardMaterial({ color: 0x7a7772, roughness: 0.95 }));
  chimney.position.set(x + 0.6, 2.2, z - 0.4);
  addHousePart(chimney);

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
    scene.add(bushModel);
    bushes.push(bushModel);
    return;
  }

  const bushGeometry = new THREE.SphereGeometry(0.4 + Math.random() * 0.2, 10, 10);
  const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.position.set(x, 0.4, z);
  scene.add(bush);
  bushes.push(bush);
}

function createRock(x, z) {
  const selectedRockFile = ROCK_MODEL_FILES[Math.floor(Math.random() * ROCK_MODEL_FILES.length)];
  const rockModel = cloneModel(selectedRockFile);
  if (rockModel) {
    rockModel.position.set(x, 0, z);
    const s = 0.7 + Math.random() * 0.5;
    rockModel.scale.set(s, s, s);
    rockModel.rotation.y = Math.random() * Math.PI * 2;
    scene.add(rockModel);
    rocks.push(rockModel);
    return;
  }

  const rockGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.2);
  const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);
  rock.position.set(x, 0.2, z);
  scene.add(rock);
  rocks.push(rock);
}
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

function addRainEffect() {
  const isHeavy = rainIntensity === 'heavy';
  const count = isHeavy ? 1800 : 900;
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = 4 + Math.random() * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
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
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = 4 + Math.random() * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
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

function addRaptorTruck() {
  const truck = new THREE.Group();
  truck.position.set(-6.5, 0, 2.3);
  truck.rotation.y = -0.5;

  const paintTex = createTruckPaintTexture();
  const bodyColor = new THREE.MeshStandardMaterial({ color: 0xffffff, map: paintTex, roughness: 0.32, metalness: 0.58 });
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9, metalness: 0.15 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x87a6bd, roughness: 0.2, metalness: 0.15 });

  const addTruckPart = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    truck.add(mesh);
  };

  // Chasis
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.65, 1.5),
    bodyColor
  );
  body.position.set(0, 0.72, 0);
  addTruckPart(body);

  // Cabina
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.92, 1.35), bodyColor);
  cab.position.set(0.95, 1.15, 0);
  addTruckPart(cab);
  roofSurfaces.push(cab);

  // Caja trasera
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.65, 1.42), matteBlack);
    // Bordes redondeados en esquinas de carrocería
    const roundMat = bodyColor;
    const roundedCorners = [
      [1.45, 0.95, -0.67], [1.45, 0.95, 0.67],
      [-1.45, 0.95, -0.67], [-1.45, 0.95, 0.67],
      [0.6, 1.45, -0.6], [0.6, 1.45, 0.6]
    ];
    roundedCorners.forEach((c) => {
      const corner = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), roundMat);
      corner.position.set(c[0], c[1], c[2]);
      addTruckPart(corner);
    });

  bed.position.set(-0.95, 0.95, 0);
  addTruckPart(bed);
  roofSurfaces.push(bed);

  // Cristales
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.04), glass);
  windshield.position.set(1.46, 1.3, 0);
  windshield.rotation.y = Math.PI / 2;
  addTruckPart(windshield);

  // Parrilla frontal
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 1.1), matteBlack);
  grille.position.set(1.62, 0.92, 0);
  addTruckPart(grille);

  // Defensa
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 1.35), matteBlack);
  bumper.position.set(1.72, 0.6, 0);
  addTruckPart(bumper);

  // Luces
  const headlightMat = new THREE.MeshStandardMaterial({ color: 0xf3f6ff, emissive: 0x444444, roughness: 0.15 });
  const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.25), headlightMat);
  h1.position.set(1.8, 0.9, -0.38);
  addTruckPart(h1);
  const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.25), headlightMat);
  h2.position.set(1.8, 0.9, 0.38);
  addTruckPart(h2);

  // Espejos laterales
  const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 });
  const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.12), mirrorMat);
  m1.position.set(1.3, 1.2, -0.78);
  addTruckPart(m1);
  const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.12), mirrorMat);
  m2.position.set(1.3, 1.2, 0.78);
  addTruckPart(m2);

  // Barra superior y manijas
  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 1.15), matteBlack);
  rack.position.set(0.9, 1.65, 0);
  addTruckPart(rack);
  const handleL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), matteBlack);
  handleL.position.set(0.95, 1.05, -0.76);
  addTruckPart(handleL);
  const handleR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), matteBlack);
  handleR.position.set(0.95, 1.05, 0.76);
  addTruckPart(handleR);

  // Llantas anchas tipo pickup
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const wheelGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.24, 20);
  const wheelPos = [
    [1.0, 0.32, -0.78],
    [1.0, 0.32, 0.78],
    [-1.1, 0.32, -0.78],
    [-1.1, 0.32, 0.78]
  ];
  wheelPos.forEach(w => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.position.set(w[0], w[1], w[2]);
    wheel.rotation.z = Math.PI / 2;
    addTruckPart(wheel);
  });

  // Salpicaderas
  for (const wx of [1.0, -1.1]) {
    for (const wz of [-0.78, 0.78]) {
      const fender = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.22), matteBlack);
      fender.position.set(wx, 0.58, wz);
      addTruckPart(fender);
    }
  }

  scene.add(truck);
  truckParts.push(truck);
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

window.setWorldMode = function(mode) {
  worldMode = mode === 'beach' ? 'beach' : 'normal';
  if (sunnyMode === 'tsunami' && worldMode === 'normal') {
    // se regenera limpio al volver a normal
    addEcosystem();
  }
  setWeather(currentWeather);
};

window.setSunnyMode = function(mode) {
  sunnyMode = ['normal', 'extreme', 'wind', 'windstrong', 'tsunami'].includes(mode) ? mode : 'normal';
  if (currentWeather === 'sunny') setWeather('sunny');
};

window.setTsunamiMode = function() {
  worldMode = 'beach';
  sunnyMode = 'tsunami';
  currentWeather = 'sunny';
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
  fireMode = mode === 'volcano' ? 'volcano' : 'volcano';
  if (currentWeather === 'fire') setWeather('fire');
};

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
    tsunamiWave = new THREE.Mesh(
      new THREE.BoxGeometry(28, 5, 2.5),
      new THREE.MeshPhongMaterial({ color: 0x4fa9ce, transparent: true, opacity: 0.72 })
    );
    tsunamiWave.position.set(0, 2.3, -17);
    scene.add(tsunamiWave);

    // espuma frontal
    for (let i = 0; i < 42; i++) {
      const foam = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 + Math.random() * 0.14, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xeef6ff, transparent: true, opacity: 0.72 })
      );
      foam.position.set((Math.random() - 0.5) * 24, 2.4 + Math.random() * 1.3, -16.2 + (Math.random() - 0.5) * 1.3);
      foam.userData = { phase: Math.random() * Math.PI * 2 };
      scene.add(foam);
      tsunamiFoam.push(foam);
    }

    const movers = [...trees, ...bushes, ...rocks, ...bridgeParts, ...houseParts, ...truckParts];
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
    });
    tsunamiBodies = movers;
  }
}

function createFloodWaterIfNeeded() {
  if (floodWater) return;
  floodWater = new THREE.Mesh(
    new THREE.BoxGeometry(35, 2.2, 35),
    new THREE.MeshPhongMaterial({ color: 0x5aa9cf, transparent: true, opacity: 0.52 })
  );
  floodWater.position.set(0, 1.15, 0);
  scene.add(floodWater);
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
  if (roofGone) {
    houseRoofMain.visible = true;
    roofGone = false;
  }
  roofFlight = 0;
  roofBlown = false;
  houseRoofMain.position.set(houseRoofHome.x, houseRoofHome.y, houseRoofHome.z);
  houseRoofMain.rotation.set(houseRoofHome.rx, houseRoofHome.ry, houseRoofHome.rz);
}

function startAvalanche() {
  avalancheParts.forEach(p => scene.remove(p));
  avalancheParts = [];
  for (let i = 0; i < 16; i++) {
    const snowChunk = new THREE.Mesh(
      new THREE.SphereGeometry(0.35 + Math.random() * 0.3, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf6f9fc, roughness: 0.8 })
    );
    snowChunk.position.set(-13 + Math.random() * 2, 1 + Math.random() * 2, -10 + Math.random() * 20);
    snowChunk.userData = { vx: 0.08 + Math.random() * 0.06, vz: (Math.random() - 0.5) * 0.04 };
    scene.add(snowChunk);
    avalancheParts.push(snowChunk);
  }
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
}

function animate() {
  requestAnimationFrame(animate);

  // Mucho viento (meciendo copas y ramas)
  if (windStrength > 0) {
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
      const wobble = Math.sin(t + phase);
      obj.rotation.z = sunnyWindDirection.x * wobble * ampRot;
      obj.rotation.x = -sunnyWindDirection.z * Math.cos(t * 0.9 + phase) * ampRot * 0.85;
    });
  } else {
    windyObjects.forEach((obj) => {
      if (!obj) return;
      obj.rotation.x *= 0.9;
      obj.rotation.z *= 0.9;
    });
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
        attr.array[i * 3 + 1] -= speed[i];
        if (effect.userData.type === 'snow') {
          attr.array[i * 3] += Math.sin((Date.now() * 0.001) + i) * 0.003;
          attr.array[i * 3 + 2] += Math.cos((Date.now() * 0.0012) + i) * 0.002;
        }
        if (attr.array[i * 3 + 1] < 0.1) {
          attr.array[i * 3 + 1] = 10 + Math.random() * 6;
          attr.array[i * 3] = (Math.random() - 0.5) * 30;
          attr.array[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
      }
      attr.needsUpdate = true;
    });
  }

  // Tsunami arrastra elementos
  if (tsunamiActive && tsunamiWave) {
    tsunamiWave.position.z += 0.16;
    tsunamiFoam.forEach((f, idx) => {
      f.position.z += 0.2;
      f.position.x += Math.sin(Date.now() * 0.004 + idx) * 0.01;
      f.material.opacity = 0.45 + 0.25 * Math.sin(Date.now() * 0.006 + f.userData.phase);
    });

    tsunamiBodies.forEach((obj, idx) => {
      if (!obj) return;
      if (obj.position && tsunamiWave.position.z > obj.position.z - 1.0) {
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
        obj.rotation.x += spin.x;
        obj.rotation.z += spin.z;
      }
    });

    if (tsunamiWave.position.z > 22) {
      tsunamiActive = false;
      createFloodWaterIfNeeded();
    }
  }

  if (floodWater) {
    floodWater.material.opacity = 0.48 + Math.sin(Date.now() * 0.0014) * 0.04;
  }

  // Avalancha
  if (avalancheParts.length > 0 && currentWeather === 'winter' && winterMode === 'avalanche') {
    avalancheParts.forEach((chunk) => {
      chunk.position.x += chunk.userData.vx;
      chunk.position.z += chunk.userData.vz;
      chunk.rotation.x += 0.04;
      chunk.rotation.z += 0.03;
      if (chunk.position.x > 16) {
        chunk.position.x = -13;
        chunk.position.y = 1 + Math.random() * 2;
      }
    });
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
      lightningLight.position.set((Math.random() - 0.5) * 20, 10 + Math.random() * 7, -6 + (Math.random() - 0.5) * 12);
      lightningLight.intensity = rainIntensity === 'heavy' ? 5.5 : 4.0;
    } else if (lightningFlashFrames > 0) {
      lightningFlashFrames--;
      if (lightningFlashFrames <= 0) lightningLight.intensity = 0;
    }
  } else if (lightningLight) {
    lightningFlashFrames = 0;
    lightningLight.intensity = 0;
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

  // Animación de detalles del río
  if (riverDetailParts.length > 0) {
    const t = Date.now() * 0.001;
    riverDetailParts.forEach((part, i) => {
      if (!part || !part.userData) return;
      if (part.userData.kind === 'riverFoam') {
        part.position.x += part.userData.speed;
        part.position.y = 0.19 + Math.sin(t * 2.4 + part.userData.phase) * 0.025;
        part.material.opacity = 0.45 + Math.sin(t * 3.2 + i) * 0.2;
        if (part.position.x > 14.8) part.position.x = -14.8;
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
