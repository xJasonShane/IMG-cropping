<template>
  <div class="cropper-container">
    <div class="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden" :style="{ height: height }">
      <img
        v-if="image && image.dataUrl"
        ref="imageRef"
        :src="image.dataUrl"
        :alt="image.name"
        class="max-w-full"
        @load="initCropper"
      />
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        <span>加载图片中...</span>
      </div>
    </div>
    
    <div class="flex items-center justify-center space-x-4 mt-4">
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

const initCropper = () => {
  if (!imageRef.value) return
  
  if (cropperInstance.value) {
    cropperInstance.value.destroy()
    cropperInstance.value = null
  }

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
watch(() => props.image, () => {
  nextTick(() => {
    if (imageRef.value) {
      initCropper()
    }
  })
}, { deep: true })

onBeforeUnmount(() => {
  if (cropperInstance.value) {
    cropperInstance.value.destroy()
    cropperInstance.value = null
  }
})

defineExpose({
  cropper: cropperInstance,
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