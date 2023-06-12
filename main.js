import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//  SCENE   ----------
const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
const texture = loader.load('/background.png', () => {
    const buffer = new THREE.WebGLCubeRenderTarget(texture.image.height);
    buffer.fromEquirectangularTexture(renderer, texture);
    scene.background = buffer.texture;
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//  CAMERA   ----------
const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);
camera.position.set(0, 30, 30);

//  ORBIT CONTROLS   ----------
const controls = new OrbitControls(camera, renderer.domElement);

//  FIRST PERSON CONTROLS   ----------
// const controls = new FirstPersonControls(camera, renderer.domElement);
// controls.movementSpeed = 70;
// controls.lookSpeed = 0.1;

//  LIGHT   ----------
//const light = new THREE.HemisphereLight(0xffffff, 0.5);
const light = new THREE.PointLight(0xffffff, 0.5);
light.position.set(100, 100, 100);
//light.castShadow = true;
scene.add(light);

//  OBJECTS   ----------
const cone = createCone();
createBall();
const box = createBox();
createTable();

//  CONE   ----------
function createCone() {
    const segmentHeight = 1;
    const segmentCount = 3;
    const height = segmentHeight * segmentCount;
    const halfHeight = height * 0.5;

    const sizing = {
        segmentHeight: segmentHeight,
        segmentCount: segmentCount,
        height: height,
        halfHeight: halfHeight,
    };

    //  GEOMETRY
    const geometry = new THREE.ConeGeometry(
        3,
        3,
        sizing.height,
        32,
        sizing.segmentCount * 3,
        true
    );

    const position = geometry.attributes.position;

    const vertex = new THREE.Vector3();

    const skinIndices = [];
    const skinWeights = [];

    for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);

        const y = vertex.y + sizing.halfHeight;

        const skinIndex = Math.floor(y / sizing.segmentHeight);
        const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

        skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
        skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
    }

    geometry.setAttribute(
        'skinIndex',
        new THREE.Uint16BufferAttribute(skinIndices, 4)
    );
    geometry.setAttribute(
        'skinWeight',
        new THREE.Float32BufferAttribute(skinWeights, 4)
    );

    //  BONES
    const bones = [];

    let prevBone = new THREE.Bone();
    bones.push(prevBone);
    prevBone.position.y = -sizing.halfHeight;

    for (let i = 0; i < sizing.segmentCount; i++) {
        const bone = new THREE.Bone();
        bone.position.y = sizing.segmentHeight;
        bones.push(bone);
        prevBone.add(bone);
        prevBone = bone;
    }

    //  MATERIAL
    const material = new THREE.MeshNormalMaterial({
        color: 0x049ef4,
        roughness: 0.5,
        metalness: 0.2,
        side: THREE.DoubleSide,
    });

    const mesh = new THREE.SkinnedMesh(geometry, material);
    const coneSkeleton = new THREE.Skeleton(bones);
    mesh.add(bones[0]);
    mesh.bind(coneSkeleton);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    //  VIEW SKELETON
    const skeletonHelper = new THREE.SkeletonHelper(mesh);
    skeletonHelper.material.linewidth = 2;
    scene.add(skeletonHelper);

    //  CONE AUDIO
    // const listener = new THREE.AudioListener();
    // camera.add(listener);

    // const sound = new THREE.PositionalAudio(listener);

    // const audioLoader = new THREE.AudioLoader();
    // audioLoader.load('/Chill.mp3', function (buffer) {
    //     sound.setBuffer(buffer);
    //     sound.setRefDistance(0.8);
    //     sound.setVolume(0.4);
    //     sound.setLoop = true;
    //     sound.play();
    // });
    // mesh.add(sound);

    scene.add(mesh);

    return mesh;
}

//  BALL   ----------
function createBall() {
    const geometry = new THREE.SphereGeometry(15, 32, 16);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffff00,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(-50, -50, 50);

    scene.add(sphere);
}

//  BOX   ----------
function createBox() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshToonMaterial({
        color: 0x00ff00,
        metalness: 100,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(50, 50, 50);

    scene.add(cube);

    return cube;
}

//  TABLE   ----------
function createTable() {
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial());
    plane.rotateX(-Math.PI / 2);
    plane.position.set(0, -2, 0);
    plane.receiveShadow = true;

    scene.add(plane);
}

//  SCENE AUDIO   ----------
// const listener = new THREE.AudioListener();
// camera.add(listener);

// const sound = new THREE.Audio(listener);

// const audioLoader = new THREE.AudioLoader();
// audioLoader.load('/Ambient.mp3', function (buffer) {
//     sound.setBuffer(buffer);
//     sound.setLoop(true);
//     sound.setVolume(0.2);
//     sound.play();
// });

//  RENDERER   ----------
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;
    for (let i = 0; i < cone.skeleton.bones.length; i++) {
        cone.skeleton.bones[i].rotation.z =
            Math.sin(time) / cone.skeleton.bones.length;
    }
    box.rotation.x += 0.003;
    box.rotation.y += 0.003;

    controls.update(0.01);
    renderer.render(scene, camera);
}

animate();
