<template>
  <div class="filters-panel space-y-4">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">图片滤镜</h3>
    
    <div class="space-y-4">
      <div>
        <div class="flex justify-between mb-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            亮度
          </label>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ filters.brightness }}%</span>
        </div>
        <input
          type="range"
          v-model.number="filters.brightness"
          min="0"
          max="200"
          class="w-full"
          @input="applyFilters"
        />
      </div>
      
      <div>
        <div class="flex justify-between mb-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            对比度
          </label>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ filters.contrast }}%</span>
        </div>
        <input
          type="range"
          v-model.number="filters.contrast"
          min="0"
          max="200"
          class="w-full"
          @input="applyFilters"
        />
      </div>
      
      <div>
        <div class="flex justify-between mb-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            饱和度
          </label>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ filters.saturation }}%</span>
        </div>
        <input
          type="range"
          v-model.number="filters.saturation"
          min="0"
          max="200"
          class="w-full"
          @input="applyFilters"
        />
      </div>
      
      <div>
        <div class="flex justify-between mb-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            灰度
          </label>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ filters.grayscale }}%</span>
        </div>
        <input
          type="range"
          v-model.number="filters.grayscale"
          min="0"
          max="100"
          class="w-full"
          @input="applyFilters"
        />
      </div>
      
      <div>
        <div class="flex justify-between mb-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            模糊
          </label>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ filters.blur }}px</span>
        </div>
        <input
          type="range"
          v-model.number="filters.blur"
          min="0"
          max="10"
          step="0.5"
          class="w-full"
          @input="applyFilters"
        />
      </div>
    </div>
    
    <div class="flex flex-wrap gap-2">
      <button
        @click="resetFilters"
        class="flex-1 btn-secondary text-sm"
      >
        重置
      </button>
      <button
        @click="applyPreset('vintage')"
        class="flex-1 btn-primary text-sm"
      >
        复古
      </button>
      <button
        @click="applyPreset('bw')"
        class="flex-1 btn-primary text-sm"
      >
        黑白
      </button>
      <button
        @click="applyPreset('warm')"
        class="flex-1 btn-primary text-sm"
      >
        暖色
      </button>
      <button
        @click="applyPreset('cool')"
        class="flex-1 btn-primary text-sm"
      >
        冷色
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useImageStore } from '../stores/image'

const props = defineProps({
  cropper: {
    type: Object,
    default: null
  }
})

const imageStore = useImageStore()

const filters = ref({
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  blur: 0
})

const filterStyle = computed(() => {
  return `brightness(${filters.value.brightness}%) contrast(${filters.value.contrast}%) saturate(${filters.value.saturation}%) grayscale(${filters.value.grayscale}%) blur(${filters.value.blur}px)`
})

const applyFilters = () => {
  if (!props.cropper) return
  
  const cropperContainer = props.cropper.container
  if (cropperContainer) {
    const cropperCanvas = cropperContainer.querySelector('.cropper-canvas img')
    if (cropperCanvas) {
      cropperCanvas.style.filter = filterStyle.value
    }
  }
  
  const currentImage = imageStore.currentImage
  if (currentImage) {
    currentImage.filters = { ...filters.value }
  }
}

const resetFilters = () => {
  filters.value = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    blur: 0
  }
  applyFilters()
}

const applyPreset = (preset) => {
  switch (preset) {
    case 'vintage':
      filters.value = {
        brightness: 110,
        contrast: 90,
        saturation: 80,
        grayscale: 20,
        blur: 0
      }
      break
    case 'bw':
      filters.value = {
        brightness: 100,
        contrast: 120,
        saturation: 0,
        grayscale: 100,
        blur: 0
      }
      break
    case 'warm':
      filters.value = {
        brightness: 105,
        contrast: 95,
        saturation: 120,
        grayscale: 0,
        blur: 0
      }
      break
    case 'cool':
      filters.value = {
        brightness: 100,
        contrast: 110,
        saturation: 90,
        grayscale: 0,
        blur: 0
      }
      break
  }
  applyFilters()
}

watch(() => imageStore.currentImage, (newImage) => {
  if (newImage && newImage.filters) {
    filters.value = { ...newImage.filters }
  } else {
    resetFilters()
  }
}, { immediate: true })

watch(() => props.cropper, (newCropper) => {
  if (newCropper) {
    applyFilters()
  }
})
</script>