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
    
    <div class="flex space-x-2">
      <button
        @click="resetFilters"
        class="flex-1 btn-secondary"
      >
        重置滤镜
      </button>
      <button
        @click="applyPreset('vintage')"
        class="flex-1 btn-primary"
      >
        复古
      </button>
      <button
        @click="applyPreset('bw')"
        class="flex-1 btn-primary"
      >
        黑白
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
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

const applyFilters = () => {
  if (!props.cropper) return
  
  const canvas = props.cropper.getCroppedCanvas()
  const ctx = canvas.getContext('2d')
  
  ctx.filter = `brightness(${filters.value.brightness}%) contrast(${filters.value.contrast}%) saturate(${filters.value.saturation}%) grayscale(${filters.value.grayscale}%) blur(${filters.value.blur}px)`
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  ctx.putImageData(imageData, 0, 0)
  
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
  }
  applyFilters()
}

watch(() => imageStore.currentImage, (newImage) => {
  if (newImage && newImage.filters) {
    filters.value = { ...newImage.filters }
  } else {
    resetFilters()
  }
})
</script>