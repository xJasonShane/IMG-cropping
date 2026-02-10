import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useImageStore = defineStore('image', () => {
  const images = ref([])
  const currentImage = ref(null)
  const cropperInstance = ref(null)
  const history = ref([{ images: [], currentImageId: null }])
  const historyIndex = ref(0)
  const isRestoring = ref(false)

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  const saveToHistory = () => {
    if (isRestoring.value) return
    
    const state = {
      images: images.value.map(img => ({ ...img })),
      currentImageId: currentImage.value?.id
    }
    
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    
    history.value.push(state)
    historyIndex.value = history.value.length - 1
    
    if (history.value.length > 50) {
      history.value.shift()
      historyIndex.value--
    }
  }

  const addImage = (image) => {
    images.value.push(image)
    currentImage.value = image
    saveToHistory()
  }

  const setCurrentImage = (image) => {
    currentImage.value = image
    saveToHistory()
  }

  const removeImage = (imageId) => {
    const index = images.value.findIndex(img => img.id === imageId)
    if (index > -1) {
      images.value.splice(index, 1)
      if (currentImage.value?.id === imageId) {
        currentImage.value = images.value[0] || null
      }
      saveToHistory()
    }
  }

  const setCropperInstance = (instance) => {
    cropperInstance.value = instance
  }

  const undo = () => {
    if (canUndo.value) {
      isRestoring.value = true
      historyIndex.value--
      restoreFromHistory()
      setTimeout(() => { isRestoring.value = false }, 0)
    }
  }

  const redo = () => {
    if (canRedo.value) {
      isRestoring.value = true
      historyIndex.value++
      restoreFromHistory()
      setTimeout(() => { isRestoring.value = false }, 0)
    }
  }

  const restoreFromHistory = () => {
    const state = history.value[historyIndex.value]
    images.value = state.images.map(img => ({ ...img }))
    currentImage.value = images.value.find(img => img.id === state.currentImageId)
  }

  const clearHistory = () => {
    history.value = []
    historyIndex.value = -1
  }

  return {
    images,
    currentImage,
    cropperInstance,
    history,
    historyIndex,
    canUndo,
    canRedo,
    addImage,
    setCurrentImage,
    removeImage,
    setCropperInstance,
    undo,
    redo,
    clearHistory
  }
})