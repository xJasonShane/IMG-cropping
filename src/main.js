import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory('/IMG-cropping/'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('./views/About.vue')
    }
  ]
})

const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')