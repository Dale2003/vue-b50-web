import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const app = createApp(App)

// 使用Element Plus并设置中文语言
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
