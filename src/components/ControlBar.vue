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

        <!-- <ConfigBar id="config-bar" class="top-panel-item"></ConfigBar> -->
        

        <div id="timeline-controls" class="top-panel-item">
        <!--     重启按钮-->
          <button
            id="reset-button" title="Reset the model">
            <img class="material-icons" id="button-top-reset" src="/chehui.svg"/>
          </button>
        <!--    启动/暂停按钮-->
          <button
            id="play-pause-button" title="Run/Pause training" @click="togglePlayPause">
            <img class="material-icons" id="button-top-play" src="/kaishi.svg" v-if="!isPlaying"/>
            <img class="material-icons" id="button-top-pause" src="zanting.svg" v-else/>
          </button>
        </div>


        <!--   当前Epoch数量-->
        <div id="iteration" class="top-panel-item">
          <div class="top-column-title">Epoch</div>
          <div id="iteration-count" v-text="iterationCount"></div>
        </div>
        </div>

        
    </div>
</template>
    
<script>
  import ConfigBar from './ConfigBar.vue';
  import axios from 'axios'; 
    export default {
        props: {
          iterationCount: {
              default: "0"
          }
        },
        components: {
          ConfigBar
        },
        data () {
            return {
                // iterationCount: 0,
                isPlaying: false,
                pre_trained: true,
                selected: 'Option1', // 这里存储被选中的值
                options: [
                  { value: null, text: '请选择一个选项' },
                  { value: 'Option1', text: '选项 1' },
                  { value: 'Option2', text: '选项 2' },
                  { value: 'Option3', text: '选项 3' }
                  // 这是你的选项列表，你可以根据需要添加更多选项
                ]
            };
        },
        computed: {
            
        },
        methods: {
            togglePlayPause() {
              this.isPlaying = !this.isPlaying;

              // 你的 Express 服务器端的 URL，可能需要进行修改
              let url = 'http://localhost:3000/play_pause';  
              
              // 使用 axios 发送请求
              axios.post(url, {
                isPlaying: this.isPlaying
              })
              .then(response => {
                console.log(response.data);
              })
              .catch(error => {
                console.error(error);
              });
            },
        },
        watch: {
            selected(newVal){
              console.log('Selected value changed:', newVal)
            }
        },
        mounted() {
            
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
            #config-item{
              width: 500px;
            }
        }
        
    }
    
    
</style>
    