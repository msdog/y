import * as THREE from 'three';


import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const clock = new THREE.Clock();
const el = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#ccc');
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.02).texture;

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.set(-84.53957152939454, 45.583457047392706, 49.89488710639405);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
console.log('🚀 ~ controls:', controls)
controls.update();
controls.enablePan = false;
controls.enableDamping = true;
controls.autoRotate = true;


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://threejs.org//examples/jsm/libs/draco/gltf/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const App = {
  template:  /* html */ `

    <div class='logo'>
      <img src="./assets/Logo.jpeg" />
    </div>

    <div class='name' >
      class
    </div>

    <div class='options'>
      <div class="options-item">
        <img src="./assets/off.png" v-if="!isMusic" @click="switchMusic(1)">
        <img src="./assets/on.png" v-else @click="switchMusic(0)">
      </div>
      <div class="options-item">
        <img src="./assets/rotateOff.png" v-if="!isRotation" @click="switchRotate(1)">
        <img src="./assets/rotateOn.png" v-else @click="switchRotate(0)">
      </div>
    </div>

  `,
  data () {
    let audioBgm = new Audio('./assets/audio/1.mp3')
    this.audioBgm = audioBgm
    this.audio = new Audio()
    audioBgm.loop = this.audio.loop = true

    let list = [
      // { src: 'http://img.cgmodel.com/image/2017/0520/big/889027-1786208750.jpg', introMusic: './assets/audio/UNC Gate.mp3' },
      { src: './assets/pano/2.jpg', introMusic: './assets/audio/1.mp3' },
    ]
    return {
      isMusic: 1,
      isRotation: 1,
      currScene: '',
      name: "",
      list: list,

    }
  },
  mounted () {
    this.loadData()
    this.initTHree()
  },
  methods: {
    initTHree () {
      el.appendChild(renderer.domElement);

      loader.load('./assets/pano/classroom.glb', function (gltf) {

        const model = gltf.scene;
        scene.add(model);

      }, undefined, function (e) {
        console.error(e);
      });


      window.onresize = function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

      };


      function animate () {
        requestAnimationFrame(animate)
        const delta = clock.getDelta();

        controls.update();


        renderer.render(scene, camera);

      }

      animate()
    },
    async loadData () {
      await this.$nextTick()
      // this.initSwiper()
      this.change(0)

      let timer
      let handleAnimation = (event) => {
        this.canPlay = true
        this.isMusic && this.audioBgm.play()
        this.isMusic && this.currScene?.introMusic && this.audio.play()
        clearTimeout(timer)
        controls.autoRotate = false
        timer = setTimeout(() => {
          this.isRotation && this.switchRotate(1)
        }, 3000)
      }
      window.addEventListener("pointerdown", handleAnimation);

    },
 
    change (index) {
      this.currScene = this.list[index]
      this.audio.src = this.currScene.introMusic
      if (this.currScene.introMusic && this.canPlay) {
        this.audio.play()
      }
    },
    switchMusic (val) {
      this.isMusic = val
      if (val) {
        this.audioBgm.play()
        this.currScene.introMusic && this.audio.play()
      } else {
        this.audioBgm.pause()
        this.audio.pause()
      }
    },
    switchRotate (val) {
      this.isRotation = !!val
      controls.autoRotate = this.isRotation
    },
  }
};
// vue init 

var app = Vue.createApp(App)
console.log('🚀 ~ app:', app)
app.mount("#app")


function loadImg (url) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = url
  })
}
function toThumb (img, resizeWidth = 300, resizeHeight = 150) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = resizeWidth
    canvas.height = resizeHeight
    context.drawImage(img, 0, 0, img.width, img.height, 0, 0, resizeWidth, resizeHeight)
    // canvas转url
    resolve(canvas.toDataURL())
  })
}