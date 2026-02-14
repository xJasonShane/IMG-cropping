<template>
  <div class="about-page min-h-screen">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        关于我们
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        一个简单、高效的在线图片分割工具
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div class="card">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            快速高效
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            无需安装任何软件，上传图片即可开始分割。所有处理都在浏览器中完成，保护您的隐私安全。
          </p>
        </div>

        <div class="card">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
            </svg>
            灵活配置
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            支持自定义行列数、输出格式、命名模板等多种配置，满足您的各种分割需求。
          </p>
        </div>

        <div class="card">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            安全隐私
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            所有图片处理都在本地浏览器中完成，不会上传到任何服务器，您的图片安全有保障。
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            使用指南
          </h3>
          <ol class="space-y-3 text-gray-600 dark:text-gray-300">
            <li class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-semibold mr-3 text-sm">1</span>
              <span>上传您想要分割的图片</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-semibold mr-3 text-sm">2</span>
              <span>设置分割的行数和列数</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-semibold mr-3 text-sm">3</span>
              <span>点击"分割图片"按钮</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-semibold mr-3 text-sm">4</span>
              <span>下载分割后的图片</span>
            </li>
          </ol>
        </div>

        <div class="card">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            技术栈
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span class="text-gray-700 dark:text-gray-300 font-medium">Vue 3</span>
            </div>
            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span class="text-gray-700 dark:text-gray-300 font-medium">Vite</span>
            </div>
            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span class="text-gray-700 dark:text-gray-300 font-medium">Tailwind CSS</span>
            </div>
            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span class="text-gray-700 dark:text-gray-300 font-medium">Pinia</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
            </svg>
            开源项目
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            本项目完全开源，欢迎贡献代码！
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-white text-white dark:text-gray-800 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            查看 GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
