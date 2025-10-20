console.clear();

/* SETUP */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer({
  alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* CONTROLS */
const controlsWebGL = new THREE.OrbitControls(camera, renderer.domElement);

/* PARTICLES HEART & TEXT TIMELINE */
// Timeline này sẽ điều khiển cả trái tim và dòng chữ
const tl = gsap.timeline({
  repeat: -1,
  yoyo: true // Yoyo effect sẽ làm animation chạy ngược lại, khiến chữ mờ đi
});

const path = document.querySelector("path");
const length = path.getTotalLength();
const vertices = [];
for (let i = 0; i < length; i += 0.2) {
  const point = path.getPointAtLength(i);
  const vector = new THREE.Vector3(point.x, -point.y, 0);
  vector.x += (Math.random() - 0.5) * 30;
  vector.y += (Math.random() - 0.5) * 30;
  vector.z += (Math.random() - 0.5) * 70;
  vertices.push(vector);
  tl.from(vector, {
      x: 600 / 2,
      y: -552 / 2,
      z: 0,
      ease: "power2.inOut",
      duration: "random(2, 5)"
    },
    i * 0.002
  );
}
const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
const material = new THREE.PointsMaterial({
  color: 0xee5282,
  blending: THREE.AdditiveBlending,
  size: 3
});
const particles = new THREE.Points(geometry, material);
particles.position.x -= 600 / 2;
particles.position.y += 552 / 2;
scene.add(particles);

// QUAN TRỌNG: Thêm hiệu ứng cho chữ vào cùng timeline với trái tim
// Chữ sẽ hiện lên trong 4 giây, bắt đầu từ đầu timeline
tl.to("#greeting-text", { opacity: 1, duration: 15 }, 0);


gsap.fromTo(scene.rotation, {
  y: -0.2
}, {
  y: 0.2,
  repeat: -1,
  yoyo: true,
  ease: 'power2.inOut',
  duration: 5
});


/* FLOWERS */
function createRose() {
    const rose = new THREE.Group();
    const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });

    const stemGeometry = new THREE.CylinderGeometry(4, 4, 150, 8);
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -75;
    rose.add(stem);

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(10, 10, 0, 20);
    leafShape.quadraticCurveTo(-10, 10, 0, 0);

    const extrudeSettings = { depth: 1, bevelEnabled: false };
    const leafGeometry = new THREE.ExtrudeGeometry(leafShape, extrudeSettings);

    for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(leafGeometry, stemMaterial);
        const side = i % 2 === 0 ? 1 : -1;
        leaf.position.set(side * 5, -50 + Math.random() * 40, 0);
        leaf.rotation.z = side * (Math.PI / 3 + (Math.random() - 0.5) * 0.2);
        leaf.rotation.y = Math.PI / 2;
        rose.add(leaf);
    }

    const petalsGroup = new THREE.Group();
    petalsGroup.position.y = 10;
    rose.add(petalsGroup);

    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(15, 25, -15, 25, 0, 0);

    const petalColors = [0xff69b4, 0xff1493, 0xdc143c, 0xff0000, 0xf08080, 0xffb6c1];
    const petalMaterial = new THREE.MeshBasicMaterial({
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        side: THREE.DoubleSide
    });

    const petalCount = 30;
    for (let i = 0; i < petalCount; i++) {
        const petalGeometry = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);

        const layer = Math.floor(i / 10);
        const angle = (i % 10) / 10 * Math.PI * 2;
        const radius = 5 + layer * 10;

        petal.position.set(Math.cos(angle) * radius, -layer * 5, Math.sin(angle) * radius);
        petal.rotation.y = -angle;
        petal.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.2;
        petal.rotation.z = (Math.random() - 0.5) * 0.5;

        petalsGroup.add(petal);
    }
    
    return rose;
}

const flowers = [];
const heartSafeZoneWidth = 450;
const numFlowers = 35;

for (let i = 0; i < numFlowers; i++) {
    const flower = createRose();
    
    let x;
    const side = Math.random() > 0.5 ? 1 : -1;
    x = side * (heartSafeZoneWidth / 2 + Math.random() * (window.innerWidth / 3));
    
    const y = -window.innerHeight / 2 - 150;
    const z = (Math.random() - 0.5) * 400;

    flower.position.set(x, y, z);
    flower.rotation.z = (Math.random() - 0.5) * 0.4;
    flower.scale.set(0.8, 0.8, 0.8);
    
    scene.add(flower);
    flowers.push(flower);
    
    const petalsGroup = flower.children.find(child => child.children.length > 4);
    
    const flowerTl = gsap.timeline({
        delay: Math.random() * 7,
        repeat: -1,
        repeatDelay: 8 + Math.random() * 5
    });
    
    flowerTl.fromTo(flower.position, 
        { y: -window.innerHeight / 2 - 150 },
        { y: -window.innerHeight / 2 + Math.random() * 200, duration: 3, ease: "power2.out" }
    );
    
    if (petalsGroup) {
        flowerTl.from(petalsGroup.scale, { 
            x: 0.1, y: 0.1, z: 0.1, 
            duration: 2, 
            ease: "elastic.out(1, 0.7)" 
        }, "-=1.5");
    }
}

/* RENDERING */
function render() {
  requestAnimationFrame(render);
  geometry.setFromPoints(vertices);
  renderer.render(scene, camera);
}

/* EVENTS */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

requestAnimationFrame(render);