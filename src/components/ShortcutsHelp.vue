<template>
  <div class="shortcuts-help">
    <button
      @click="showPanel = !showPanel"
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title="快捷键帮助"
    >
      <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </button>
    
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showPanel"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          @click="showPanel = false"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 transform transition-all"
            @click.stop
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">快捷键</h3>
              <button
                @click="showPanel = false"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="space-y-4">
              <div v-for="group in shortcutGroups" :key="group.title" class="space-y-2">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ group.title }}
                </h4>
                <div class="space-y-2">
                  <div
                    v-for="shortcut in group.shortcuts"
                    :key="shortcut.key"
                    class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ shortcut.description }}</span>
                    <div class="flex items-center space-x-1">
                      <kbd
                        v-for="(key, index) in shortcut.keys"
                        :key="index"
                        class="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm"
                      >
                        {{ key }}
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
                按 <kbd class="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> 关闭此面板
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showPanel = ref(false)

const shortcutGroups = [
  {
    title: '历史操作',
    shortcuts: [
      { description: '撤销', keys: ['Ctrl', 'Z'] },
      { description: '重做', keys: ['Ctrl', 'Y'] }
    ]
  },
  {
    title: '图片操作',
    shortcuts: [
      { description: '放大', keys: ['Ctrl', '+'] },
      { description: '缩小', keys: ['Ctrl', '-'] },
      { description: '向左旋转', keys: ['Ctrl', '←'] },
      { description: '向右旋转', keys: ['Ctrl', '→'] },
      { description: '重置', keys: ['Ctrl', 'R'] }
    ]
  },
  {
    title: '文件操作',
    shortcuts: [
      { description: '上传图片', keys: ['Ctrl', 'U'] },
      { description: '下载裁剪', keys: ['Ctrl', 'S'] }
    ]
  },
  {
    title: '界面操作',
    shortcuts: [
      { description: '切换深色模式', keys: ['Ctrl', 'D'] },
      { description: '显示快捷键', keys: ['?'] }
    ]
  }
]

const handleKeydown = (e) => {
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    const activeElement = document.activeElement
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') return
    showPanel.value = !showPanel.value
  }
  
  if (e.key === 'Escape' && showPanel.value) {
    showPanel.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
