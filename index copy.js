const App = {
  template:  /* html */ `

    <a-scene>
      <a-assets>
        <img v-for="(item, idx) in list" :key="idx" :id="idx" :src="item.panoSrc" alt="">

        <a-mixin id="spinAnimation" animation="property: object3D.rotation.y; to: 360; loop: true; easing: linear; dur: 96000"></a-mixin>
      </a-assets>
      <a-sky id='sky' src="#0"  rotation="0 -130 0"  mixin="spinAnimation" >
      </a-sky>

      <a-entity gltf-model="url(./assets/pano/classroom.gltf)" scale=''></a-entity>

      <a-camera id='cam'></a-camera>
    </a-scene>
    
    <div class="swiper mySwiper">
      <div class="swiper-wrapper">
        <div class='swiper-slide' v-for="(item, idx) in list" :key="item.src" @click='change(idx)'>
          <img :src="item.iconSrc"  v-show="item.iconSrc"/>
          <div class='title'>
            {{item.src.split('/').pop().split('.')[0]}}
          </div>
        </div>

      </div>
      <div class="swiper-scrollbar"></div>
    </div>


    <div class='logo'>
      <img src="./assets/Logo.jpeg" />
    </div>
    <div class='name' v-if='currScene'>
        {{currScene.src.split('/').pop().split('.')[0]}}
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
    let audioBgm = new Audio('./assets/bgm.mp3')
    this.audioBgm = audioBgm
    this.audio = new Audio()
    audioBgm.loop = this.audio.loop = true

    let list = [
      { src: './assets/pano/UNC Gate.jpg', introMusic: './assets/audio/UNC Gate.mp3' },
      { src: './assets/pano/Woolen Gym.jpg', introMusic: './assets/audio/Woolen Gym.mp3' },
      { src: './assets/pano/Recreation Center.jpg', introMusic: './assets/audio/res.mp3' },
      { src: './assets/pano/Pit.jpg', introMusic: '' },

      { src: './assets/pano/Student Store Third Floor.jpg', introMusic: './assets/audio/Student Store Third Floor.mp3' },
      { src: './assets/pano/Student Union first floor.jpg', introMusic: '' },
      { src: './assets/pano/Student union Second floor.jpg', introMusic: './assets/audio/Student union Second floor.mp3' },

      { src: './assets/pano/Davis Library.jpg', introMusic: './assets/audio/Davis Library.mp3' },
      { src: './assets/pano/Polk Place & Wilson Library.jpg', introMusic: './assets/audio/Polk Place & Wilson Library.mp3' },

      { src: './assets/pano/Peabody hall .jpg', introMusic: './assets/audio/Peabody hall .mp3' },
      { src: './assets/pano/Peabody inside.jpg', introMusic: './assets/audio/Peabody hall .mp3' },

      { src: './assets/pano/Undergraduate Dorm.jpg', introMusic: '' },
      { src: './assets/pano/Undergraduate Library.jpg', introMusic: './assets/audio/Undergraduate Library.mp3' },

      { src: './assets/pano/Old Well& Street Scene.jpg', introMusic: '' },

      { src: './assets/pano/Classroom1 .jpg', introMusic: './assets/audio/classroom.mp3' },
      { src: './assets/pano/Classroom 2.jpg', introMusic: './assets/audio/classroom.mp3' },

    ]
    let idx = 0
    list.map(i => {
      i.panoSrc = i.src
      loadImg(i.src).then(img => {
        // let scale = 0.5
        // toThumb(img, img.width * scale, img.height * scale).then(res => {
        toThumb(img, 300, 150).then(res => {
          i.iconSrc = i.src
          if (++idx === list.length) {
            this.loadData()
          }
        })
        // })

      })
    })
    return {
      isMusic: 1,
      isRotation: 1,
      currScene: '',
      name: "",
      list: list,

    }
  },

  methods: {
    async loadData () {
      await this.$nextTick()
      this.initSwiper()
      this.change(0)
      // Mouse Wheel Zoom
      window.addEventListener("wheel", (event) => {
        // small increments for smoother zooming
        const delta = event.wheelDelta / 120 / 10;
        var mycam = document.getElementById("cam").getAttribute("camera");
        var finalZoom = document.getElementById("cam").getAttribute("camera").zoom + delta;

        // limiting the zoom
        if (finalZoom < 0.5) finalZoom = 0.5;
        if (finalZoom > 2) finalZoom = 2;
        mycam.zoom = finalZoom;

        document.getElementById("cam").setAttribute("camera", mycam);
      });

      // user interaction stop animation
      let timer
      let handleAnimation = (event) => {
        this.canPlay = true
        this.isMusic && this.audioBgm.play()
        this.isMusic && this.currScene?.introMusic && this.audio.play()
        clearTimeout(timer)
        let animation = document.querySelector('#sky').components.animation
        animation && animation['pauseAnimation']()
        timer = setTimeout(() => {
          this.isRotation && this.switchRotate(1)
        }, 3000)
      }
      window.addEventListener("pointerdown", handleAnimation);

    },
    initSwiper () {
      new Swiper(".mySwiper", {
        slidesPerView: 'auto',
        spaceBetween: 15,

        scrollbar: {
          el: ".swiper-scrollbar",
          hide: true,
        },
      });
    },
    change (index) {
      this.currScene = this.list[index]
      document.querySelector('a-sky').setAttribute('src', '#' + index)
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
      this.isRotation = val
      document.querySelector('#sky').components.animation[val ? 'resumeAnimation' : 'pauseAnimation']()
    },
  }
};
// vue init 
var app = Vue.createApp(App)
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