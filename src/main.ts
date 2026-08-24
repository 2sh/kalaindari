// Add the necessary CSS

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import I18NextVue from 'i18next-vue';
import getI18n from './i18n'
const i18next = getI18n()

import './assets/style/main.css'
import './assets/style/window.css'
import './assets/style/calendar.css'
import './assets/style/sigla-overline.css'

createApp(App)
  .use(router)
  .use(I18NextVue, {i18next})
  .mount('#app')
