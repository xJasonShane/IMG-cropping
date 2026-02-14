<template>
  <div class="card">
    <div
      class="upload-zone border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-all duration-300 cursor-pointer"
      :class="[
        isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 transform scale-105' : 'hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-lg'
      ]"
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
          :class="isDragging ? 'scale-110' : ''"
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
            支持 JPG、PNG、WebP 格式，支持批量上传
          </p>
        </div>
        
        <button class="btn-primary" type="button">
          选择图片
        </button>
      </div>
    </div>
    
    <div v-if="images.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        已上传图片 ({{ images.length }}张)
      </h4>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="relative group"
        >
          <div class="relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer"
               :class="[
                 currentImageId === image.id ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
               ]"
               @click="selectImage(image)">
            <img :src="image.dataUrl" :alt="image.name" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                @click.stop="removeImage(index)"
                class="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate text-center mt-1">
            {{ imageNameShort(image.name) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useImageStore } from '../stores/image'
import { validateImageFile, readFileAsDataURL, generateId } from '../utils/helpers'

const emit = defineEmits(['upload', 'imageSelected'])

const imageStore = useImageStore()
const fileInput = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const images = ref([])
const currentImageId = ref(null)

const imageNameShort = (name) => {
  if (name.length > 10) {
    return name.substring(0, 10) + '...'
  }
  return name
}

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
  errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
  errorDiv.textContent = message
  document.body.appendChild(errorDiv)
  setTimeout(() => {
    document.body.removeChild(errorDiv)
  }, 3000)
}

const showSuccess = (message) => {
  const successDiv = document.createElement('div')
  successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
  successDiv.textContent = message
  document.body.appendChild(successDiv)
  setTimeout(() => {
    document.body.removeChild(successDiv)
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
  let successCount = 0
  
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
        dataUrl
      }
      
      images.value.push(image)
      
      if (images.value.length === 1) {
        selectImage(image)
      }
      
      successCount++
      emit('upload', image)
    } catch (error) {
      console.error('File processing error:', error)
      showError(file.name + ': ' + error.message)
    }
  }
  
  if (successCount > 0) {
    showSuccess('成功上传 ' + successCount + ' 张图片')
  }
  
  isProcessing.value = false
}

const selectImage = (image) => {
  currentImageId.value = image.id
  imageStore.setImage(image)
  emit('imageSelected', image)
}

const removeImage = (index) => {
  const removed = images.value[index]
  images.value.splice(index, 1)
  
  if (currentImageId.value === removed.id) {
    if (images.value.length > 0) {
      selectImage(images.value[0])
    } else {
      currentImageId.value = null
      imageStore.clearImage()
    }
  }
}
</script>
