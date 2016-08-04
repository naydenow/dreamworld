'use strict';

import Keyboard from './game.controls.keyboard.js';

export default class Controls {
  constructor(camera, canvas, game) {
    this.camera   = camera;
    this.canvas   = canvas;
    this.game     = game;
    this.keyboard = new Keyboard();
    this.init();
    this.pointLock();
    this.canJump  = true;
    this.velocity = new THREE.Vector3();
    this.speed    = 1000;
  }

  init() {
    this._control = new THREE.PointerLockControls(this.camera);
    this.game.scene.add(this._control.getObject());
  }

  updateControls(delta) {

    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    if (this.keyboard.pressed('W')) this.velocity.z -= this.speed * delta;
    if (this.keyboard.pressed('S')) this.velocity.z += this.speed * delta;
    if (this.keyboard.pressed('A')) this.velocity.x -= this.speed * delta;
    if (this.keyboard.pressed('D')) this.velocity.x += this.speed * delta;

    //if ( isOnObject === true ) {
    this.velocity.y = Math.max(0, this.velocity.y);
    this.canJump    = true;
    //}

    this._control.getObject().translateX(this.velocity.x * delta);
    this._control.getObject().translateY(this.velocity.y * delta);
    this._control.getObject().translateZ(this.velocity.z * delta);

    if (this._control.getObject().position.y < 50) {
      this.velocity.y                      = 0;
      this._control.getObject().position.y = 50;
      this.canJump                         = true;
    }

  }

  update(d) {
    if (this._control !== undefined && this._control.update)
      this._control.update(d);
    this.updateControls(d);
  }

  pointLock() {
    var camera, scene, renderer;
    var geometry, material, mesh;
    var controls;
    var objects         = [];
    var raycaster;
    var self            = this;
    var blocker         = document.getElementById('blocker');
    var instructions    = document.getElementById('instructions');
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock) {
      var element           = document.body;
      var pointerlockchange = function (event) {
        if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
          blocker.style.display = 'none';
          self._control.enabled = true;
        } else {
          blocker.style.display      = '-webkit-box';
          blocker.style.display      = '-moz-box';
          blocker.style.display      = 'box';
          instructions.style.display = '';
          self._control.enabled      = false;
        }
      };
      var pointerlockerror  = function (event) {
        instructions.style.display = '';
      };
      // Hook pointer lock state change events
      document.addEventListener('pointerlockchange', pointerlockchange, false);
      document.addEventListener('mozpointerlockchange', pointerlockchange, false);
      document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
      document.addEventListener('pointerlockerror', pointerlockerror, false);
      document.addEventListener('mozpointerlockerror', pointerlockerror, false);
      document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

      instructions.addEventListener('click', function (event) {
        instructions.style.display = 'none';
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        if (/Firefox/i.test(navigator.userAgent)) {
          var fullscreenchange = function (event) {
            if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
              document.removeEventListener('fullscreenchange', fullscreenchange);
              document.removeEventListener('mozfullscreenchange', fullscreenchange);
              element.requestPointerLock();
            }
          };

          document.addEventListener('fullscreenchange', fullscreenchange, false);
          document.addEventListener('mozfullscreenchange', fullscreenchange, false);
          element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
          element.requestFullscreen();
        } else {
          element.requestPointerLock();
        }
      }, false);
    } else {
      instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }
  }

}