<template>
    <div ref="ThreeModel" style="width: 100%; height: 100%;"></div>
    <!-- <shader type="x-shader/x-vertex" id="vertexshader">

			

		</shader> -->

		<!-- <shader type="x-shader/x-fragment" id="fragmentshader">

			

		</shader> -->
</template>
  
  <script>
  import { Control } from 'ol/control';
import * as THREE from 'three';
  import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { markRaw } from 'vue';
  export default {
    props: {
      objPath: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        scene: markRaw(new THREE.Scene()),
        camera: markRaw(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)),
        renderer: null,
        controls : null,
        vertices: [], // 存储顶点坐标
        raycaster: markRaw(new THREE.Raycaster()),
        mouse: markRaw(new THREE.Vector2()),
        selectedSprite: null, // 存储当前被选中的精灵
        cameraMoved: false, 
        sprite: null,
        sprites: [],
        mousePos:null,
        vertexShader: `
                attribute float size;
                attribute vec3 customColor;

                varying vec3 vColor;

                void main() {

                  vColor = customColor;

                  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

                  // gl_PointSize = size * ( 300.0 / -mvPosition.z );
                  gl_PointSize = size;

                  gl_Position = projectionMatrix * mvPosition;

                }
            `,
        fragmentShader: `
                uniform vec3 color;
                uniform sampler2D pointTexture;
                uniform float alphaTest;

                varying vec3 vColor;

                void main() {

                  gl_FragColor = vec4( color * vColor, 1.0 );

                  gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
                  
                  if ( gl_FragColor.a < alphaTest ) discard;

                }
            `,
            particles:null,
            INTERSECTED:null,
            PARTICLE_SIZE:10
      };
    },
    mounted() {
      
      this.initScene();
      this.loadObj();
      this.animate();
      this.onWindowResize(); 
      this.$refs.ThreeModel.addEventListener('click', this.onMouseClick);
      
    },
    methods: {
        initScene() {
            const width = this.$refs.ThreeModel.clientWidth;
            const height = this.$refs.ThreeModel.clientHeight;

            this.renderer = markRaw(new THREE.WebGLRenderer());
            this.renderer.setSize(width, height);
            this.$refs.ThreeModel.appendChild(this.renderer.domElement);
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.camera.position.z = 5;

            this.controls = markRaw(new OrbitControls(this.camera, this.renderer.domElement))
            this.controls.addEventListener('start', () => {
                this.cameraMoved = false;
            });
            this.controls.addEventListener('change', () => {
                this.cameraMoved = true;
            });
            this.controls.addEventListener('end', () => {
                if (!this.cameraMoved) {
                // 如果相机没有移动，处理点击事件
                  this.handleRaycast();
                }
            });
            var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
            this.scene.add( ambientLight );

            var pointLight = new THREE.PointLight( 0xffffff, 0.8 );

            this.camera.add( pointLight );
            this.scene.add( this.camera );

            

            // Handle window resize
            window.addEventListener('resize', this.onWindowResize);
        },
        handleRaycast() {
            console.log("handleRaycast")
            this.raycaster.setFromCamera(this.mouse, this.camera);
            this.raycaster.params.Points.threshold = 0.01;  // Adjust as needed
            const intersects = this.raycaster.intersectObjects([this.particles]);
            const attributes = this.particles.geometry.attributes;
            console.log(attributes)
            // console.log("intersects", intersects)
            if ( intersects.length > 0 ) {
              // console.log("intersects", intersects)
              console.log("got")
              if ( this.INTERSECTED != intersects[ 0 ].index ) {
                attributes.size.needsUpdate = true;
                console.log("attributes", attributes)
                if(this.INTERSECTED !== null){
                  attributes.size.array[ this.INTERSECTED ] = this.PARTICLE_SIZE;
                  attributes.customColor.array[this.INTERSECTED * 3] = 1;
                  attributes.customColor.array[this.INTERSECTED * 3 + 1] = 1;
                  attributes.customColor.array[this.INTERSECTED * 3 + 2] = 1;
                  attributes.customColor.needsUpdate = true;
                }
                

                this.INTERSECTED = intersects[ 0 ].index;

                attributes.size.array[ this.INTERSECTED ] = this.PARTICLE_SIZE * 3;
                attributes.customColor.array[this.INTERSECTED * 3] = 1;
                attributes.customColor.array[this.INTERSECTED * 3 + 1] = 0;
                attributes.customColor.array[this.INTERSECTED * 3 + 2] = 0;
                attributes.customColor.needsUpdate = true;
                attributes.size.needsUpdate = true;
                const position = intersects[0].point; // This will give the exact intersection point.
                this.$emit('particleSelected', position);
                console.log(position)
              }

            } 
            // else if ( this.INTERSECTED !== null ) {
            //   // attributes.size.needsUpdate = true;
            //   // attributes.size.array[ this.INTERSECTED ] = this.PARTICLE_SIZE;
            //   // attributes.size.needsUpdate = true;
            //   // this.INTERSECTED = null;
            // }
            // if (intersects.length > 0 ) {
            //     console.log("intersects", intersects)
            //     if( intersects[0].object instanceof THREE.Sprite){
            //         console.log("got if")
            //         if (this.selectedSprite) {
            //             this.selectedSprite.material.color.set('gray');
            //             this.selectedSprite.material.needsUpdate = true;
            //         }

            //         this.selectedSprite = intersects[0].object;
            //         this.selectedSprite.material.color.set('red');
            //         this.selectedSprite.material.needsUpdate = true;
            //         this.$emit('pointSelected', this.selectedSprite.position);
            //         console.log(this.selectedSprite.position)
            //     }
            // }
            
            

          

        },
        
        onMouseClick(event) {
            console.log("onMouseClick")
            let rect = this.$refs.ThreeModel.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // this.mouse.x = (event.clientX / this.$refs.renderer.clientWidth) * 2 - 1;
            // this.mouse.y = - (event.clientY / this.$refs.renderer.clientHeight) * 2 + 1;
            console.log("x", this.mouse.x)
            console.log("y", this.mouse.y)

            
            this.handleRaycast();
        },
        // createCircleTexture(color, radius) {
        //     const canvas = document.createElement('canvas');
        //     canvas.width = radius * 2;
        //     canvas.height = radius * 2;
        //     const context = canvas.getContext('2d');
        //     context.beginPath();
        //     context.arc(radius, radius, radius, 0, 2 * Math.PI, false);
        //     context.fillStyle = color;
        //     context.fill();
        //     return new THREE.CanvasTexture(canvas);
        // },
        createParticlesFromGeometry(ObjGeometry){
          const positionAttribute = ObjGeometry.getAttribute('position');
          const colors = [];
          const sizes = [];

          const color = new THREE.Color();

          for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {

            color.setHSL( 0.01 + 0.1, 1.0, 0.5 );
            color.toArray( colors, i * 3 );

            sizes[ i ] = this.PARTICLE_SIZE;

          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute( 'position', positionAttribute );
          geometry.setAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
          geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) );

          //
          console.log(this.vertexShader)
          const material = new THREE.ShaderMaterial( {

            uniforms: {
              color: { value: new THREE.Color( 0xffffff ) },
              pointTexture: { value: new THREE.TextureLoader().load( 'disc.png' ) },
              alphaTest: { value: 0.9 }
            },
            // vertexShader: document.getElementById( 'vertexshader' ).textContent,
            // fragmentShader: document.getElementById( 'fragmentshader' ).textContent
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
          } );
          // console.log(material.vertexShader);
          // console.log(material.fragmentShader);
          //

          this.particles = markRaw(new THREE.Points( geometry, material ));
          this.scene.add( this.particles );

        },
      loadObj() {
        const loader = new OBJLoader();
        loader.load(
            this.objPath,
            (object) => {
                const objGeometry = object.children[0].geometry;
                this.createParticlesFromGeometry(objGeometry)
                // console.log(object)
                // object.traverse(child => {
                //     if (child instanceof THREE.Mesh) {
                //         const positions = child.geometry.attributes.position.array;
                //         for (let i = 0; i < positions.length; i += 3) {
                //             this.vertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
                //         }
                //     }
                // });
                
                this.scene.add(object);
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize(new THREE.Vector3()).length();
                const center = box.getCenter(new THREE.Vector3());

                this.camera.position.copy(center);
                this.camera.position.x += size / 2.0;  // Adjust this value as needed
                this.camera.position.y += size / 2.0;  // Adjust this value as needed
                this.camera.position.z += size / 2.0;  // Adjust this value as needed
                this.camera.lookAt(center);
                this.controls.target.copy(center);
                this.controls.update();
            },
            (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
            console.error('An error happened', error);
            }
        );
        },
      animate() {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
      },
      onWindowResize() {
            const width = this.$refs.ThreeModel.clientWidth;
            const height = this.$refs.ThreeModel.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    },
    watch:{
      objPath(newVal, oldVal) {
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
          const obj = this.scene.children[i];
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Group) { // Adjust this if you have other object types
            this.scene.remove(obj);
          }
        }

        // Load the new model
        this.loadObj();
      }
    },
    beforeDestroy() {
        this.$refs.ThreeModel.removeEventListener('click', this.onMouseClick);
        window.removeEventListener('resize', this.onWindowResize);
    },
    

  }
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  