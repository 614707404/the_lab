require('./bootstrap');
import {mount} from './utils';
import WebglHandler from './webgl/Handler';
import visualization from './components/visualization';
import pixelVectorDisplay from './components/pixelVectorDisplay';

mount('show-container', new Vue({
    data: {
        dataset: window.DATASET,
    },
    components: {
        visualization, visualization,
        pixelVectorDisplay: pixelVectorDisplay,
    },
    methods: {
        updatePixelVector(vector) {
            // Use a method instead of prop because the pixel vector array stays the
            // same object.
            this.$refs.pixelVectorDisplay.updatePixelVector(vector);
        },
    },
    created() {
        //
    },
    mounted() {
        //
    },
}));
