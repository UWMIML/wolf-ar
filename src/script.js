import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import OrbitControls from 'three-orbit-controls';
// import WEBVR from './WebVR';
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
  let mixer;
  const clock = new THREE.Clock();
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
  scene.background = new THREE.Color(0xdddddd);

  // Add light to scene
  const hemlight = new THREE.HemisphereLight(0xfff0f0, 0x606066)
  const amblight = new THREE.AmbientLight(0x404040);
  hemlight.position.set(1, 1, 1);
  scene.add(hemlight);
  scene.add(amblight);

  // Add camera
  const camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 1, 1000);
  camera.position.z = 400;

  // Controls
  const _orbitControls = OrbitControls(THREE);
  const controls = new _orbitControls(camera);

  // Update dimensions on resize
  window.onresize = windowResize(renderer, camera);

  // Prepare geometries and meshes
  const loader = new GLTFLoader();
  loader.load(riggedWolfGLTF, gltf => {
    const object = gltf.scene;
    const gltfAnimation = gltf.animations;
    object.rotateY(40);
    scene.add(object);
    object.traverse(node => {
      if(node.material && 'envMap' in node.material){
        console.log(node);
        node.material.envMap = null;
        node.material.needsUpdate = true;
        node.material.wireframe = true;
      }
    });
    if(gltfAnimation && gltfAnimation.length) {
      console.log("Animation: ", gltfAnimation);
      mixer = new THREE.AnimationMixer(object);
      gltfAnimation.forEach(animation => {
        mixer.clipAction(animation).play();
        animate(renderer);
      });
    }
  });

  // render scene
  const render = () => {
    controls.update();
    mixer.update(0.75 * clock.getDelta());
    renderer.render(scene, camera);
  }
  const animate = renderer => {
    renderer.setAnimationLoop(render);
  }
});
