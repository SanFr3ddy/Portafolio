// Simulación interactiva del Sistema Solar con Three.js
// Desarrollado para portafolio

let scene, camera, renderer, controls, clock;
let sun, planets = [], orbitGroups = [], planetData = [];
let paused = false;

// Fallback para texturas
function safeTexture(url, fallbackColor = 0x888888) {
    const loader = new THREE.TextureLoader();
    try {
        return loader.load(url);
    } catch {
        // Si falla, usar color
        return null;
    }
}

// Datos de los planetas: nombre, radio, distancia al sol, velocidad rotación, velocidad órbita, textura
planetData = [
    { name: 'Mercurio', radius: 0.38, distance: 6, rotation: 0.02, orbit: 0.04, texture: 'https://threejs.org/examples/textures/planets/mercury.jpg' },
    { name: 'Venus', radius: 0.95, distance: 8, rotation: 0.017, orbit: 0.015, texture: 'https://threejs.org/examples/textures/planets/venus.jpg' },
    { name: 'Tierra', radius: 1, distance: 10, rotation: 0.02, orbit: 0.01, texture: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg' },
    { name: 'Marte', radius: 0.53, distance: 12, rotation: 0.018, orbit: 0.008, texture: 'https://threejs.org/examples/textures/planets/mars_1k_color.jpg' },
    { name: 'Júpiter', radius: 2, distance: 16, rotation: 0.04, orbit: 0.004, texture: 'https://threejs.org/examples/textures/planets/jupiter.jpg' },
    { name: 'Saturno', radius: 1.7, distance: 20, rotation: 0.038, orbit: 0.003, texture: 'https://threejs.org/examples/textures/planets/saturn.jpg' },
    { name: 'Urano', radius: 1.2, distance: 24, rotation: 0.03, orbit: 0.002, texture: 'https://threejs.org/examples/textures/planets/uranus.jpg' },
    { name: 'Neptuno', radius: 1.1, distance: 28, rotation: 0.032, orbit: 0.001, texture: 'https://threejs.org/examples/textures/planets/neptune.jpg' }
];

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 50);


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = 0;
    renderer.domElement.style.left = 0;
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    document.body.appendChild(renderer.domElement);


    // Fondo estelar (textura que sí funciona)
    // Puedes cambiar la URL por otra si tienes una mejor
    const loader = new THREE.TextureLoader();
    loader.load('https://raw.githubusercontent.com/MarcosPividori/threejs-planets-textures/main/2k_stars_milky_way.jpg', function(texture) {
        scene.background = texture;
    }, undefined, function() {
        scene.background = new THREE.Color(0x000000);
    });


    // Sol
    let sunTexture = null;
    try {
        sunTexture = loader.load('https://threejs.org/examples/textures/planets/sun.jpg');
    } catch {
        sunTexture = null;
    }
    const sunMaterial = new THREE.MeshStandardMaterial({ 
        map: sunTexture || null, 
        color: sunTexture ? 0xffffff : 0xffff00, 
        emissive: 0xffff00, 
        emissiveIntensity: 1 
    });
    sun = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), sunMaterial);
    scene.add(sun);

    // Luz en el Sol
    const light = new THREE.PointLight(0xffffff, 2, 200);
    light.position.set(0, 0, 0);
    scene.add(light);

    // Planetas y órbitas

    planetData.forEach((data, i) => {
        // Grupo para la órbita
        const orbitGroup = new THREE.Group();
        scene.add(orbitGroup);
        orbitGroups.push(orbitGroup);

        // Planeta
        let texture = null;
        try {
            texture = loader.load(data.texture);
        } catch {
            texture = null;
        }
        const material = new THREE.MeshStandardMaterial({ 
            map: texture || null, 
            color: texture ? 0xffffff : 0x888888 
        });
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = data.distance;
        orbitGroup.add(planet);
        planets.push(planet);

        // Órbita visual
        const orbitCurve = new THREE.EllipseCurve(0, 0, data.distance, data.distance);
        const points = orbitCurve.getPoints(100);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
        const orbitLine = new THREE.Line(orbitGeometry, new THREE.LineBasicMaterial({ color: 0x888888 }));
        scene.add(orbitLine);
    });


    // Controles de cámara (asegurar que OrbitControls esté disponible)
    if (typeof THREE.OrbitControls === 'function') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
    } else if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
    } else if (typeof window.OrbitControls !== 'undefined') {
        controls = new window.OrbitControls(camera, renderer.domElement);
    } else {
        console.warn('OrbitControls no está disponible.');
    }
    if (controls) {
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
    }

    // Reloj
    clock = new THREE.Clock();

    // Pausa
    document.getElementById('pauseBtn').onclick = () => {
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? 'Reanudar' : 'Pausar';
    };

    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);
    if (!paused) {
        const delta = clock.getDelta();
        // Rotación y traslación de planetas
        planetData.forEach((data, i) => {
            // Rotación sobre eje
            planets[i].rotation.y += data.rotation * delta * 10;
            // Traslación orbital
            orbitGroups[i].rotation.y += data.orbit * delta * 2;
        });
        // Rotación del Sol
        sun.rotation.y += 0.01 * clock.getDelta();
    }
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
