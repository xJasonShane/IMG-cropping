<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
        <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        分割历史
      </h3>
      <button
        v-if="historyStore.history.length > 0"
        @click="clearHistory"
        class="text-sm text-red-500 hover:text-red-600 transition-colors"
      >
        清空
      </button>
    </div>
    
    <div v-if="historyStore.history.length === 0" class="text-center py-8">
      <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-gray-500 dark:text-gray-400 text-sm">暂无分割记录</p>
    </div>
    
    <div v-else class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="item in historyStore.history"
        :key="item.id"
        class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 dark:text-white truncate">
              {{ item.imageName || '图片' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ item.rows }} × {{ item.cols }} 分割 · {{ item.pieceCount }} 张
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {{ item.timestamp }}
            </p>
          </div>
          <button
            @click="removeItem(item.id)"
            class="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="删除此记录"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHistoryStore } from '../stores/history'

const historyStore = useHistoryStore()

/**
 * 清除所有历史记录
 */
const clearHistory = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    historyStore.clearHistory()
  }
}

/**
 * 删除指定历史记录项
 */
const removeItem = (id) => {
  historyStore.removeHistoryItem(id)
}
</script>
