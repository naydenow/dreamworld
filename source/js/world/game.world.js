'use strict';
import WorldLoader from './game.world.loader';

export default class World {
  constructor(scene, worldName, listaner) {
    this.listaner    = listaner;
    this.title       = worldName;
    this.worldserver = 'http://ww.sunnygames.net/terrain/';
    this.allterrain  = [];
    this.worldLoader = new WorldLoader(this.allterrain, scene, this);
    this.oldmap      = [];
    this.map         = [];
    this.scene       = scene;
    this.cubestep    = 2000;
    this.initSimpl()

    this.checkTimer = setInterval(()=> {
      this.check();
    }, 3000);
  }

  initSimpl() {
/*    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    this.scene.add(light);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 0, 1, 0 );
    this.scene.add( directionalLight );*/
  }


  /* <-----------------------------Обновление карты --------------------------->*/
  check() {
    //console.trace();
    var object = this.listaner;
    var self   = this;

    if (!object) {
      return
    }

    var _x, _z;
    _x = _z = this.cubestep / 2;

    if (object.position.x < 0) {
      _x = -_x;
    }
    if (object.position.z < 0) {
      _z = -_z;
    }

    var x = ~~(((_x + object.position.x) / this.cubestep));
    var z = ~~(((_z + object.position.z) / this.cubestep));

    if (!object.cubID)
      object.cubID = '999=999';


    if (object.cubID === x + '=' + z) {
      return
    }
    var oldmap = this.oldmap;

    this.map = [parseInt(x - 1) + '=' + parseInt(z + 1), x + '=' + parseInt(z + 1), parseInt(x + 1) + '=' + parseInt(z + 1),
      parseInt(x - 1) + '=' + parseInt(z), x + '=' + z, parseInt(x + 1) + '=' + parseInt(z),
      parseInt(x - 1) + '=' + parseInt(z - 1), x + '=' + parseInt(z - 1), parseInt(x + 1) + '=' + parseInt(z - 1)];


    var delar = [];
    var sclen = oldmap.length;
    while (sclen--) {
      if (oldmap[sclen] !== undefined) {
        var mind = this.map.indexOf(oldmap[sclen]);
        if (mind !== -1) {
          this.map.splice(mind, 1);
        } else {
          delar.push(oldmap[sclen]);
        }
      }
    }

    var l = this.scene.children.length;
    while (l--) {
      var sobject = this.scene.children[l];
      if (sobject.cubIDs !== undefined) {
        if (delar.indexOf(sobject.cubIDs) !== -1) {
          if (sobject.types !== "landscape") {
            this.scene.remove(sobject);
          }
        }
      }
    }


    var ter = [];
    var ml  = this.map.length;
    while (ml--) {
      if (this.allterrain.indexOf(this.map[ml]) === -1) {
        ter.push(this.map[ml]);
      }
    }

    $.getJSON(this.worldserver + '/php/script/load.php', {
        'map':    this.title,
        'action': 'getmap',
        'ter':    JSON.stringify(ter),
        'array':  JSON.stringify(this.map)
      },
      function (responce) {
        console.log('responce', responce);
        self.worldLoader.loadResponce(responce);

      });

    object.cubID = x + '=' + z;

    this.oldmap = [parseInt(x - 1) + '=' + parseInt(z + 1), x + '=' + parseInt(z + 1), parseInt(x + 1) + '=' + parseInt(z + 1),
      parseInt(x - 1) + '=' + parseInt(z), x + '=' + z, parseInt(x + 1) + '=' + parseInt(z),
      parseInt(x - 1) + '=' + parseInt(z - 1), x + '=' + parseInt(z - 1), parseInt(x + 1) + '=' + parseInt(z - 1)];


  }

  /* <-------------------------------------------------------------------------> */

  update(d) {
    if (this._control !== undefined && this._control.update)
      this._control.update(d);
  }
}