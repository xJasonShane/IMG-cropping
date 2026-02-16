<template>
  <div class="image-preview">
    <div class="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center" style="min-height: 300px;">
      <div v-if="!image" class="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-sm">请上传图片进行预览</span>
      </div>
      
      <div v-else class="relative inline-block">
        <img
          ref="imageRef"
          :src="image.dataUrl"
          :alt="image.name"
          class="max-w-full max-h-[500px] w-auto h-auto block"
          @load="onImageLoad"
        />
        
        <div 
          v-if="showGrid" 
          class="absolute top-0 left-0 pointer-events-none"
          :style="gridContainerStyle"
        >
          <div 
            v-for="n in (rows * cols)" 
            :key="n"
            class="absolute border border-primary-500/60 bg-primary-500/5"
            :style="getGridCellStyle(n - 1)"
          >
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-600/50">
              {{ n }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex items-center justify-between mt-4">
      <div class="flex items-center space-x-4">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="showGrid"
            class="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">显示网格预览</span>
        </label>
      </div>
      
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ rows }} 行 × {{ cols }} 列 = {{ rows * cols }} 块
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  image: {
    type: Object,
    default: null
  },
  rows: {
    type: Number,
    default: 2
  },
  cols: {
    type: Number,
    default: 2
  }
})

const imageRef = ref(null)
const showGrid = ref(true)
const imageRect = ref({ width: 0, height: 0 })
let resizeObserver = null

const gridContainerStyle = computed(() => ({
  width: `${imageRect.value.width}px`,
  height: `${imageRect.value.height}px`
}))

const getGridCellStyle = (index) => {
  const row = Math.floor(index / props.cols)
  const col = index % props.cols
  const cellWidth = 100 / props.cols
  const cellHeight = 100 / props.rows
  
  return {
    left: `${col * cellWidth}%`,
    top: `${row * cellHeight}%`,
    width: `${cellWidth}%`,
    height: `${cellHeight}%`
  }
}

const updateImageRect = () => {
  nextTick(() => {
    if (imageRef.value) {
      imageRect.value = {
        width: imageRef.value.offsetWidth,
        height: imageRef.value.offsetHeight
      }
    }
  })
}

const onImageLoad = () => {
  updateImageRect()
}

const setupResizeObserver = () => {
  if (typeof ResizeObserver !== 'undefined' && imageRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateImageRect()
    })
    resizeObserver.observe(imageRef.value)
  }
}

const cleanupResizeObserver = () => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

onMounted(() => {
  if (props.image) {
    nextTick(() => {
      setupResizeObserver()
      updateImageRect()
    })
  }
})

onUnmounted(() => {
  cleanupResizeObserver()
})

watch(() => props.image, (newImage) => {
  cleanupResizeObserver()
  if (newImage) {
    nextTick(() => {
      setupResizeObserver()
      updateImageRect()
    })
  }
})

watch([() => props.rows, () => props.cols], () => {
  updateImageRect()
})
</script>

<style scoped>
.image-preview img {
  display: block;
}
</style>
