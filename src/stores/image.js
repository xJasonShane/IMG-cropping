import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImageStore = defineStore('image', () => {
  const currentImage = ref(null)
  const splitPieces = ref([])
  
  const setImage = (image) => {
    currentImage.value = image
    splitPieces.value = []
  }
  
  const setSplitPieces = (pieces) => {
    splitPieces.value = pieces
  }
  
  const clearImage = () => {
    currentImage.value = null
    splitPieces.value = []
  }
  
  return {
    currentImage,
    splitPieces,
    setImage,
    setSplitPieces,
    clearImage
  }
})
