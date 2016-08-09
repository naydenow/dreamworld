'use strict';

export default class WorldLoader {
  constructor(allterrain, scene, world) {
    this.allterrain = allterrain;
    this.world      = world;
    this.scene      = scene;
    this.loader     = new THREE.JSONLoader();
    this.urlPrefix  = 'http://ww.sunnygames.net';
  }


  loadResponce(data) {
    for (var c in data) {
      var cub = data[c];
      this.loadterrian(cub.T, c);
      this.loadModel(cub.M, c);
      //this.loadCollision(cub.C,c);
      //this.loadAudio(cub.A,c);
      //this.loadParticle(cub.P,c);
    }
  }

  loadModel(models, c) {
    var cube  = c;
    var _cube = c.split('=');
    var ml    = models.length;
    if (ml > 0) {
      var tim = setInterval(() => {
        ml--;
        if (ml < 0) {
          clearInterval(tim);
          return;
        }
        var model    = models[ml];
        var modelurl = '/resource/model' + model.model + 's.js';
        var imgurl   = '/resource/model' + model.model + 'j.png';
        var murl     = this.urlPrefix + modelurl;
        this.loader.load(murl, (geometry, materials) => {

          if (materials === undefined) {
            var path     = murl.substr(0, murl.length - 4);
            var map      = THREE.ImageUtils.loadTexture(path + "standartmap.png");
            var props    = {map: map};
            var material = new THREE.MeshPhongMaterial(props);
            var materia  = new THREE.MeshFaceMaterial([material]);

          } else {
            var materia = new THREE.MeshFaceMaterial(materials);
          }

          var morph2        = new THREE.Mesh(geometry, materia);
          morph2.position.x = model.position.x + parseFloat(_cube[0]) * 2000;
          morph2.position.y = model.position.y;
          morph2.position.z = model.position.z + parseFloat(_cube[1]) * 2000;
          morph2.scale.copy(model.scale);
          morph2.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
          this.scene.add(morph2);
        });
      }, 1);
    }
  }

  loadMaterial(material, terra, cub) {

    if (material.TYPE === 'TerrainMaterial') {
      ///home/waterworld/public/resource/hm/world/test/0=0/hm
      if (cub !== undefined) {
        var bumpTexture = new THREE.ImageUtils.loadTexture(this.urlPrefix + '/resource/hm/world/' + this.world.title + '/' + cub + '/hm/' + terra.G.option.name + '.png');
      } else {
        var bumpTexture = null;
      }

      var tt1   = new THREE.ImageUtils.loadTexture(this.urlPrefix + material.tt1);
      tt1.wrapS = tt1.wrapT = THREE.RepeatWrapping;
      var tt2   = new THREE.ImageUtils.loadTexture(this.urlPrefix + material.tt2);
      tt2.wrapS = tt2.wrapT = THREE.RepeatWrapping;
      var tt3   = new THREE.ImageUtils.loadTexture(this.urlPrefix + material.tt3);
      tt3.wrapS = tt3.wrapT = THREE.RepeatWrapping;
      var r = 10.0;
      if (terra !== undefined)
        if (terra.G.option.repeat !== undefined) {
          r = terra.G.option.repeat;
        }
      var customUniforms = {
        bumpTexture1: {type: "t", value: bumpTexture},
        t1:           {type: "t", value: tt1},
        t2:           {type: "t", value: tt2},
        t3:           {type: "t", value: tt3},
        repeat:       {type: 'f', value: parseFloat(r)},
      };


      var terrainShader                  = THREE.ShaderLib["terrainShader"];
      var terrainUniforms                = THREE.UniformsUtils.clone(terrainShader.uniforms);
      terrainUniforms.bumpTexture1.value = bumpTexture;
      terrainUniforms.t1.value           = tt1;
      terrainUniforms.t2.value           = tt2;
      terrainUniforms.t3.value           = tt3;
      terrainUniforms.repeat.value       = parseFloat(r);

      var customMaterial = new THREE.ShaderMaterial({
        fragmentShader: terrainShader.fragmentShader,
        vertexShader:   terrainShader.vertexShader,
        uniforms:       terrainUniforms,
        fog:            true
      });
      return customMaterial;
    } else if (material.TYPE === 'ShaderMaterial') {
      var shader              = THREE.ShaderLib[material.shadername];
      var matoptions          = material.matrialoptions;
      var shaderMaterilaProps = {
        'uniforms':       material.uniforms,
        'vertexShader':   shader.vertexShader,
        'fragmentShader': shader.fragmentShader
      };
      for (var unif in  material.uniforms) {
        if (shaderMaterilaProps.uniforms[unif] !== undefined) {
          var val = this.urlPrefix + material.uniforms[unif].value;
          if (shaderMaterilaProps.uniforms[unif].type === "t") {
            //texture
            val = new THREE.ImageUtils.loadTexture(val);
            val.repeat.set(4, 4);
          }
          if (shaderMaterilaProps.uniforms[unif].type === "v3") {
            val = new THREE.Vector3().fromArray(val !== null ? val : [0, 0, 0]);
          }
          shaderMaterilaProps.uniforms[unif].value = val;
        }
      }

      for (var o in matoptions) {
        if (shaderMaterilaProps[o] === undefined)
          shaderMaterilaProps[o] = matoptions[o];
      }

      if (material.shadertype === "RawShaderMaterial") {
        var mat = new THREE.RawShaderMaterial(shaderMaterilaProps);
      } else {
        var mat = new THREE.ShaderMaterial(shaderMaterilaProps);
      }

      return mat;
    } else {
      var materialoption = material.matrialoptions;
      if (material.MAP !== undefined) {
        THREE.ImageUtils.crossOrigin = "anonymous";
        var texture                  = THREE.ImageUtils.loadTexture(this.urlPrefix + material.MAP);
        texture.wrapS                = THREE.RepeatWrapping;
        texture.wrapT                = THREE.RepeatWrapping;
        if (material.TEXTURE_REPAIRX !== undefined) {
          texture.repeat.set(material.TEXTURE_REPAIRX, material.TEXTURE_REPAIRY);
        } else {
          texture.repeat.set(10, 10);
        }
        materialoption.map = texture;
      }
      var material = new THREE[material.TYPE](materialoption);
      return material;
    }

  }


  loadterrian(data, c) {
    var l     = data.length;
    var cub   = c;
    var _cube = cub.split('=');
    this.allterrain.push(c);
    while (l--) {
      var terra       = data[l];
      var material    = this.loadMaterial(terra.M, terra, cub);
      var geometry    = this.loadGeometru(terra.G);
      var mesh        = new THREE.Mesh(geometry, material);
      mesh.position.x = terra.G.position.x + parseFloat(_cube[0]) * 2000;
      mesh.position.y = terra.G.position.y;
      mesh.position.z = terra.G.position.z + parseFloat(_cube[1]) * 2000;
      mesh.rotation.x = terra.G.rotation._x;
      mesh.rotation.y = terra.G.rotation._y;
      mesh.rotation.z = terra.G.rotation._z;
      mesh.scale.x    = terra.G.scale.x;
      mesh.scale.y    = terra.G.scale.y;
      mesh.scale.z    = terra.G.scale.z;
      if (material.uniforms === undefined)
        material.uniforms = {};

      for (var d in terra.G.option) {
        mesh[d] = terra.G.option[d];
      }

      if (material.uniforms.repeat !== undefined) {
        mesh.material.uniforms.repeat.value = mesh.repeat;
        console.log('mesh.repeat', mesh.repeat);
      }

      var updateUniform = [];
      for (var m in material.uniforms) {
        if (material.uniforms[m].update !== undefined) {
          updateUniform.push(material.uniforms[m]);
        }
      }

      if (updateUniform.length > 0)
        THREE.WWShaders.add(updateUniform, mesh);

      var CUBSTEP = 2000;
      var _x, _z;

      _x = _z = CUBSTEP / 2;
      if (mesh.position.x < 0) {
        _x = -_x;
      }
      if (mesh.position.z < 0) {
        _z = -_z;
      }

      mesh.cubIDs = cub;
      this.scene.add(mesh);
    }

  }

  loadGeometru(data) {

    var geometry = new THREE.PlaneGeometry(data.option.width, data.option.height, data.option.wsegment, data.option.hsegment);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    var gl = data.geometry.vertices.length;
    while (gl--) {
      geometry.vertices[gl].x = data.geometry.vertices[gl].x;
      geometry.vertices[gl].y = data.geometry.vertices[gl].y;
      geometry.vertices[gl].z = data.geometry.vertices[gl].z;
    }

    var geometry = new THREE.BufferGeometry().fromGeometry(geometry);
    return geometry;

  }

}