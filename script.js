console.clear();

/* =================== SETUP =================== */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* =================== CONTROLS =================== */
const controlsWebGL = new THREE.OrbitControls(camera, renderer.domElement);

/* =================== PARTICLES HÌNH TRÁI TIM =================== */
// Tạo một timeline chung cho GSAP
const tl = gsap.timeline({
  repeat: -1,
  yoyo: true
});

const path = document.querySelector("path");
const length = path.getTotalLength();
const vertices = [];
for (let i = 0; i < length; i += 0.5) { // Tăng mật độ hạt cho mịn hơn
  const point = path.getPointAtLength(i);
  const vector = new THREE.Vector3(point.x, -point.y, 0);
  vector.x += (Math.random() - 0.5) * 30;
  vector.y += (Math.random() - 0.5) * 30;
  vector.z += (Math.random() - 0.5) * 70;
  vertices.push(vector);
  // Tạo tween cho mỗi vector
  tl.from(vector, {
      x: 600 / 2,
      y: -552 / 2,
      z: 0,
      ease: "power2.inOut",
      duration: "random(2, 5)"
    },
    i * 0.001 // Giảm delay để hiệu ứng nhanh hơn
  );
}
const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
const material = new THREE.PointsMaterial( { color: 0xee5282, blending: THREE.AdditiveBlending, size: 3 } );
const particles = new THREE.Points(geometry, material);
particles.position.x -= 600 / 2;
particles.position.y += 552 / 2;
scene.add(particles);

gsap.fromTo(scene.rotation, {
  y: -0.2
}, {
  y: 0.2,
  repeat: -1,
  yoyo: true,
  ease: 'power2.inOut',
  duration: 5 // Kéo dài thời gian xoay
});

/* =================== HOA MỌC (PHẦN MÃ MỚI) =================== */

function createAndAnimateFlower(position) {
  // 1. Thân cây
  const stemHeight = Math.random() * 150 + 80; // Chiều cao ngẫu nhiên
  const stemMaterial = new THREE.PointsMaterial({ color: 0x00ff00, size: 2, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8 });
  const stemVertices = [];
  for (let i = 0; i < stemHeight; i += 5) {
    stemVertices.push(new THREE.Vector3(0, i, 0));
  }
  const stemGeometry = new THREE.BufferGeometry().setFromPoints(stemVertices);
  const stem = new THREE.Points(stemGeometry, stemMaterial);

  // 2. Bông hoa
  const bloomColor = new THREE.Color().setHSL(Math.random(), 1.0, 0.6); // Màu ngẫu nhiên
  const bloomMaterial = new THREE.PointsMaterial({ color: bloomColor, size: 4, blending: THREE.AdditiveBlending, transparent: true, opacity: 1 });
  const bloomVertices = [];
  const bloomRadius = Math.random() * 15 + 10;
  for (let i = 0; i < 60; i++) { // 60 hạt cho mỗi bông hoa
     const phi = Math.acos(-1 + (2 * i) / 60);
     const theta = Math.sqrt(60 * Math.PI) * phi;
     const vector = new THREE.Vector3();
     vector.setFromSphericalCoords(bloomRadius, phi, theta);
     bloomVertices.push(vector);
  }
  const bloomGeometry = new THREE.BufferGeometry().setFromPoints(bloomVertices);
  const bloom = new THREE.Points(bloomGeometry, bloomMaterial);
  bloom.position.y = stemHeight; // Đặt bông hoa trên đỉnh thân cây

  // 3. Nhóm chúng lại
  const flower = new THREE.Group();
  flower.add(stem);
  flower.add(bloom);
  flower.position.set(position.x, position.y, position.z);
  scene.add(flower);

  // 4. Hoạt ảnh bằng GSAP
  stem.scale.y = 0; // Bắt đầu với thân cây chưa mọc
  bloom.scale.set(0, 0, 0); // Bắt đầu với bông hoa chưa nở

  const flowerTl = gsap.timeline({
    delay: Math.random() * 10, // Mỗi cây bắt đầu mọc ở thời điểm ngẫu nhiên
    repeat: -1,
    repeatDelay: Math.random() * 5 + 5 // Lặp lại sau một khoảng thời gian ngẫu nhiên
  });

  flowerTl.to(stem.scale, { y: 1, duration: 3, ease: "power3.out" }) // Thân cây mọc lên
    .to(bloom.scale, { x: 1, y: 1, z: 1, duration: 2, ease: "elastic.out(1, 0.5)" }, "-=1") // Bông hoa nở ra
    .to(flower.position, { y: '+=30', duration: 5, ease: "power1.inOut", yoyo: true, repeat: 1 }, 0) // Hoa trôi nhẹ
    .to([stem.material, bloom.material], { opacity: 0, duration: 2, ease: "power1.in" }, "+=5") // Mờ dần rồi biến mất
    .eventCallback("onRepeat", () => { // Reset lại trạng thái khi lặp lại
        gsap.set([stem.material, bloom.material], { opacity: 1 });
        gsap.set(stem.scale, { y: 0 });
        gsap.set(bloom.scale, { x: 0, y: 0, z: 0 });
    });
}

// Tạo ra một cánh đồng hoa
const numFlowers = 150;
const groundLevel = -350; // Vị trí mặt đất, bên dưới trái tim
const areaSize = 1200; // Độ rộng của khu vực hoa mọc
for (let i = 0; i < numFlowers; i++) {
  const x = (Math.random() - 0.5) * areaSize;
  const z = (Math.random() - 0.5) * areaSize;
  createAndAnimateFlower(new THREE.Vector3(x, groundLevel, z));
}


/* =================== RENDERING =================== */
function render() {
  requestAnimationFrame(render);
  // Cập nhật geometry của trái tim từ các đỉnh đã được animate
  geometry.setFromPoints(vertices);
  renderer.render(scene, camera);
}

/* =================== EVENTS =================== */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

// Bắt đầu vòng lặp render
requestAnimationFrame(render);