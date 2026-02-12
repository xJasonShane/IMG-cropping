<template>
  <div v-if="image" class="image-info card">
    <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      图片信息
    </h3>
    
    <div class="space-y-3">
      <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
        <span class="text-sm text-gray-500 dark:text-gray-400">文件名</span>
        <span class="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[150px]" :title="image.name">
          {{ image.name }}
        </span>
      </div>
      
      <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
        <span class="text-sm text-gray-500 dark:text-gray-400">文件大小</span>
        <span class="text-sm font-medium text-gray-800 dark:text-white">
          {{ formatFileSize(image.size) }}
        </span>
      </div>
      
      <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
        <span class="text-sm text-gray-500 dark:text-gray-400">文件类型</span>
        <span class="text-sm font-medium text-gray-800 dark:text-white">
          {{ getFileType(image.type) }}
        </span>
      </div>
      
      <div v-if="dimensions" class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
        <span class="text-sm text-gray-500 dark:text-gray-400">原始尺寸</span>
        <span class="text-sm font-medium text-gray-800 dark:text-white">
          {{ dimensions.width }} × {{ dimensions.height }} px
        </span>
      </div>
      
      <div v-if="cropBox" class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
        <span class="text-sm text-gray-500 dark:text-gray-400">裁剪区域</span>
        <span class="text-sm font-medium text-gray-800 dark:text-white">
          {{ Math.round(cropBox.width) }} × {{ Math.round(cropBox.height) }} px
        </span>
      </div>
      
      <div v-if="image.rotation" class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
        <span class="text-sm text-gray-500 dark:text-gray-400">旋转角度</span>
        <span class="text-sm font-medium text-gray-800 dark:text-white">
          {{ image.rotation }}°
        </span>
      </div>
      
      <div v-if="image.scaleX !== 1 || image.scaleY !== 1" class="flex justify-between items-center py-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">翻转</span>
        <span class="text-sm font-medium text-gray-800 dark:text-white">
          {{ getFlipInfo(image) }}
        </span>
      </div>
    </div>
    
    <div v-if="hasFilters" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">已应用滤镜</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(value, key) in activeFilters"
          :key="key"
          class="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded"
        >
          {{ getFilterLabel(key) }}: {{ getFilterValue(key, value) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useImageStore } from '../stores/image'
import { formatFileSize } from '../utils/helpers'

const props = defineProps({
  image: {
    type: Object,
    default: null
  },
  cropper: {
    type: Object,
    default: null
  }
})

const imageStore = useImageStore()
const dimensions = ref(null)
const cropBox = ref(null)

const getFileType = (type) => {
  const types = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WebP'
  }
  return types[type] || type
}

const getFlipInfo = (image) => {
  const flips = []
  if (image.scaleX === -1) flips.push('水平')
  if (image.scaleY === -1) flips.push('垂直')
  return flips.join(' + ') || '无'
}

const filterLabels = {
  brightness: '亮度',
  contrast: '对比度',
  saturation: '饱和度',
  grayscale: '灰度',
  blur: '模糊'
}

const getFilterLabel = (key) => filterLabels[key] || key

const getFilterValue = (key, value) => {
  if (key === 'blur') return `${value}px`
  return `${value}%`
}

const hasFilters = computed(() => {
  if (!props.image?.filters) return false
  const f = props.image.filters
  return f.brightness !== 100 || f.contrast !== 100 || f.saturation !== 100 || f.grayscale > 0 || f.blur > 0
})

const activeFilters = computed(() => {
  if (!props.image?.filters) return {}
  const f = props.image.filters
  const active = {}
  if (f.brightness !== 100) active.brightness = f.brightness
  if (f.contrast !== 100) active.contrast = f.contrast
  if (f.saturation !== 100) active.saturation = f.saturation
  if (f.grayscale > 0) active.grayscale = f.grayscale
  if (f.blur > 0) active.blur = f.blur
  return active
})

const loadImageDimensions = () => {
  if (!props.image?.dataUrl) return
  
  const img = new Image()
  img.onload = () => {
    dimensions.value = { width: img.width, height: img.height }
  }
  img.src = props.image.dataUrl
}

const updateCropBox = () => {
  if (props.cropper) {
    try {
      cropBox.value = props.cropper.getCropBoxData()
    } catch (e) {
      cropBox.value = null
    }
  }
}

watch(() => props.image, loadImageDimensions, { immediate: true })

watch(() => props.cropper, (cropper) => {
  if (cropper) {
    updateCropBox()
    cropper.on('crop', updateCropBox)
  }
}, { immediate: true })
</script>
