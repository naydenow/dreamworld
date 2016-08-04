

/*
    updateUniforms =[{"type":"f","value":1.0,"update":"time"}]

    time -  performance.now();
*/

var WWShaders = function(camera){
   
    this.id =1;
    this.array = [];

    this.add = function(updateUniforms,object){
        var id = this.id++;
        var self = this;
        object.addEventListener('removed',function(){
            self.removeById(id);
        });
        this.array.push({"id":id,"uniforms":updateUniforms});
    }

    this.removeById = function(id){
        var l = this.array.length;
        while(l--){
            if (this.array[l].id === id){
                this.array.splice(l,1);
                return;
            }
        }
    }

    this.update = function(delta){
        var t = performance.now();
        var l =  this.array.length;
        
        while(l--){
            var lu = this.array[l].uniforms.length;
            while(lu--){
                if (this.array[l].uniforms[lu].update === "time"){
                    this.array[l].uniforms[lu].value = t;
                } else if (this.array[l].uniforms[lu].update === "costime"){
                    this.array[l].uniforms[lu].value = 0.5 + Math.abs(Math.cos( t  ));
                }
            }
        }
    }

};

THREE.WWShaders = new WWShaders();


THREE.ShaderLib['translucentBoard'] = {
    uniforms: THREE.UniformsUtils.merge( [
        {   texture1:	{ type: "t", value: null },
            opacity:	{ type: "f", value: 0.7 },
            tint:	{ type: "v3", value: null }  }

    ] ),

    vertexShader: [
    "precision mediump float;",
    "precision mediump int;",
    "attribute vec2 uv;",
    "attribute vec3 position;",
    "uniform mat4 modelViewMatrix;", // optional
    "uniform mat4 projectionMatrix;", // optional
    "varying vec2 vUV;",
    "void main()",
        "{",
        "vUV = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}",
    ].join("\n"),

    fragmentShader:[
    "precision mediump float;",
    "precision mediump int;",
    "uniform sampler2D texture1;",
    "uniform float opacity;",
    "uniform vec3 tint;",
    "varying vec2 vUV;",
        "void main()",
        "{",
        "gl_FragColor = texture2D(texture1,vUV);",
        "gl_FragColor.xyz *= tint;",
        "gl_FragColor.w *= opacity;",
        "}"
    ].join("\n")

};




THREE.ShaderLib['terrainShader'] = {

        uniforms: THREE.UniformsUtils.merge( [
            THREE.UniformsLib[ "common" ],
            THREE.UniformsLib[ "fog" ],
            THREE.UniformsLib[ "lights" ],

            {   
                bumpTexture1:   { type: "t", value: null },
                t1: { type: "t", value: null },
                t2: { type: "t", value: null },
                t3: { type: "t", value: null },
                repeat: { type: 'f', value: 10.0 },

                

            }

        ] ),

        vertexShader: [

            "#define LAMBERT",

            "varying vec3 vLightFront;",


            THREE.ShaderChunk[ "common" ],

            "uniform sampler2D bumpTexture1;",
            "varying vec4 blend;",
            "varying vec2 vUV;",

            "void main()",
            "{",
                "vUV = uv;",
                "blend = texture2D( bumpTexture1, uv );",

                "vec3 objectNormal = vec3( normal );",

                "vec3 transformedNormal = normalMatrix * objectNormal;",


                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",


            "}",
        ].join("\n"),

        fragmentShader: [


                THREE.ShaderChunk[ "common" ],

                "uniform sampler2D t1;",
                "uniform sampler2D t2;",
                "uniform sampler2D t3;",

                "uniform vec3 diffuse;",
                "uniform vec3 emissive;",
                "uniform float opacity;",
                
                "uniform float repeat;",

                "varying vec2 vUV;",
                "varying vec4 blend;",

                THREE.ShaderChunk[ "fog_pars_fragment" ],
                
                "void main()",
                "{",
                "vec3 outgoingLight = vec3( 0.0 );",

                "vec4 textu = texture2D(t1,  vUV * repeat ) * blend.r +",
                "texture2D(t2,  vUV * repeat ) * blend.g + ",
                "texture2D(t3,  vUV * repeat ) * blend.b ;",

                "outgoingLight = textu.xyz   ; ",
        
                THREE.ShaderChunk[ "fog_fragment" ],

                "gl_FragColor = vec4( outgoingLight, 1.0 );",
                "}"
        ].join("\n")

    };



