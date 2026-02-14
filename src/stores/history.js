import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  const history = ref([])
  const maxHistoryItems = 20

  /**
   * 添加历史记录项
   */
  const addHistoryItem = (item) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('zh-CN'),
      ...item
    }
    
    history.value.unshift(historyItem)
    
    if (history.value.length > maxHistoryItems) {
      history.value.pop()
    }
    
    saveToLocalStorage()
  }

  /**
   * 清除所有历史记录
   */
  const clearHistory = () => {
    history.value = []
    saveToLocalStorage()
  }

  /**
   * 从历史记录中删除特定项
   */
  const removeHistoryItem = (id) => {
    history.value = history.value.filter(item => item.id !== id)
    saveToLocalStorage()
  }

  /**
   * 保存到 localStorage
   */
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('imageSplitterHistory', JSON.stringify(history.value))
    } catch (e) {
      console.error('Failed to save history to localStorage:', e)
    }
  }

  /**
   * 从 localStorage 加载历史记录
   */
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('imageSplitterHistory')
      if (saved) {
        history.value = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e)
    }
  }

  return {
    history,
    addHistoryItem,
    clearHistory,
    removeHistoryItem,
    loadFromLocalStorage
  }
})
