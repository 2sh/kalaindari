import { createWebHistory, createRouter } from 'vue-router'

import MainView from './views/Main.vue'

const routes = [
  { path: '/:view?/:date?', component: MainView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router