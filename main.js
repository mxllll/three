import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

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

//  FIRST PERSON CONTROLS   ----------
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 70;
controls.lookSpeed = 0.1;

//  LIGHT   ----------
//const light = new THREE.HemisphereLight(0xffffff, 0.5);
const light = new THREE.PointLight(0xffffff, 0.5);
light.position.set(100, 100, 100);
//light.castShadow = true;
scene.add(light);

createBall();

function createBall() {
    const geometry = new THREE.SphereGeometry(10, 10, 10);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffff00,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 0, 0);

    scene.add(sphere);
}

// model
const gLoader = new GLTFLoader().setPath('public/');

// // Optional: Provide a DRACOLoader instance to decode compressed mesh data
// const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
// loader.setDRACOLoader( dracoLoader );

// Load a glTF resource
gLoader.load(
	// resource URL
	'orange.gltf',
	// called when the resource is loaded
	(gltf) => {
		
		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object

		const mesh = gltf.scene;
		mesh.position.set(10, 10, 10);
		scene.add(mesh);

	}
	// // called while loading is progressing
	// function ( xhr ) {

	// 	console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	// },
	// // called when loading has errors
	// function ( error ) {

	// 	console.log( 'An error happened', error );

	// }
);

//  RENDERER   ----------
function animate() {
    requestAnimationFrame(animate);
    controls.update(0.01);
    renderer.render(scene, camera);
}

animate();
