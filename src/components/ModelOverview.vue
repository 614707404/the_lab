<template>
    <div class="modeloverview">
    <!-- <div id="cav"> -->
        <div id="inputimg">
            <img src="input.png" style="height: 100%; width: 100%;" :key="renderKey"/>
        </div>
         
        <div id="feature1" class="feature" @click="featureClick_1"></div>
        <div id="feature2" class="feature" @click="featureClick_2"></div>
        <div id="feature3" class="feature" @click="featureClick_3"></div>

        <div id="initmodel">
            <img  src="orig.png" style="height: 100%; width: 100%;"/>
        </div>
        
        <div id="model1" class="model" @click="modelClick_1">
            <ThreeModel :objPath="'predict1.obj'" :key="renderKey"></ThreeModel>
        </div>
        <div id="model2" class="model" @click="modelClick_2">
            <ThreeModel :objPath="'predict2.obj'" :key="renderKey"></ThreeModel>
        </div>
        <div id="model3" class="model" @click="modelClick_3">
            <ThreeModel :objPath="'predict3.obj'" :key="renderKey"></ThreeModel>
        </div>

        <div id="gradient"></div>

        <svg ref="svg" style="height: 100%; width: 100%;"></svg>
        <div id="CNN-config" class="config-item" v-show="editVisiable">
            <label>CNN:</label>
            <b-form-select v-model="CNN" :options="CNN_options" id="CNN-select"></b-form-select>
        </div>
        <div id="hidden-config" class="config-item" v-show="editVisiable">
            <div id="Hidden-spin">
                <b-form-spinbutton v-model="value" min="0" max="10" ></b-form-spinbutton>
            </div>
            <label>hidden layer(s)</label>
        </div>
        <div id="lossing-config" class="config-item" v-show="editVisiable">
            <label>Loss = </label>
            <b-form-spinbutton v-model="value" min="0" max="10" class="spin-item"></b-form-spinbutton>
            <label>Chamfer loss + </label>
            <b-form-spinbutton v-model="value" min="0" max="10" class="spin-item"></b-form-spinbutton>
            <label>Normal loss + </label>
            <b-form-spinbutton v-model="value" min="0" max="10" class="spin-item"></b-form-spinbutton>
            <label>Regularization</label>
        </div>
        <div id="Init-config" class="config-item" v-show="editVisiable">
            <label>Initial Model:</label>
            <b-form-select v-model="Model" :options="Model_options" id="Model-select"></b-form-select>
        </div>
        <div id="unpooling-config" class="config-item" v-show="editVisiable">
            <label>unpooling:</label>
            <b-form-select v-model="unpooling" :options="unpooling_options" id="unpooling-item"></b-form-select>
        </div>
        <div id="l_rate-config" class="config-item" v-show="editVisiable">
            <label>Learing rate:</label>
            <b-form-select v-model="l_rate" :options="l_rate_options" id="l_rate-item"></b-form-select>
        </div>
        <div id="optimizer-config" class="config-item" v-show="editVisiable">
            <label>Optimizer:</label>
            <b-form-select v-model="optimizer" :options="optimizer_options" id="optimizer-item"></b-form-select>
        </div>
    <!-- </div> -->
    </div>
</template>
    
<script>    
    import * as d3 from 'd3'
    import { BFormSelect } from 'bootstrap-vue'
    import { BFormSpinbutton } from 'bootstrap-vue'
    import ThreeModel from './ThreeModel.vue';

    export default {
        props: {
            editVisiable: false,
            img_feat_data: {}
        },
        components: {
            BFormSelect,
            BFormSpinbutton,
            ThreeModel
        },
        data () {
            return {
                renderKey: 0,
                value: 5,
                CNN: 'VGG',
                CNN_options: [
                    { value: 'VGG', text: 'VGG' },
                    { value: 'ResNet', text: 'ResNet' },
                ],
                Model: 'Ellipse',
                Model_options: [
                    { value: 'Ellipse', text: 'Ellipse' },
                    { value: 'Voxel', text: 'Voxel' },
                ],
                unpooling: 'Edge',
                unpooling_options: [
                    { value: 'Edge', text: 'Edge' },
                    { value: 'Face', text: 'Face' },
                ],
                l_rate: 'Edge',
                l_rate_options: [
                    { value: 'Edge', text: 'Edge' },
                    { value: 'Face', text: 'Face' },
                ],
                optimizer: 'Edge',
                optimizer_options: [
                    { value: 'Edge', text: 'Edge' },
                    { value: 'Face', text: 'Face' },
                ],
                // imgPath: 'input.png',
                paths:[],
                feature_1_flag : true,
                feature_2_flag : true,
                feature_3_flag : true,
                model_1_flag : true,
                model_2_flag : true,
                model_3_flag : true,
            };
        },
        computed: {
            
        },
        methods: {
            // imgPathWithCounter() {
            //     // 通过添加查询参数来更改图片的URL，这样浏览器就会重新加载图片
            //     return this.imgPath;
            // },
            featureClick_1(){
                this.$emit('change_path', { str1: 'feature', str2: 'C5.8.zip' });
                if(this.feature_1_flag){
                    for(let i = 0; i < this.paths.length; i++){
                        if(i == 0 || i == 4 || i == 3 || i == 5 || i == 6 || i == 9 || i == 12 || i == 15 || i == 16){
                            this.paths[i]
                                .attr('stroke', 'blue')  // 改变颜色
                                .attr('stroke-width', 5); 
                        }else{
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        }
                    }
                   
                    this.feature_1_flag = false
                }else{
                    for(let i = 0; i < this.paths.length; i++){
                        
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        
                    }
                    this.model_1_flag = true
                    this.model_2_flag = true
                    this.model_3_flag = true
                    this.feature_1_flag = true
                    this.feature_2_flag = true
                    this.feature_3_flag = true
                }    
                
            },
            featureClick_2(){
                this.$emit('change_path', { str1: 'feature', str2: 'C1.8.zip' });
                if(this.feature_2_flag){
                    for(let i = 0; i < this.paths.length; i++){
                        if(i == 0 || i == 4|| i == 1 || i == 3 || i == 5 || i == 7 || i == 10 || i == 13 || i == 15 || i == 16){
                            this.paths[i]
                                .attr('stroke', 'blue')  // 改变颜色
                                .attr('stroke-width', 5); 
                        }else{
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        }
                    }
                   
                    this.feature_2_flag = false
                }else{
                    for(let i = 0; i < this.paths.length; i++){
        
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        
                    }
                    this.model_1_flag = true
                    this.model_2_flag = true
                    this.model_3_flag = true
                    this.feature_1_flag = true
                    this.feature_2_flag = true
                    this.feature_3_flag = true
                }  
                
            },
            featureClick_3(){
                this.$emit('change_path', { str1: 'feature', str2: 'C2.8.zip' });
                if(this.feature_3_flag){
                    for(let i = 0; i < this.paths.length; i++){
                        if(i == 0 || i == 4|| i == 1 ||i == 2 || i == 3 || i == 5 || i == 8 || i == 11 || i == 14 || i == 15 || i == 16){
                            this.paths[i]
                                .attr('stroke', 'blue')  // 改变颜色
                                .attr('stroke-width', 5); 
                        }else{
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        }
                    }
                   
                    this.feature_3_flag = false
                }else{
                    for(let i = 0; i < this.paths.length; i++){
        
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        
                    }
                    this.model_1_flag = true
                    this.model_2_flag = true
                    this.model_3_flag = true
                    this.feature_1_flag = true
                    this.feature_2_flag = true
                    this.feature_3_flag = true
                }  
                
            },
            modelClick_1(){
                this.$emit('change_path', { str1: 'model', str2: 'predict1.obj' });
                if(this.model_1_flag){
                    for(let i = 0; i < this.paths.length; i++){
                        if(i == 0 ||  i == 1 ||i == 2 || i == 3 || i == 4 || i == 5 || i == 6 || i == 7 || i == 8 || i == 15 || i == 16){
                            this.paths[i]
                                .attr('stroke', 'blue')  // 改变颜色
                                .attr('stroke-width', 5); 
                        }else{
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        }
                    }
                   
                    this.model_1_flag = false
                }else{
                    for(let i = 0; i < this.paths.length; i++){
        
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        
                    }
                    this.feature_1_flag = true
                    this.feature_2_flag = true
                    this.feature_3_flag = true
                    this.model_1_flag = true
                    this.model_2_flag = true
                    this.model_3_flag = true
                }  
                
            },
            modelClick_2(){
                this.$emit('change_path', { str1: 'model', str2: 'predict2.obj' });

                if(this.model_2_flag){
                    for(let i = 0; i < this.paths.length; i++){
                        if(i == 0 ||  i == 1 ||i == 2 || i == 3 || i == 4 || i == 5 || i == 9 || i == 10 || i == 11 || i == 15 || i == 16){
                            this.paths[i]
                                .attr('stroke', 'blue')  // 改变颜色
                                .attr('stroke-width', 5); 
                        }else{
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        }
                    }
                   
                    this.model_2_flag = false
                }else{
                    for(let i = 0; i < this.paths.length; i++){
        
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        
                    }
                    this.feature_1_flag = true
                    this.feature_2_flag = true
                    this.feature_3_flag = true
                    this.model_1_flag = true
                    this.model_2_flag = true
                    this.model_3_flag = true
                }  
                
            },
            modelClick_3(){
                this.$emit('change_path', { str1: 'model', str2: 'predict3.obj' });

                if(this.model_3_flag){
                    for(let i = 0; i < this.paths.length; i++){
                        if(i == 0 ||  i == 1 ||i == 2 || i == 3 || i == 4 || i == 5 || i == 12 || i == 13 || i == 14 || i == 15 || i == 16){
                            this.paths[i]
                                .attr('stroke', 'blue')  // 改变颜色
                                .attr('stroke-width', 5); 
                        }else{
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        }
                    }
                   
                    this.model_3_flag = false
                }else{
                    for(let i = 0; i < this.paths.length; i++){
        
                            this.paths[i]
                                .attr('stroke', 'black')
                                .attr('stroke-width', 1); 
                        
                    }
                    this.feature_1_flag = true
                    this.feature_2_flag = true
                    this.feature_3_flag = true
                    this.model_1_flag = true
                    this.model_2_flag = true
                    this.model_3_flag = true
                }  
                
            },
            drawHeatmap(data, elementId) {
                d3.select(elementId).selectAll("svg").remove();
                const parentElement = d3.select(elementId).node();
                const width = parentElement.clientWidth;
                const height = parentElement.clientHeight;

                const svg = d3.select(elementId)
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)

                const colorScale = d3.scaleSequential(d3.interpolateBlues)
                    .domain([d3.min(data, d => d3.min(d)), d3.max(data, d => d3.max(d))]);

                const rows = data.length;
                const cols = data[0].length;

                data.forEach((row, i) => {
                    row.forEach((value, j) => {
                        svg.append("rect")
                            .attr("x", j * width / cols)
                            .attr("y", i * height / rows)
                            .attr("width", width / cols)
                            .attr("height", height / rows)
                            .attr("fill", colorScale(value))
                            .on("mouseover", function() {
                                d3.select(this)
                                    .attr("stroke", "black")
                                    .attr("stroke-width", 2);
                            })
                            .on("mouseout", function() {
                                d3.select(this)
                                    .attr("stroke", null);
                            });
                    });
                });
            }
        },
        watch: {
            editVisiable(newVal, oldVal) {
                console.log('editVisiable changed from', oldVal, 'to', newVal);
            },
            img_feat_data(img_feat_data){
                const parsedData = JSON.parse(img_feat_data);
                console.log("parsedData",parsedData);
                ++this.renderKey;
                this.drawHeatmap(parsedData.x1[0], "#feature1");
                this.drawHeatmap(parsedData.x2[0], "#feature2");
                this.drawHeatmap(parsedData.x3[0], "#feature3");
            }
        },
        mounted() {
            const svg = d3.select(this.$refs.svg)

            const lineGenerator = d3.line().curve(d3.curveBasis)
            const allPoints = [
                [
                    [200, 150], 
                    [350, 150]
                ],[
                    [550, 150], 
                    [650, 150]
                ],[
                    [850, 150], 
                    [950, 150]
                ],[
                    [200, 500],  
                    [350, 500]
                ],[
                    [550, 500],  
                    [650, 500]
                ],[
                    [850, 500],  
                    [950, 500]
                ],[
                    [450, 250],  
                    [450, 400]
                ],[
                    [750, 250],  
                    [750, 325],
                    [450, 325],
                    [450, 400]
                ],[
                    [1050, 250], 
                    [1050, 325],
                    [450, 325], 
                    [450, 400]
                ],[
                    [450, 250],
                    [450, 325],
                    [750, 325],  
                    [750, 400]
                ],[
                    [750, 250],  
                    [750, 400]
                ],[
                    [1050, 250], 
                    [1050, 325],
                    [750, 325], 
                    [750, 400]
                ],[
                    [450, 250],
                    [450, 325],
                    [1050, 325],  
                    [1050, 400]
                ],[
                    [750, 250],  
                    [750, 325],
                    [1050, 325], 
                    [1050, 400]
                ],[
                    [1050, 250], 
                    [1050, 400]
                ],[
                    [1050, 600],  
                    [1050, 700],
                    [800, 700]
                ],[
                    [700, 700], 
                    [450, 700],
                    [450, 600]
                ]
            ]
            // 
            for (let points of allPoints) {
                const path = svg.append('path')
                                .attr('d', lineGenerator(points))
                                .attr('stroke', 'black')
                                .attr('fill', 'none')
                                .attr('stroke-dasharray','5,5')
                this.paths.push(path);
                const totalLength = path.node().getTotalLength()
                function animateLine() {
                    path.attr('stroke-dashoffset', totalLength)
                        .transition()
                        .duration(totalLength * 100)  // 动画的持续时间，单位是毫秒
                        .ease(d3.easeLinear)  // 动画的缓动函数
                        .attr('stroke-dashoffset', -totalLength)
                        .on('end', animateLine)
                }

                animateLine()
            }
            
        },
    };
</script>
    
<style lang="scss" scoped>
    .modeloverview {
        background-color: #eee;
        // border-bottom: 2px solid #ddd;
        width: 1200px;
        height: 1000px;
        position: relative;
        // overflow: hidden; /* 如果组件超出容器，则隐藏其余部分 */
        // position: relative;
        // #cav{
        //     width: 100%;
        //     height: 100%;
        //     transform-origin: top left; /* 设置缩放的基点 */
        //     transform: scale(0.7); /* 设置缩放比例，例如 0.5 会将其缩小到50% */
        //     position: absolute; /* 使其脱离正常文档流 */
        //     top: 0;
        //     left: 0;
        
        #gradient{
            width: 100px;
            height: 100px;
            background-color: bisque;
            position: absolute;
            top: 650px;
            left:700px;
        }
        #inputimg{
            width: 100px;
            height: 100px;
            background-color: aqua;
            position: absolute;
            top: 100px;
            left:100px;
        }
        .feature{
            width: 200px;
            height: 200px;
            background-color: aqua;
            position: absolute;
            top: 50px;
        }
        #feature1{
            left:350px;
        }
        #feature2{
            left:650px;
        }
        #feature3{
            left:950px;
        }
        #initmodel{
            width: 100px;
            height: 100px;
            background-color: antiquewhite;
            position: absolute;
            top: 450px;
            left:100px;
        }
        .model{
            width: 200px;
            height: 200px;
            background-color: antiquewhite;
            position: absolute;
            top: 400px;
        }
        #model1{
            left:350px;
        }
        #model2{
            left:650px;
        }
        #model3{
            left:950px;
        }
        #CNN-config{
            font-size: 20px;
            position: absolute;
            height: 50px;
            top: 200px;
            left:70px;
            display: flex;
            align-items: center;
            #CNN-select{
                margin-left: 10px;
                width: 100px;
            }
        }
        #hidden-config{
            font-size: 20px;
            position: absolute;
            top: 250px;
            left:40px;
            display: flex;
            align-items: center;
            #Hidden-spin{
                margin-right: 10px;
                width: 120px ;
            }
        }
        #Init-config{
            font-size: 20px;
            position: absolute;
            height: 50px;
            top: 550px;
            left:50px;
            display: flex;
            align-items: center;
            #Model-select{
                margin-left: 10px;
                width: 100px;
            }
        }
        #unpooling-config{
            font-size: 20px;
            position: absolute;
            height: 50px;
            top: 600px;
            left:50px;
            display: flex;
            align-items: center;
            #unpooling-item{
                margin-left: 10px;
                width: 100px;
            }
        }
        #optimizer-config{
            font-size: 20px;
            position: absolute;
            height: 50px;
            top: 650px;
            left:50px;
            display: flex;
            align-items: center;
            #optimizer-item{
                margin-left: 10px;
                width: 100px;
            }
        }
        #l_rate-config{
            font-size: 20px;
            position: absolute;
            height: 50px;
            top: 700px;
            left:50px;
            display: flex;
            align-items: center;
            #l_rate-item{
                margin-left: 10px;
                width: 100px;
            }
        }
        #lossing-config{
            font-size: 20px;
            position: absolute;
            height: 50px;
            top: 780px;
            left:325px;
            display: flex;
            align-items: center;
            .spin-item{
                margin-left: 10px;
                margin-right: 10px;
                
            }
        }
        .config-item label{
            margin-bottom: 0;
            white-space: nowrap;
        }
    // }
    }
</style>
    