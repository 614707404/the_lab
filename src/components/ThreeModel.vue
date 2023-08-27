<template>
    <div ref="renderer" style="width: 100%; height: 100%;"></div>
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
        renderer: markRaw(new THREE.WebGLRenderer({ antialias: true })),
        controls : null
      };
    },
    mounted() {
      this.initScene();
      this.loadObj();
      this.animate();
      this.onWindowResize(); 
    },
    methods: {
        initScene() {
            const width = this.$refs.renderer.clientWidth;
            const height = this.$refs.renderer.clientHeight;

            this.renderer.setSize(width, height);
            this.$refs.renderer.appendChild(this.renderer.domElement);
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.camera.position.z = 5;
            this.controls = markRaw(new OrbitControls(this.camera, this.renderer.domElement))

            var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
            this.scene.add( ambientLight );

            var pointLight = new THREE.PointLight( 0xffffff, 0.8 );

            this.camera.add( pointLight );
            this.scene.add( this.camera );

            

            // Handle window resize
            window.addEventListener('resize', this.onWindowResize);
        },
      loadObj() {
        const loader = new OBJLoader();
        loader.load(
            this.objPath,
            (object) => {
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
            const width = this.$refs.renderer.clientWidth;
            const height = this.$refs.renderer.clientHeight;
            
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
      window.removeEventListener('resize', this.onWindowResize);
    },
    

  }
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  