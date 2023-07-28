<template>
    <div class="controlbar">
        <!--    标题 -->
        <div class="top-panel">
            <div id="page-title" class="top-panel-item"><strong>P2M</strong> Lab</div>
        <!--    选择输入图片-->
        <div id="distribution-selection" class="top-panel-item">
          <div class="top-column-title">Input Image</div>
          <div id="distribution-image-list">
            <div class="distribution-image">
              <img class="distribution-item"
                id="distribution-item-line"
                data-distribution-name="line"
                title="Simple line"
                />
            </div>
            <div class="distribution-image">
              <img class="distribution-item selected"
                id="distribution-item-gaussians"
                data-distribution-name="gaussians"
                title="Mixture of Gaussians"
                />
            </div>
            <div class="distribution-image">
              <img class="distribution-item"
                id="distribution-item-ring"
                data-distribution-name="ring"
                title="Ring"
                />
            </div>
            <div class="distribution-image">
              <img class="distribution-item"
                id="distribution-item-disjoint"
                data-distribution-name="disjoint"
                title="3 disjoint regions"/>
            </div>
          </div>
            <!--      是否使用预训练模型-->
          <div id="distribution-selection-checkbox">
            <el-checkbox id="toggle-pretrained" v-model="pre_trained" label="Use pre-trained model" size="large" />
          </div>
        </div>

        <!-- <ConfigBar></ConfigBar> -->
        <el-select v-model="selected" placeholder="请选择" @change="handleChange">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>

        <div id="timeline-controls" class="top-panel-item">
        <!--     重启按钮-->
          <button
            id="reset-button" title="Reset the model">
            <img class="material-icons" id="button-top-reset" src="/chehui.svg"/>
          </button>
        <!--    启动/暂停按钮-->
          <button
            id="play-pause-button" title="Run/Pause training" @click="isPlaying = !isPlaying">
            <img class="material-icons" id="button-top-play" src="/kaishi.svg" v-if="!isPlaying"/>
            <img class="material-icons" id="button-top-pause" src="zanting.svg" v-else/>
          </button>
        </div>


        <!--   当前Epoch数量-->
        <div id="iteration" class="top-panel-item">
          <div class="top-column-title">Epoch</div>
          <div id="iteration-count">0</div>
        </div>
        </div>

        
    </div>
</template>
    
<script>
    import { handle } from 'express/lib/application';
import ConfigBar from './ConfigBar.vue';
    import { ElSelect, ElOption } from 'element-plus';

  
    export default {
        props: {
            
        },
        components: {
           ConfigBar,
           ElSelect,
           ElOption
        },
        data () {
            return {
                isPlaying: false,
                pre_trained: true,
                selected: 'Option1',
                options: [
                  { value: 'Option1', label: 'Option 1' },
                  { value: 'Option2', label: 'Option 2' },
                  // 添加更多选项...
                ],
            };
        },
        computed: {
            
        },
        methods: {
            handleChange(){
              this.$forceUpdate()
            }
        },
        watch: {
            selected(newVal) {
              console.log('Selected value changed:', newVal);
            },
        },
        mounted() {
            //
            console.log(this.selected)
        },
    };
</script>
    
<style lang="scss" scoped>
    .controlbar {
        height: 100%;
        width: 100%;
        background-color: #eee;
        border-bottom: 2px solid #ddd;
        font-size: 30px;
        padding: 10px 0 9px;
        .top-panel{
            display: flex;
            margin-left: 50px;
            margin-right: auto;
            justify-content: space-between;
            width: 1000px;
            align-items: center;
            .top-panel-item {
                margin-left: 30px;
                margin-right: 40px;
            }
            #page-title {
                color: #444;
                font-size: 36px;
                margin-left: 0;
                margin-right: 60px;
                padding-left: 20px;
            }
            #distribution-selection .top-column-title {
                color: #222;
                font-size: 15px;
            }
            #distribution-image-list {
                display: flex;
                height: 30px;
            }
            .distribution-image {
                height: 30px;
                margin-right: 7px;
                width: 30px;
            }

            .distribution-image img{
                cursor: pointer;
                height: 30px;
                width: 30px;
            }

            #timeline-controls {
                align-items: center;
                display: flex;
                justify-content: center;
            }

            #timeline-controls #reset-button {
                margin-right: 11px;
                width: 50px;  
                height: 50px; 
                border: none;
            }
            #timeline-controls #play-pause-button {
                margin-right: 11px;
                width: 75px;  
                height: 75px; 
                border: none;
            }
            #timeline-controls button img{
                width: 100%;  
                height: 100%; 
                object-fit: contain;
            }
            
        }
        
    }
    
    
</style>
    