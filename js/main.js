import "../style/style.css";

import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton";
import { OrbitControls } from "three/addons/controls/OrbitControls";

// File list
import Files from "./files";

let camera, controls;
let scene, renderer;
let sphere;
let clock;

if (init()) {
  renderer.setAnimationLoop(render);
}

function init() {
  const container = document.getElementById("container");

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101010);

  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.z = 0.01;
  // scene.add(camera);

  // Create the panoramic sphere geometery
  const panoSphereGeo = new THREE.SphereGeometry(6, 256, 256);

  // Create the panoramic sphere material
  const panoSphereMat = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    displacementScale: -4.0,
  });

  // Create the panoramic sphere mesh
  sphere = new THREE.Mesh(panoSphereGeo, panoSphereMat);

  // Load and assign the texture and depth map
  const manager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(manager);

  const rand = Math.floor(Math.random() * Files.length);
  const image = Files[rand].name;

  // Load the map and the depth texture
  loader.load("./assets/images/" + image, function (texture) {
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    sphere.material.map = texture;
  });

  loader.load("./assets/depths/" + image, function (depth) {
    depth.minFilter = THREE.NearestFilter;
    depth.generateMipmaps = false;
    sphere.material.displacementMap = depth;
  });

  // On load complete add the panoramic sphere to the scene
  manager.onLoad = function () {
    scene.add(sphere);
  };

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType("local");
  container.appendChild(renderer.domElement);

  //

  // Detects if the browser supports VR
  const supportsVR = 'getVRDisplays' in navigator;
  
  // If VR is supported, add the VR button
  // Otherwise, add mouse controlled camera
  if (supportsVR) {
    document.body.appendChild(VRButton.createButton(renderer));
  } else {
    controls = new OrbitControls( camera, renderer.domElement );
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.rotateSpeed = - 0.25;
  }

  //

  window.addEventListener("resize", onWindowResize);

  //

  // if everything works, return true
  return true;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  // If we are not presenting move the camera with the mouse

  if (renderer.xr.isPresenting === false) {
    controls.update(); // required when damping is enabled
  }

  renderer.render(scene, camera);
}
