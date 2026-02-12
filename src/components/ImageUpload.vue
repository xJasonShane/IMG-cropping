<template>
  <div
    class="upload-zone border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-all duration-300 scale-in"
    :class="{
      'border-primary-500 bg-primary-50 dark:bg-primary-900/20 transform scale-105': isDragging,
      'hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-lg': !isDragging
    }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
    
    <div class="flex flex-col items-center space-y-4">
      <div 
        class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center transition-transform duration-300"
        :class="{ 'scale-110': isDragging }"
      >
        <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
      
      <div>
        <p class="text-lg font-medium text-gray-700 dark:text-gray-300">
          拖放图片到这里或点击上传
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          支持 JPG、PNG、WebP 格式，单张最大 50MB
        </p>
      </div>
      
      <button class="btn-primary">
        选择图片
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useImageStore } from '../stores/image'
import { validateImageFile, readFileAsDataURL, generateId } from '../utils/helpers'

const emit = defineEmits(['upload'])

const imageStore = useImageStore()
const fileInput = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  await processFiles(files)
}

const triggerFileInput = () => {
  if (!isProcessing.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files)
  await processFiles(files)
  e.target.value = ''
}

const showError = (message) => {
  const errorDiv = document.createElement('div')
  errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse'
  errorDiv.textContent = message
  document.body.appendChild(errorDiv)
  setTimeout(() => {
    document.body.removeChild(errorDiv)
  }, 3000)
}

const processFiles = async (files) => {
  if (isProcessing.value) return
  
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) {
    showError('请选择有效的图片文件（JPG、PNG、WebP）')
    return
  }

  isProcessing.value = true
  
  for (const file of imageFiles) {
    try {
      validateImageFile(file)
      
      const dataUrl = await readFileAsDataURL(file)
      
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('文件读取失败，请重试')
      }
      
      const image = {
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100
        }
      }
      
      imageStore.addImage(image)
      emit('upload', image)
    } catch (error) {
      console.error('File processing error:', error)
      showError(`${file.name}: ${error.message}`)
    }
  }
  
  isProcessing.value = false
}
</script>