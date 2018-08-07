import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
// import WEBVR from './WebVR';
import cameraZoomTo from './cameraZoomTo';
import riggedWolfGLTF from './rigged-wolf.gltf';

const ready = cb => {
  /in/.test(document.readyState) // in = loadINg
    ? setTimeout(ready.bind(null, cb), 9)
    : cb();
}

// Reset camera and renderer on resize
const windowResize = (renderer, camera) => {
  const [ windowWidth, windowHeight ] = [ window.innerWidth, window.innerHeight ];
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(windowWidth, windowHeight);
};

ready(function() {
  const [ windowWidth, windowHeight ] = [ window.innerWidth, window.innerHeight ];
  // Set up renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowWidth, windowHeight);
  // renderer.vr.enabled = true;
  // renderer.vr.userHeight = 0;
  document.body.appendChild(renderer.domElement);
  // document.body.appendChild( WEBVR.createButton( renderer, { frameOfReferenceType: 'eye-level' } ) );

  // Set up scene
  const scene = new THREE.Scene();

  // Add light to scene
  const hemlight = new THREE.HemisphereLight(0xfff0f0, 0x606066)
  const amblight = new THREE.AmbientLight(0x404040);
  hemlight.position.set(1, 1, 1);
  scene.add(hemlight);
  scene.add(amblight);

  // Add camera
  const camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 1, 1000);
  // camera.position.z = 60;

  // Update dimensions on resize
  windowResize(renderer, camera)

  // Prepare geometries and meshes
  const loader = new GLTFLoader();
  loader.load(riggedWolfGLTF, gltf => {
    console.log("Test whole gltf", gltf);
    const children = [];
    gltf.scene.traverse(child => {
      console.log(child);

      if(child.isMesh){
        console.log("Found child mesh");
        cameraZoomTo(camera, child);
        console.log(camera.position.z);
        children.push(child);
      }
    })
    children.forEach(child => scene.add(child.clone()));
    gltf.scene.scale.setScalar(.25);
    // scene.add(gltf.scene);
  });

  // Debug cube
  const boxGeometry = new THREE.BoxGeometry(100, 100, 100);
  const boxMaterial = new THREE.MeshNormalMaterial();
  const cube = new THREE.Mesh(boxGeometry, boxMaterial);
  scene.add(cube);

  // render scene
  const render = () => {
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(render);
});
