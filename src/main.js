import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.scss'
// import Chat from 'vue3-beautiful-chat'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus)
// app.use(Chat)

app.mount('#app')