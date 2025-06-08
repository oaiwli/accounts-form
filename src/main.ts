import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import naivePlugins from './plugins/naive-ui'

const app = createApp(App)

app.use(createPinia())
app.use(naive)
app.use(naivePlugins)

app.mount('#app')
