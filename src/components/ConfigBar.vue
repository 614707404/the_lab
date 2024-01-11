<template>
  <div class="config-bar">
    <div class="config-item">
      <label>CNN:</label>
      <b-form-select v-model="CNN" :options="CNN_options" class="select-item"></b-form-select>
      <b-form-spinbutton v-model="value" min="0" max="10" class="spin-item"></b-form-spinbutton>
      <label>hidden layer(s)</label>
    </div>
    <div class="config-item">
      <label>Initial Model:</label>
      <b-form-select v-model="Model" :options="Model_options" class="select-item"></b-form-select>
      <label>unpooling:</label>
      <b-form-select v-model="unpooling" :options="unpooling_options" class="select-item"></b-form-select>
    </div>
    <div class="config-item">
      <label>Learing rate:</label>
      <b-form-select v-model="l_rate" :options="l_rate_options" class="select-item"></b-form-select>
      <label>Optimizer:</label>
      <b-form-select v-model="optimizer" :options="optimizer_options" class="select-item"></b-form-select>
      
    </div>
    <div class="config-item">
      <label>Loss = </label>
      <b-form-spinbutton v-model="value_" min="0" max="10" class="spin-item"></b-form-spinbutton>
      <label>Chamfer loss + </label>
      <b-form-spinbutton v-model="value_" min="0" max="10" class="spin-item"></b-form-spinbutton>
      <label>Normal loss + </label>
      <b-form-spinbutton v-model="value_" min="0" max="10" class="spin-item"></b-form-spinbutton>
      <label>Regularization</label>
    </div>
    
  </div>
</template>
  
<script>
  import { BFormSelect } from 'bootstrap-vue'
  import { BFormSpinbutton } from 'bootstrap-vue'

  export default {
      props: {
          
      },
      components: {
        BFormSelect,
        BFormSpinbutton
      },
      data () {
          return {
              CNN: 'ResNet',
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
              l_rate: '0.001',
              l_rate_options: [
                { value: '0.001', text: '0.001' },
                { value: '0.003', text: '0.003' },
                { value: '0.1', text: '0.1' },
                { value: '0.3', text: '0.3' },
              ],
              optimizer: 'Adam',
              optimizer_options: [
                { value: 'Adam', text: 'Adam' },
                { value: 'SGD', text: 'SGD' },
              ],
              value: 5,  // 用于绑定数字输入框的数据
              value_: 1, 
          };
      },
      computed: {
          
      },
      methods: {
          
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
  .config-bar{
    display: flex;
    flex-direction: column;
    font-size: 15px;
    width: 800px;
    .config-item{
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .select-item{
      width: 150px;
    }
    .spin-item{
      width: 150px;
    }
  }
  
</style>
  