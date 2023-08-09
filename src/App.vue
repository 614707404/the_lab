<template>
<div class="show-container">
    <nav class="navbar navbar-dark bg-dark">
        <a class="navbar-brand" href="#">
            Welcome to P2M Lab, have fun!
        </a>
    </nav>
    <div class="main">
        <!-- b-modal是一种弹出窗口 -->
        <!-- <b-modal
            ref="initModal"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            centered header-bg-variant="dark"
            header-text-variant="light"
            header-border-variant="dark"
            body-bg-variant="dark"
            footer-bg-variant="dark"
            footer-border-variant="dark"
            body-text-variant="light"
            footer-class="modal-footer-center"
            >
            <template #modal-header>
                <h1 class="logo text-center w-100">
                    <img class="d-inline-block align-top" src="/logo.svg" height="50">
                    IFeaLiD
                </h1>
            </template>
            <p>
                 Interactive Feature Localization in Deep neural networks (IFeaLiD) is a web application that allows you to visualize and explore deep neural network layers or any hyperspectral image interactively in the browser. <a href="https://www.frontiersin.org/articles/10.3389/frai.2020.00049">Read the paper</a>.
            </p>
            <p>
                Code and information on how to generate a dataset ZIP file can be found at <a href="https://github.com/BiodataMiningGroup/IFeaLiD">GitHub</a>.
            </p>
            <p class="mb-0">
                Select a dataset ZIP file to start the application.
            </p>
            <div v-if="error" class="alert alert-danger mt-4 mb-0" v-text="errorMessage"></div>
            <template #modal-footer>
                <div v-if="loading" class="spinner-border text-light" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <button v-else class="btn btn-primary btn-lg" @click="selectFile">
                    Select ZIP file
                </button>
            </template>
        </b-modal> -->
        <div class="main-content">
            <div class="top-section">
                <div class="top-bar">
                    <ControlBar :iteration-count=iterationCount></ControlBar>
                </div>
            </div>
            <div class="bottom-section">
                <div class="left-section">
                    <ModelOverview id="model-overview"></ModelOverview>
                </div>
                <div class="middle-section">
                    <div id="feature-visual"></div>
                    <div id="modle-visual"></div>
                    <!-- <Visualization
                        ref="visualization"
                        v-bind:dataset="dataset"
                        v-on:hover="updateHoverPixelVector"
                        v-on:select="updateSelectPixelVector"
                        :key="renderKey"
                    ></Visualization> -->
                </div>  
                <div class="right-section">
                    <!-- <button class="btn btn-primary" @click="showInitModal">Start Application</button> -->
                    <!-- <LineChart :data="chartData"></LineChart> -->
                </div>
            </div>
            
        </div>
        <!-- <div class="main-aside">
            <PixelVectorDisplay
                ref="pixelVectorDisplay"
                v-bind:dataset="dataset"
                v-on:hover="updateHoveredFeature"
            ></PixelVectorDisplay>
        </div> -->
    </div>
    <input type="file" name="file" accept="application/zip" ref="fileInput" @change="selectedFile" style="display: none;">
</div>
</template>

<script>
import WebglHandler from './webgl/Handler';
import Visualization from './components/Visualization.vue';
import ControlBar from './components/ControlBar.vue';
import ModelOverview from './components/ModelOverview.vue';
import PixelVectorDisplay from './components/PixelVectorDisplay.vue';
import {ZipReader, BlobReader, TextWriter} from "@zip.js/zip.js";
import { BModal } from 'bootstrap-vue';
import LineChart from './components/LineChart.vue';
const DATASET_KEYS = [
    'precision',
    'name',
    'height',
    'width',
    'features',
];

const NUMERIC_FIELDS = [
    'precision',
    'height',
    'width',
    'features',
];

const PRECISION_STEPS = [32, 16, 8];

export default {
    components: {
        ControlBar,
        ModelOverview,
        Visualization,
        PixelVectorDisplay,
        BModal,
        LineChart
    },
    data() {
        return {
            iterationCount :"0",
            dataset: {},
            initialized: false,
            loading: false,
            error: null,
            renderKey: 0,
            chartData : [
                
            ],
            socket: null
        };
    },
    computed: {
        errorMessage() {
            if (this.error) {
                return this.error.message ? this.error.message : this.error;
            }

            return '';
        },
    },
    methods: {
        showInitModal() {
            this.dataset = {},
            this.initialized = false,
            this.loading = false,
            this.error = null,
            this.renderKey++;
            this.$refs.initModal.show();
        },
        updateHoverPixelVector(vector) {
            // Use a method instead of prop because the pixel vector array stays the
            // same object.
            // this.$refs.pixelVectorDisplay.updatePixelVector(vector);
        },
        updateSelectPixelVector(vector) {
            // Use a method instead of prop because the pixel vector array stays the
            // same object.
            this.$refs.pixelVectorDisplay.updateReferencePixelVector(vector);
        },
        updateHoveredFeature(feature) {
            this.$refs.visualization.showFeature(feature);
        },
        selectFile() {
            this.$refs.fileInput.click();
        },
        selectedFile(e) {
            this.loading = true;
            this.loadDataset(e.target.files[0]);
        },
        verifyDataset(dataset) {
            DATASET_KEYS.forEach(function (key) {
                if (dataset[key] === undefined) {
                    throw Error(`The metadata.json is missing the ${key} field.`);
                }
            });

            NUMERIC_FIELDS.forEach(function (key) {
                if (!Number.isInteger(dataset[key])) {
                    throw Error(`The the ${key} field is not an integer.`);
                }

                if (dataset[key] <= 0) {
                    throw Error(`The the ${key} field must be greater than 0.`);
                }
            });

            if (!PRECISION_STEPS.includes(dataset.precision)) {
                throw Error(`The the precision must be 32, 16 or 8.`);
            }

            let fileMultiplier = dataset.precision / 32;
            let expectedFiles = Math.ceil(dataset.features * fileMultiplier);
            let foundFiles = Object.keys(dataset.entries).length;
            if (foundFiles !== expectedFiles) {
                throw new Error(`Wrong number of feature files. Found ${foundFiles} but expected ${expectedFiles}.`);
            }

            if (dataset.overlay && !dataset.overlayEntry) {
                throw new Error('The overlay.jog file is missing.');
            }

            for (let i = expectedFiles - 1; i >= 0; i--) {
                if (!dataset.entries[`${i}.png`]) {
                    throw new Error(`The feature file ${i}.png is missing.`);
                }
            }
        },
        async loadDataset(blobOrFile) {
            try {
                let reader = new ZipReader(new BlobReader(blobOrFile));
                let entries = await reader.getEntries();
                let entryMap = {};
                entries.forEach(e => entryMap[e.filename] = e);

                let metaEntry = entryMap['metadata.json'];
                if (!metaEntry) {
                    throw new Error('The metadata.json file is missing.');
                }
                delete entryMap['metadata.json'];
                let meta = await metaEntry.getData(new TextWriter());
                let dataset = JSON.parse(meta);

                if (dataset.overlay && entryMap['overlay.jpg']) {
                    dataset.overlayEntry = entryMap['overlay.jpg'];
                    delete entryMap['overlay.jpg'];
                }

                dataset.entries = entryMap;
                this.verifyDataset(dataset);

                this.dataset = dataset;
                this.initialized = true;
            } catch (e) {
                this.error = e;
                return;
            } finally {
                this.loading = false;
            }

            this.$refs.initModal.hide();
        },
    },
    mounted() {
        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.onmessage = event => {
            console.log(event)
            let parsedData = JSON.parse(event.data);
            console.log(parsedData)
            this.iterationCount = parsedData.message
            this.chartData.push({x: parseInt(parsedData.message), y: parsedData.number1 })
            console.log('Received message from server: ' + event.data);
            // 在这里你可以根据收到的消息更新你的组件的状态或触发其他方法
        };

        this.socket.onclose = event => {
            console.log('WebSocket connection closed');
        };

        this.socket.onerror = error => {
            console.error('WebSocket error: ' + error);
        };
        // this.$refs.initModal.show();
        let dataset = new URLSearchParams(window.location.search).get('d');
        if (dataset) {
            this.loading = true;
            fetch(`datasets/${dataset}`)
                .then(response => response.blob())
                .then(this.loadDataset)
        }
    }, beforeDestroy: function() {
        if (this.socket) {
            this.socket.close();
        }
    }
}
</script>

<style lang="scss">
.show-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;

    .navbar {
        border-bottom: 1px solid $gray-900;
    }
    // .main {
    //     display: flex;
    //     flex: 1;
    //     overflow: hidden;
    //     position: relative;
    // }

    // .main-content {
    //     width: 100%;
    //     height: 100%;
    //     position: relative;
    //     flex: 1;
    //     background-image: url('/noise.png');
    //     display: flex;
    //     flex-direction: column;
    //     .top-section {
    //         flex: 150px;
    //         background-color: aquamarine;
    //     }
    //     .bottom-section {
    //         height: calc(100vh - 150px);
    //         display: flex;
    //         flex-direction: row;
    //         .left-section {
    //             width: 1000px;
    //             border-right: 1px solid $gray-900;
    //             background-color: aqua;
    //         }
    //         .middle-section{
    //             width: 300px;
    //             background-color: beige;
    //         }
    //         .right-section{
    //             width: 100px;
    //             background-color: azure;
    //         }
    //     }
    // }

    .main-content{
        display: flex;
        flex-direction: column;
        height: 100vh;
        .top-section {
             height: 120px;
    // position: relative; /* 设置为 relative 以便内部的 top-bar 可以使用 absolute 定位 */
    // overflow-x: auto; /* 当内容宽度超过容器宽度时显示滚动条 */
    
            // height: 150px;
            // // width: 1600px; /* 设置固定宽度 */
            // // margin: 0 auto; 
            // display: flex;
            // justify-content: center; /* 使内部内容水平居中 */
            // align-items: center; /* 使内部内容垂直居中 */
            background-color: #a09797; /* 只是为了可视化，你可以根据需要修改 */
            .top-bar{
                margin: 0 auto; 
                width: 1600px; /* 例如：300px; 请根据需要设置 */
                height: 100%; /* 例如：100px; 请根据需要设置 */
                background-color: #300da4; /* 只是为了可视化，你可以根据需要修改，例如：#b0b0b0; */
            }
        }
        .bottom-section {
            flex: 1; /* 占据剩余的空间 */
            width: 1600px; /* 设置固定宽度 */
            margin: 0 auto; /* 使其在大屏幕上居中 */
            overflow-x: auto; /* 当内容宽度超过容器宽度时显示滚动条 */
            display: flex;
            justify-content: center; /* 使内部内容水平居中 */
            align-items: center; /* 使内部内容垂直居中 */
            background-color: #d0d0d0; /* 只是为了可视化，你可以根据需要修改 */
            .left-section {
                width: 940px;
                height: 100%;
                background-color: #c0c0c0; /* 只是为了可视化，你可以根据需要修改 */
                overflow: hidden; /* 如果组件超出容器，则隐藏其余部分 */
                position: relative;
                #model-overview{
                    transform-origin: top left; /* 设置缩放的基点 */
                    transform: scale(0.79); /* 设置缩放比例，例如 0.5 会将其缩小到50% */
                    position: absolute; /* 使其脱离正常文档流 */
                    top: 0;
                    left: 0;
                }
            }

            .middle-section {
                width: 360px;
                height: 100%;
                background-color: #a42424; /* 只是为了可视化，你可以根据需要修改 */
                position: relative;
                #feature-visual{
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    
                    top: 30px;
                    left: 30px;
                    background-color: #300da4;
                }
                #modle-visual{
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    top: 360px;
                    left: 30px;
                    background-color: #6d4cda;
                }
            }

            .right-section {
                width: 300px;
                height: 100%;
                background-color: #a0a0a0; /* 只是为了可视化，你可以根据需要修改 */
            }
        }
        
    }

    .main-aside {
        height: 100%;
        width: 200px;
        border-left: 1px solid $gray-900;
        position: relative;
        overflow: hidden;
        padding: 10px 0;
        box-sizing: border-box;
    }
    
}

.modal-footer-center {
    justify-content: center;
}
</style>
