import {createApp} from 'vue'
import App         from './app.vue'
import router      from './router'
import './assets/styl/base.styl'

createApp(App).use(router).mount('#app')
