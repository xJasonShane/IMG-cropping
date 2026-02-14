<template>
  <header class="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <router-link to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800 dark:text-white">图片分割工具</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">快速分割图片，一键下载</p>
            </div>
          </router-link>
        </div>
        
        <nav class="hidden md:flex items-center space-x-6">
          <router-link 
            to="/" 
            class="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium"
            :class="{ 'text-primary-500 dark:text-primary-400': $route.path === '/' }"
          >
            首页
          </router-link>
          <router-link 
            to="/about" 
            class="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium"
            :class="{ 'text-primary-500 dark:text-primary-400': $route.path === '/about' }"
          >
            关于
          </router-link>
        </nav>
        
        <div class="flex items-center space-x-2">
          <button 
            @click="toggleDarkMode"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :title="isDark ? '切换到亮色模式' : '切换到深色模式'"
          >
            <svg v-if="isDark" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg v-else class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
          
          <button 
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg v-if="isMobileMenuOpen" class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <svg v-else class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="isMobileMenuOpen" class="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <nav class="flex flex-col space-y-3">
          <router-link 
            to="/" 
            @click="isMobileMenuOpen = false"
            class="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400': $route.path === '/' }"
          >
            首页
          </router-link>
          <router-link 
            to="/about" 
            @click="isMobileMenuOpen = false"
            class="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-500 dark:text-primary-400': $route.path === '/about' }"
          >
            关于
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)
const isMobileMenuOpen = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'true')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', 'false')
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true' || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>
