<template>
    <div class="modeloverview">
        <div id="inputimg"></div>
        
        <div id="feature1" class="feature"></div>
        <div id="feature2" class="feature"></div>
        <div id="feature3" class="feature"></div>

        <div id="initmodel"></div>
        
        <div id="model1" class="model"></div>
        <div id="model2" class="model"></div>
        <div id="model3" class="model"></div>

        <div id="gradient"></div>
        <svg ref="svg" style="height: 100%; width: 100%;"></svg>

    </div>
</template>
    
<script>    
    import * as d3 from 'd3'

    export default {
        props: {
            
        },
        components: {
           
        },
        data () {
            return {
                
            };
        },
        computed: {
            
        },
        methods: {
            
        },
        watch: {
            
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
        border-bottom: 2px solid #ddd;
        width: 100%;
        height: 100%;
        position: relative;
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
    }
</style>
    