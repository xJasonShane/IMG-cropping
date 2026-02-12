<template>
  <div class="cropper-container">
    <div class="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden" :style="{ height: height }">
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full text-gray-500">
        <div class="loading-spinner mb-4"></div>
        <span class="text-sm">加载图片中...</span>
      </div>
      
      <div v-else-if="loadError" class="flex flex-col items-center justify-center h-full text-red-500">
        <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-sm text-center px-4">{{ loadError }}</span>
        <button @click="retryLoad" class="mt-4 btn-primary text-sm px-4 py-2">
          重试
        </button>
      </div>
      
      <img
        v-else-if="image && image.dataUrl"
        ref="imageRef"
        :src="image.dataUrl"
        :alt="image.name"
        class="max-w-full"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      
      <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
        <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-sm">请选择图片进行预览</span>
      </div>
    </div>
    
    <div class="flex items-center justify-center space-x-4 mt-4">
      <button @click="zoomIn" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="放大">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
        </svg>
      </button>
      
      <button @click="zoomOut" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="缩小">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
        </svg>
      </button>
      
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      
      <button @click="rotateLeft" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="向左旋转">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
        </svg>
      </button>
      
      <button @click="rotateRight" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="向右旋转">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path>
        </svg>
      </button>
      
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      
      <button @click="flipHorizontal" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="水平翻转">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
        </svg>
      </button>
      
      <button @click="flipVertical" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="垂直翻转">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
        </svg>
      </button>
      
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      
      <button @click="reset" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="重置">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Cropper from 'cropperjs'
import { useImageStore } from '../stores/image'
import { useSettingsStore } from '../stores/settings'
import { parseAspectRatio } from '../utils/helpers'

const props = defineProps({
  image: {
    type: Object,
    required: true
  },
  height: {
    type: String,
    default: '500px'
  }
})

const emit = defineEmits(['crop', 'ready'])

const imageStore = useImageStore()
const settingsStore = useSettingsStore()

const imageRef = ref(null)
const cropperInstance = ref(null)
const isLoading = ref(false)
const loadError = ref(null)

const handleImageLoad = () => {
  isLoading.value = false
  loadError.value = null
  initCropper()
}

const handleImageError = (e) => {
  isLoading.value = false
  loadError.value = '图片加载失败，请检查文件格式或大小'
  console.error('Image load error:', e)
}

const retryLoad = () => {
  if (props.image && props.image.dataUrl) {
    loadError.value = null
    isLoading.value = true
  }
}

const initCropper = () => {
  if (!imageRef.value || !imageRef.value.complete) return
  
  if (cropperInstance.value) {
    cropperInstance.value.destroy()
    cropperInstance.value = null
  }

  try {
    cropperInstance.value = new Cropper(imageRef.value, {
      aspectRatio: parseAspectRatio(settingsStore.aspectRatio),
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      background: false,
      ready: () => {
        imageStore.setCropperInstance(cropperInstance.value)
        emit('ready', cropperInstance.value)
      },
      crop: () => {
        emit('crop', cropperInstance.value)
      }
    })
  } catch (error) {
    console.error('Cropper initialization error:', error)
    loadError.value = '图片预览初始化失败，请刷新页面重试'
  }
}

const zoomIn = () => {
  if (cropperInstance.value) {
    cropperInstance.value.zoom(0.1)
  }
}

const zoomOut = () => {
  if (cropperInstance.value) {
    cropperInstance.value.zoom(-0.1)
  }
}

const rotateLeft = () => {
  if (cropperInstance.value) {
    cropperInstance.value.rotate(-90)
    props.image.rotation = (props.image.rotation - 90) % 360
  }
}

const rotateRight = () => {
  if (cropperInstance.value) {
    cropperInstance.value.rotate(90)
    props.image.rotation = (props.image.rotation + 90) % 360
  }
}

const flipHorizontal = () => {
  if (cropperInstance.value) {
    const data = cropperInstance.value.getData()
    cropperInstance.value.scaleX(-data.scaleX || -1)
    props.image.scaleX = (props.image.scaleX || 1) * -1
  }
}

const flipVertical = () => {
  if (cropperInstance.value) {
    const data = cropperInstance.value.getData()
    cropperInstance.value.scaleY(-data.scaleY || -1)
    props.image.scaleY = (props.image.scaleY || 1) * -1
  }
}

const reset = () => {
  if (cropperInstance.value) {
    cropperInstance.value.reset()
    props.image.rotation = 0
    props.image.scaleX = 1
    props.image.scaleY = 1
  }
}

const updateAspectRatio = () => {
  if (cropperInstance.value) {
    cropperInstance.value.setAspectRatio(parseAspectRatio(settingsStore.aspectRatio))
  }
}

watch(() => settingsStore.aspectRatio, updateAspectRatio)
watch(() => props.image, (newImage, oldImage) => {
  if (newImage && newImage.id !== oldImage?.id) {
    loadError.value = null
    isLoading.value = true
    
    nextTick(() => {
      if (imageRef.value && imageRef.value.complete) {
        isLoading.value = false
        initCropper()
      }
    })
  }
}, { deep: true })

onBeforeUnmount(() => {
  if (cropperInstance.value) {
    cropperInstance.value.destroy()
    cropperInstance.value = null
  }
})

defineExpose({
  cropper: cropperInstance,
  zoomIn,
  zoomOut,
  rotateLeft,
  rotateRight,
  flipHorizontal,
  flipVertical,
  reset
})
</script>

<style scoped>
.cropper-container :deep(.cropper-view-box) {
  outline: 1px solid #0ea5e9;
}

.cropper-container :deep(.cropper-face) {
  background-color: rgba(14, 165, 233, 0.1);
}

.cropper-container :deep(.cropper-line) {
  background-color: #0ea5e9;
}

.cropper-container :deep(.cropper-point) {
  background-color: #0ea5e9;
}
</style>