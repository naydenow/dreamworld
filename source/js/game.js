'use strict';

import Controls from './controls/game.controls';
import World from './world/game.world';

export default class Game {
  constructor(window) {
    this.win       = window;
    this.container = document.getElementById('container');
    this.camera    = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1100000);
    this.camera.position.set(0, 1, 0);
    this.scene    = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.clock    = new THREE.Clock();
    this.stats    = new Stats();
    this.container.appendChild(this.stats.dom);
    this.controls = new Controls(this.camera, this.renderer.domElement, this);

    this.world = new World(this.scene, 'dreamworld', this.controls._control.getObject());

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    this.init();
    this.animate();



    this.testWorker = new Thread("workers/test.js", "Test");
    this.testWorker.on("t", (nw) => {
       //alert("workerMessage " + nw);
    });
    this.testWorker.emit("t","hi lol");
  }


  /* Инициализация сцены */
  init() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor( 0xb1b6ff, 1 );
    this.container.appendChild(this.renderer.domElement);
  }

  /* Обновления и рендеринг  */
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.update();
  }

  update() {
    this.stats.update();
    var dt = this.clock.getDelta();
    THREE.WWShaders.update(dt);
    this.controls.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

}