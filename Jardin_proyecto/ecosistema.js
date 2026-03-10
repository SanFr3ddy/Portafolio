// Simulador de Ecosistema Base - Three.js
// Entrega 2: Primera persona, controles WASD y ratón

// Escena, cámara y renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe2d3); // Fondo natural

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.fov = 75;
camera.updateProjectionMatrix();
camera.position.set(0, 1.2, 8); // Altura de persona

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz ambiental y direccional
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 30, 10);
scene.add(dirLight);

// Terreno (plano verde)
const terrenoGeo = new THREE.PlaneGeometry(20, 20, 16, 16);
const terrenoMat = new THREE.MeshLambertMaterial({ color: 0x7cb342 });
const terreno = new THREE.Mesh(terrenoGeo, terrenoMat);
terreno.rotation.x = -Math.PI / 2;
scene.add(terreno);

// Agua (plano azul)
const aguaGeo = new THREE.CircleGeometry(3, 32);
const aguaMat = new THREE.MeshPhongMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.8 });
const agua = new THREE.Mesh(aguaGeo, aguaMat);
agua.position.set(-4, 0.1, 4);
agua.rotation.x = -Math.PI / 2;
scene.add(agua);

// Vegetación: árboles simples
function crearArbol(x, z) {
    // Tronco
    const troncoGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8);
    const troncoMat = new THREE.MeshLambertMaterial({ color: 0x8d5524 });
    const tronco = new THREE.Mesh(troncoGeo, troncoMat);
    tronco.position.set(x, 0.6, z);
    scene.add(tronco);
    // Copa
    const copaGeo = new THREE.SphereGeometry(0.6, 12, 12);
    const copaMat = new THREE.MeshLambertMaterial({ color: 0x388e3c });
    const copa = new THREE.Mesh(copaGeo, copaMat);
    copa.position.set(x, 1.2, z);
    scene.add(copa);
}

// Añadir varios árboles
for (let i = 0; i < 4; i++) {
    const x = Math.random() * 14 - 7;
    const z = Math.random() * 14 - 7;
    if (Math.sqrt((x+4)*(x+4)+(z-4)*(z-4)) < 3) continue; // No poner árboles en el estanque
    crearArbol(x, z);
}

// Rocas
function crearRoca(x, z, escala = 0.4) {
    const rocaGeo = new THREE.DodecahedronGeometry(escala);
    const rocaMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const roca = new THREE.Mesh(rocaGeo, rocaMat);
    roca.position.set(x, escala, z);
    roca.rotation.y = Math.random() * Math.PI;
    scene.add(roca);
}
crearRoca(2, -6, 0.5);
crearRoca(-6, 6, 0.3);
crearRoca(6, 5, 0.4);

// Pasto (pequeños cilindros verdes)
for (let i = 0; i < 25; i++) {
    const x = Math.random() * 18 - 9;
    const z = Math.random() * 18 - 9;
    if (Math.sqrt((x+4)*(x+4)+(z-4)*(z-4)) < 3) continue; // No poner pasto en el estanque
    const pastoGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 6);
    const pastoMat = new THREE.MeshLambertMaterial({ color: 0x43a047 });
    const pasto = new THREE.Mesh(pastoGeo, pastoMat);
    pasto.position.set(x, 0.15, z);
    scene.add(pasto);
}

// Bordes de invernadero (rectángulos)
const bordeMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
const borde1 = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 0.2), bordeMat);
borde1.position.set(0, 0.11, -10);
scene.add(borde1);
const borde2 = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 0.2), bordeMat);
borde2.position.set(0, 0.11, 10);
scene.add(borde2);
const borde3 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 20), bordeMat);
borde3.position.set(-10, 0.11, 0);
scene.add(borde3);
const borde4 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 20), bordeMat);
borde4.position.set(10, 0.11, 0);
scene.add(borde4);

// Macetas (cilindros pequeños)
for (let i = 0; i < 4; i++) {
    const x = Math.cos(i * Math.PI / 2) * 7;
    const z = Math.sin(i * Math.PI / 2) * 7;
    const macetaGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 12);
    const macetaMat = new THREE.MeshLambertMaterial({ color: 0xffa726 });
    const maceta = new THREE.Mesh(macetaGeo, macetaMat);
    maceta.position.set(x, 0.2, z);
    scene.add(maceta);
}

// Personaje sencillo (muñeco)

// Controles de primera persona
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();
let pointerLocked = false;

// Pointer lock para ratón
const instructions = document.createElement('div');
instructions.style.position = 'absolute';
instructions.style.top = '50%';
instructions.style.left = '50%';
instructions.style.transform = 'translate(-50%, -50%)';
instructions.style.background = 'rgba(255,255,255,0.9)';
instructions.style.padding = '20px';
instructions.style.borderRadius = '8px';
instructions.style.fontFamily = 'Arial';
instructions.style.zIndex = '2';
instructions.innerHTML = '<b>Haz clic para controlar en primera persona</b><br>WASD para moverte, ratón para mirar';
document.body.appendChild(instructions);

renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});
document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === renderer.domElement;
    instructions.style.display = pointerLocked ? 'none' : 'block';
});

let yaw = 0, pitch = 0;
document.addEventListener('mousemove', (event) => {
    if (!pointerLocked) return;
    yaw -= event.movementX * 0.002;
    pitch -= event.movementY * 0.002;
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
});

const onKeyDown = function (event) {
    switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward = true; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
        case 'ArrowDown': case 'KeyS': moveBackward = true; break;
        case 'ArrowRight': case 'KeyD': moveRight = true; break;
    }
};
const onKeyUp = function (event) {
    switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward = false; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
        case 'ArrowDown': case 'KeyS': moveBackward = false; break;
        case 'ArrowRight': case 'KeyD': moveRight = false; break;
    }
};
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    velocity.x = velocity.z = 0;
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    if (moveForward || moveBackward) velocity.z -= direction.z * 5.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 5.0 * delta;
    // Movimiento
    camera.position.x += velocity.x * Math.cos(yaw) - velocity.z * Math.sin(yaw);
    camera.position.z += velocity.x * Math.sin(yaw) + velocity.z * Math.cos(yaw);
    // Altura fija
    camera.position.y = 1.2;
    // Rotación
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    renderer.render(scene, camera);
    prevTime = time;
}
animate();

// Control de tamaño de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animación
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
