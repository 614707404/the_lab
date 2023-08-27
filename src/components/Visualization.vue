<template>
<div class="visualization" ref="map">
    <!-- 加载界面 -->
    <div v-if="!ready" class="loading-overlay">
        <div v-if="error" class="alert alert-danger" v-text="errorMessage"></div>
        <LoadingIndicator v-else :size="120" :progress="loaded"></LoadingIndicator>
    </div>
    <!-- 可交互的颜色比例尺 -->
    <!-- 热力图的常备要素，相比于静态的比例尺，更适合可交互的场景 -->
    <!-- <ColorScale v-show="ready" ref="colorScale"></ColorScale> -->
</div>
</template>

<script>
import CanvasSource from '../ol/source/Canvas';
import CircleStyle from 'ol/style/Circle';
import ColorButton from '../ol/control/ColorButton';
import ColorMapProgram from '../webgl/programs/ColorMap';
import ColorScale from './ColorScale.vue';
import Feature from 'ol/Feature';
import FillStyle from 'ol/style/Fill';
import ImageHandler from '../ImageHandler';
import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/ImageStatic';
import LoadingIndicator from './LoadingIndicator.vue';
import OpacitySlider from '../ol/control/OpacitySlider';
import PixelVectorProgram from '../webgl/programs/PixelVector';
import Point from 'ol/geom/Point';
import Projection from 'ol/proj/Projection';
import SimilarityProgram from '../webgl/programs/Similarity';
import SingleFeatureProgram from '../webgl/programs/SingleFeature';
import StretchIntensityProgram from '../webgl/programs/StretchIntensity';
import Style from 'ol/style/Style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import WebglHandler from '../webgl/Handler';
import {BlobWriter} from "@zip.js/zip.js";
import {containsCoordinate} from 'ol/extent';
import {Map, View} from 'ol';
import {defaults as defaultControls} from 'ol/control';

export default {
    props: {
        dataset: {
            required: true,
            type: Object,
        },
        dimensions: {
            required: true,  // 如果这个props是必需的
            type: Object,    // 根据你的需要设置类型，这里我设为Object
        },
    },
    components: {
        LoadingIndicator,
        ColorScale,
    },
    data () {
        return {
            loaded: 0,
            ready: false,
            initialAlphaScaling: 0.1,
            error: null,
            overlayGrayscale: true,
        };
    },
    computed: {
        extent() {
            return [0, 0, this.dataset.width, this.dataset.height];
        },
        hasOverlay() {
            return this.dataset.overlay;
        },
        errorMessage() {
            if (this.error) {
                return this.error.message ? this.error.message : this.error;
            }

            return '';
        },
    },
    methods: {
        // 异步加载图片，同时更新加载进度
        fetchImages() {
            let imageHandler = new ImageHandler(this.dataset);
            let parallel = 3;
            let tilesLoaded = 0;

            let promises = imageHandler.load(parallel).map((promise) => {
                return promise.then((args) => {
                        this.handler.storeTile(...args);
                    })
                    .then(() => {
                        // 更新加载的进度
                        tilesLoaded += 1
                        this.loaded = tilesLoaded / promises.length;
                    });
            });

            return Promise.all(promises);
        },
        initializeCanvas() {
            let canvas = document.createElement('canvas');
            canvas.width = this.dataset.width;
            canvas.height = this.dataset.height;

            return canvas;
        },
        initializeWebgl(canvas) {
            this.handler = new WebglHandler({
                canvas: canvas,
                width: this.dataset.width,
                height: this.dataset.height,
                depth: this.dataset.features,
                precision: this.dataset.precision,
                // Reserve units for the similarity, stretch intensity, color map and pixel vector textures.
                reservedUnits: 4,
            });

            window.addEventListener('beforeunload', this.handler.destruct.bind(this.handler));
        },
        async initializeOpenLayers(canvas) {
            let projection = new Projection({
                code: 'image',
                units: 'pixels',
                extent: this.extent,
            });

            this.canvasSource = new CanvasSource({
                canvas: canvas,
                projection: projection,
                imageExtent: this.extent,
            });

            this.imageLayer = new ImageLayer({
                source: this.canvasSource,
                extent: this.extent,
            });

            this.imageLayer.on('prerender', function (event) {
                event.context.imageSmoothingEnabled = false;
            });

            this.imageLayer.on('postrender', function (event) {
                event.context.imageSmoothingEnabled = true;
            });

            this.markerFeature = new Feature(new Point([0, 0]));
            this.markerLayer = new VectorLayer({
                visible: false,
                source: new VectorSource({features: [this.markerFeature]}),
                style: [
                    new Style({
                        image: new CircleStyle({
                            radius: 7,
                            fill: new FillStyle({color: 'white'}),
                        }),
                    }),
                    new Style({
                        image: new CircleStyle({
                            radius: 4,
                            fill: new FillStyle({color: '#fc6600'}),
                        }),
                    }),
                ],
            });

            this.map = new Map({
                target: this.$refs.map,
                layers: [this.imageLayer, this.markerLayer],
                view: new View({
                    projection: projection,
                }),
                controls: defaultControls({zoom: false}),
                interactions:[]
            });


            if (this.hasOverlay) {
                let slider = new OpacitySlider({
                    opacity: 1 - this.initialAlphaScaling,
                });
                slider.on('change:opacity', this.updateAlphaScaling);
                // this.map.addControl(slider);

                let button = new ColorButton();
                button.on('showcolor', () => {
                    this.overlayGrayscale = false;
                });
                button.on('showgrayscale', () => {
                    this.overlayGrayscale = true;
                });
                // this.map.addControl(button);

                let overlayData = await this.dataset.overlayEntry.getData(new BlobWriter());

                this.overlayLayer = new ImageLayer({
                    source: new ImageSource({
                        url: URL.createObjectURL(overlayData),
                        projection: projection,
                        imageExtent: this.extent,
                    }),
                    extent: this.extent,
                    visible: false,
                });

                this.overlayLayer.on('prerender', (event) => {
                    event.context.imageSmoothingEnabled = false;
                    if (this.overlayGrayscale) {
                        event.context.filter = 'grayscale(100%)';
                    }
                });

                this.overlayLayer.on('postrender', function (event) {
                    event.context.imageSmoothingEnabled = true;
                    event.context.filter = 'none';
                });

                this.map.getLayers().insertAt(0, this.overlayLayer);
            }

            this.map.getView().fit(this.extent, {
                padding: [10, 10, 10, 10],
            });
        },
        initializePrograms() {
            this.similarityProgram = new SimilarityProgram(this.dataset);
            this.stretchIntensityProgram = new StretchIntensityProgram(this.dataset);
            this.colorMapProgram = new ColorMapProgram();
            if (this.hasOverlay) {
                this.colorMapProgram.setAlphaScaling(this.initialAlphaScaling);
            }
            this.pixelVectorProgram = new PixelVectorProgram(this.dataset);
            this.singleFeatureProgram = new SingleFeatureProgram(this.dataset);

            this.handler.addProgram(this.similarityProgram);
            this.handler.addProgram(this.stretchIntensityProgram);
            this.handler.addProgram(this.colorMapProgram);
            this.handler.addProgram(this.pixelVectorProgram);
            this.handler.addProgram(this.singleFeatureProgram);

            this.stretchIntensityProgram.link(this.similarityProgram);
            this.colorMapProgram.link(this.stretchIntensityProgram);
        },
        renderSimilarity() {
            // 调用render函数，输入的参数是三个函数对象
            this.handler.render([
                    this.similarityProgram,
                    this.stretchIntensityProgram,
                    this.colorMapProgram,
                ])
                .then(this.map.render.bind(this.map))
                .then(this.updateSimilarityColorScale);
        },
        renderPixelVector() {
            return this.handler.render([this.pixelVectorProgram]);
        },
        renderSingleFeature() {
            this.handler.render([
                    this.singleFeatureProgram,
                    this.stretchIntensityProgram,
                    this.colorMapProgram,
                ])
                .then(this.map.render.bind(this.map))
                .then(this.updateFeatureColorScale);
        },
        emitHover() {
            this.$emit('hover', this.pixelVectorProgram.getPixelVector());
        },
        emitSelect() {
            // this.$emit('select', this.pixelVectorProgram.getPixelVector().slice());
        },
        emitUnselect() {
            this.$emit('select', []);
        },
        updateFeatureColorScale() {
            this.$refs.colorScale.updateStretching(this.singleFeatureProgram.getIntensityStats());
        },
        updateSimilarityColorScale() {
            // this.$refs.colorScale.updateStretching(this.similarityProgram.getIntensityStats());
        },
        // 鼠标移动事件
        updateMousePosition(event) {
            if (containsCoordinate(this.extent, event.coordinate)) {
                console.log("event.coordinate", event.coordinate)
                let oldPosition = this.similarityProgram.getMousePosition();
                let newPosition = event.coordinate.map(Math.floor);
                this.similarityProgram.setMousePosition(newPosition);
                this.pixelVectorProgram.setMousePosition(newPosition);
                // 如果鼠标移动了，就重新渲染
                if (oldPosition[0] !== newPosition[0] || oldPosition[1] !== newPosition[1]) {
                    // 相似度渲染
                    this.renderSimilarity();
                    // 暂时不需要这个功能
                    this.renderPixelVector().then(this.emitHover);
                }
            }
        },
        updateDimensions() {
            
            let oldPosition = this.similarityProgram.getMousePosition();
            let newPosition = [Math.floor(this.dimensions.height), Math.floor(this.dimensions.width)];
            this.markerLayer.setVisible(true);
            this.markerFeature.getGeometry().setCoordinates(newPosition);
            this.similarityProgram.setMousePosition(newPosition);
            this.pixelVectorProgram.setMousePosition(newPosition);
                // 如果鼠标移动了，就重新渲染
            if (oldPosition[0] !== newPosition[0] || oldPosition[1] !== newPosition[1]) {
                // 相似度渲染
                this.renderSimilarity();
                // 暂时不需要这个功能
                this.renderPixelVector().then(this.emitHover);
            }
        },
        // 点击事件 暂时不需要这个功能
        updateMarkerPosition(event) {
            if (containsCoordinate(this.extent, event.coordinate)) {
                console.log("event.coordinate", event.coordinate)
                // if (this.map.hasFeatureAtPixel(event.pixel)) {
                //     this.markerLayer.setVisible(false);
                //     this.emitUnselect();
                // } else {
                //     this.markerLayer.setVisible(true);
                //     this.markerFeature.getGeometry().setCoordinates(event.coordinate);
                //     let oldPosition = this.pixelVectorProgram.getMousePosition();
                //     let newPosition = event.coordinate.map(Math.floor);
                //     this.pixelVectorProgram.setMousePosition(newPosition);
                //     if (oldPosition[0] !== newPosition[0] || oldPosition[1] !== newPosition[1]) {
                //         this.renderPixelVector().then(this.emitSelect);
                //     }
                // }
            }
        },
        setReady() {
            this.ready = true;
        },
        showFeature(index) {
            if (this.ready) {
                if (index === null) {
                    this.stretchIntensityProgram.link(this.similarityProgram);
                    this.renderSimilarity();
                } else {
                    this.singleFeatureProgram.setFeatureIndex(index);
                    this.stretchIntensityProgram.link(this.singleFeatureProgram);
                    this.renderSingleFeature();
                }
            }
        },
        updateAlphaScaling(event) {
            const alphaScaling = 1 - event.target.get('opacity');
            this.colorMapProgram.setAlphaScaling(alphaScaling);
            this.renderSimilarity();
        },
        initDataset() {
            try {
                let canvas = this.initializeCanvas(); // 根据dataset的宽高初始化相应尺寸的canvas
                this.initializeOpenLayers(canvas); // 初始化OpenLayers
                this.initializeWebgl(canvas); // 初始化webgl渲染环境
                this.initializePrograms();
                // 异步代码
                this.fetchImages()
                    .then(this.renderSimilarity)
                    .then(this.setReady)
                    .then(() => {
                        if (this.overlayLayer) {
                            this.overlayLayer.setVisible(true);
                        }
                        // 鼠标移动监听
                        this.map.on('pointermove', this.updateMousePosition);
                        // 点击监听
                        // 暂时不需要这个功能
                        this.map.on('click', this.updateMarkerPosition);
                    })
                    .catch((e) => {
                        this.error = new Error(`The dataset could not be loaded. ${e.message}`);
                        console.error(e);  // Log the error to the console
                    });
                console.log('Initialized new WebGL programs and loaded new data');
            } catch (e) {
                this.error = new Error(`The dataset could not be loaded. ${e.message}`);
            }
        },
    },
    watch: {
        overlayGrayscale() {
            this.map.render();
        },
        dataset(dataset) {
            if (dataset && Object.keys(dataset).length > 0) {
                this.initDataset();
            }
        },
        dimensions(newVal, oldVal) {
            // 当dataset变化时，这里的代码会被执行
            console.log('dimensions has changed!');
            console.log("h", this.dimensions.height)
            console.log("w", this.dimensions.width)
            this.updateDimensions()
        }
    },
    mounted() {
        //
    },
    beforeDestroy(){
        
    }
};
</script>

<style lang="scss" scoped>
.visualization {
    width: 100%;
    height: 100%;
    position: relative;
    
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
    }

    .color-scale {
        position: absolute;
        top: 1em;
        right: 1em;
        z-index: 1;
    }
}


</style>
