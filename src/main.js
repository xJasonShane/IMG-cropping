import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// 挂载前应用持久化主题，避免深色用户首帧白屏闪烁
const savedDarkMode = localStorage.getItem('darkMode')
if (savedDarkMode === 'true' ||
    (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

const router = createRouter({
  history: createWebHistory('/'),
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
    },
    {
      // 未匹配路由统一回首页
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')