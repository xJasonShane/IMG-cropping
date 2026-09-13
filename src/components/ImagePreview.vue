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
          :src="image.url"
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
            v-for="n in (cellCount)"
            :key="n"
            class="absolute border border-primary-500/60 bg-primary-500/5"
            :style="getGridCellStyle(n - 1)"
          >
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-600/50">
              {{ n }}
            </span>
          </div>

          <!-- 自定义模式：可拖拽分割线把手 -->
          <template v-if="editable">
            <div
              v-for="(p, i) in innerXLlines"
              :key="'x-handle-' + i"
              class="absolute top-0 bottom-0 w-4 -translate-x-1/2 cursor-col-resize flex items-center justify-center touch-none"
              :style="{ left: (p * 100) + '%' }"
              @pointerdown="startDrag($event, 'x', i + 1)"
            >
              <div class="w-0.5 h-8 rounded bg-primary-500 shadow-md hover:h-full hover:bg-primary-400 transition-all"></div>
            </div>
            <div
              v-for="(p, i) in innerYLines"
              :key="'y-handle-' + i"
              class="absolute left-0 right-0 h-4 -translate-y-1/2 cursor-row-resize flex items-center justify-center touch-none"
              :style="{ top: (p * 100) + '%' }"
              @pointerdown="startDrag($event, 'y', i + 1)"
            >
              <div class="h-0.5 w-8 rounded bg-primary-500 shadow-md hover:w-full hover:bg-primary-400 transition-all"></div>
            </div>
          </template>
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
        <span
          v-if="editable"
          class="text-xs text-primary-500/80 hidden sm:inline"
        >
          拖动高亮分割线可自定义分块
        </span>
      </div>

      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ rowCount }} 行 × {{ colCount }} 列 = {{ cellCount }} 块
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
  // 边界线百分比数组（含 0/1 端点）：x=列线（垂直），y=行线（水平）
  xLines: {
    type: Array,
    default: () => [0, 1]
  },
  yLines: {
    type: Array,
    default: () => [0, 1]
  },
  // 自定义模式：渲染可拖拽把手
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['lines-change'])

const imageRef = ref(null)
const showGrid = ref(true)
const imageRect = ref({ width: 0, height: 0 })
let resizeObserver = null

const colCount = computed(() => props.xLines.length - 1)
const rowCount = computed(() => props.yLines.length - 1)
const cellCount = computed(() => rowCount.value * colCount.value)

// 内线（不含端点），用于渲染拖拽把手
const innerXLlines = computed(() => props.xLines.slice(1, -1))
const innerYLines = computed(() => props.yLines.slice(1, -1))

const gridContainerStyle = computed(() => ({
  width: `${imageRect.value.width}px`,
  height: `${imageRect.value.height}px`
}))

const getGridCellStyle = (index) => {
  const row = Math.floor(index / colCount.value)
  const col = index % colCount.value
  const left = props.xLines[col]
  const right = props.xLines[col + 1]
  const top = props.yLines[row]
  const bottom = props.yLines[row + 1]

  return {
    left: `${left * 100}%`,
    top: `${top * 100}%`,
    width: `${(right - left) * 100}%`,
    height: `${(bottom - top) * 100}%`
  }
}

// 拖拽分割线：pointermove 实时上报新位置，相邻线间保留 2% 最小间隙
const startDrag = (e, axis, linesIndex) => {
  e.preventDefault()
  const img = imageRef.value
  if (!img) return

  const rect = img.getBoundingClientRect()
  const lines = axis === 'x' ? [...props.xLines] : [...props.yLines]
  const total = axis === 'x' ? rect.width : rect.height
  if (total <= 0) return

  const MIN_GAP = 0.02
  const lower = lines[linesIndex - 1] + MIN_GAP
  const upper = lines[linesIndex + 1] - MIN_GAP
  if (lower > upper) return

  const onMove = (ev) => {
    const offset = axis === 'x' ? ev.clientX - rect.left : ev.clientY - rect.top
    const ratio = Math.min(upper, Math.max(lower, offset / total))
    emit('lines-change', axis, linesIndex, ratio)
  }
  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    document.body.style.cursor = ''
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize'
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
</script>

<style scoped>
.image-preview img {
  display: block;
}
</style>
