<template>
  <div class="home min-h-screen">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        图片分割工具
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        上传图片，设置分割参数，一键分割并下载
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <ImageUpload 
          @upload="handleUpload" 
          @image-selected="handleImageSelected"
        />
        
        <div v-if="currentImage" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {{ currentImage.name }}
            </h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ imageWidth }} × {{ imageHeight }} px
            </span>
          </div>
          
          <ImagePreview 
            ref="previewRef" 
            :image="currentImage" 
            :rows="gridRows" 
            :cols="gridCols"
          />
          
          <div class="mt-6 flex flex-wrap gap-3">
            <button
              @click="splitImage"
              :disabled="isProcessing"
              class="btn-primary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              <span>{{ isProcessing ? `分割中 ${processingProgress}%` : '分割图片' }}</span>
            </button>
            
            <button
              v-if="uploadedImages.length > 1"
              @click="splitAllImages"
              :disabled="isProcessing"
              class="btn-secondary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
              </svg>
              <span>分割全部 ({{ uploadedImages.length }}张)</span>
            </button>
            
            <button
              v-if="splitPieces.length > 0"
              @click="downloadAll"
              class="btn-primary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span>下载全部 ({{ splitPieces.length }}张)</span>
            </button>
          </div>
        </div>
        
        <div v-if="splitPieces.length > 0" class="card">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            分割结果 ({{ splitPieces.length }} 张)
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="(piece, index) in splitPieces"
              :key="index"
              class="relative group"
            >
              <div class="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <img
                  :src="piece.dataUrl"
                  :alt="`分割图片 ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  #{{ index + 1 }}
                </span>
                <button
                  @click="downloadPiece(index)"
                  class="p-1 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                  title="下载此图片"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="space-y-6">
        <SettingsPanel 
          v-model:rows="gridRows" 
          v-model:cols="gridCols"
          v-model:format="outputFormat"
          v-model:quality="outputQuality"
          v-model:namingTemplate="namingTemplate"
        />
        
        <HistoryPanel />
        
        <div v-if="currentImage" class="card">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            图片信息
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">文件名</span>
              <span class="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[150px]" :title="currentImage.name">
                {{ currentImage.name }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">原始尺寸</span>
              <span class="text-sm font-medium text-gray-800 dark:text-white">
                {{ imageWidth }} × {{ imageHeight }} px
              </span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">文件大小</span>
              <span class="text-sm font-medium text-gray-800 dark:text-white">
                {{ formatFileSize(currentImage.size) }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">分割数量</span>
              <span class="text-sm font-medium text-primary-500">
                {{ gridRows * gridCols }} 张
              </span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">每块尺寸</span>
              <span class="text-sm font-medium text-gray-800 dark:text-white">
                {{ pieceWidth }} × {{ pieceHeight }} px
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Toast
      v-if="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatFileSize } from '../utils/helpers'
import { downloadZip, canvasToBlob } from '../utils/imageProcessing'
import JSZip from 'jszip'
import ImageUpload from '../components/ImageUpload.vue'
import ImagePreview from '../components/ImagePreview.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import Toast from '../components/Toast.vue'
import HistoryPanel from '../components/HistoryPanel.vue'
import { useHistoryStore } from '../stores/history'

const currentImage = ref(null)
const imageWidth = ref(0)
const imageHeight = ref(0)
const splitPieces = ref([])
const uploadedImages = ref([])
const isProcessing = ref(false)
const processingProgress = ref(0)

const gridRows = ref(2)
const gridCols = ref(2)
const outputFormat = ref('png')
const outputQuality = ref(90)
const namingTemplate = ref('{original}_{index}')

const historyStore = useHistoryStore()

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

onMounted(() => {
  historyStore.loadFromLocalStorage()
})

const pieceWidth = computed(() => {
  if (!imageWidth.value) return 0
  return Math.round(imageWidth.value / gridCols.value)
})

const pieceHeight = computed(() => {
  if (!imageHeight.value) return 0
  return Math.round(imageHeight.value / gridRows.value)
})

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
}

const handleUpload = (image) => {
  uploadedImages.value.push(image)
}

const handleImageSelected = (image) => {
  currentImage.value = image
  splitPieces.value = []
  
  const img = new Image()
  img.onload = () => {
    imageWidth.value = img.width
    imageHeight.value = img.height
  }
  img.src = image.dataUrl
}

const splitImage = async () => {
  if (!currentImage.value) return
  
  try {
    isProcessing.value = true
    processingProgress.value = 0
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = currentImage.value.dataUrl
    })
    
    const pieces = []
    const pieceW = Math.floor(img.width / gridCols.value)
    const pieceH = Math.floor(img.height / gridRows.value)
    
    for (let row = 0; row < gridRows.value; row++) {
      for (let col = 0; col < gridCols.value; col++) {
        const canvas = document.createElement('canvas')
        canvas.width = pieceW
        canvas.height = pieceH
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(
          img,
          col * pieceW,
          row * pieceH,
          pieceW,
          pieceH,
          0,
          0,
          pieceW,
          pieceH
        )
        
        const dataUrl = canvas.toDataURL(`image/${outputFormat.value}`, outputQuality.value / 100)
        pieces.push({
          canvas,
          dataUrl,
          row,
          col,
          index: row * gridCols.value + col
        })
        
        processingProgress.value = Math.round(((row * gridCols.value + col + 1) / (gridRows.value * gridCols.value)) * 100)
      }
    }
    
    splitPieces.value = pieces
    
    historyStore.addHistoryItem({
      imageName: currentImage.value.name,
      rows: gridRows.value,
      cols: gridCols.value,
      pieceCount: pieces.length
    })
    
    showToast(`成功分割为 ${pieces.length} 张图片`, 'success')
  } catch (error) {
    console.error('Split error:', error)
    showToast('分割失败，请重试', 'error')
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const splitAllImages = async () => {
  if (uploadedImages.value.length === 0) return
  
  try {
    isProcessing.value = true
    processingProgress.value = 0
    
    const allPieces = []
    const totalImages = uploadedImages.value.length
    
    for (let i = 0; i < uploadedImages.value.length; i++) {
      const image = uploadedImages.value[i]
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = image.dataUrl
      })
      
      const pieceW = Math.floor(img.width / gridCols.value)
      const pieceH = Math.floor(img.height / gridRows.value)
      
      for (let row = 0; row < gridRows.value; row++) {
        for (let col = 0; col < gridCols.value; col++) {
          const canvas = document.createElement('canvas')
          canvas.width = pieceW
          canvas.height = pieceH
          const ctx = canvas.getContext('2d')
          
          ctx.drawImage(
            img,
            col * pieceW,
            row * pieceH,
            pieceW,
            pieceH,
            0,
            0,
            pieceW,
            pieceH
          )
          
          const dataUrl = canvas.toDataURL(`image/${outputFormat.value}`, outputQuality.value / 100)
          allPieces.push({
            canvas,
            dataUrl,
            row,
            col,
            index: allPieces.length,
            originalImageName: image.name
          })
        }
      }
      
      processingProgress.value = Math.round(((i + 1) / totalImages) * 100)
    }
    
    splitPieces.value = allPieces
    
    uploadedImages.value.forEach((image, index) => {
      historyStore.addHistoryItem({
        imageName: image.name,
        rows: gridRows.value,
        cols: gridCols.value,
        pieceCount: gridRows.value * gridCols.value
      })
    })
    
    showToast(`成功分割 ${uploadedImages.value.length} 张图片，共 ${allPieces.length} 个分块`, 'success')
  } catch (error) {
    console.error('Split all error:', error)
    showToast('批量分割失败，请重试', 'error')
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const generateFileName = (index, originalName = null) => {
  const name = originalName || currentImage.value?.name?.replace(/\.[^/.]+$/, '') || 'image'
  return namingTemplate.value
    .replace('{original}', name.replace(/\.[^/.]+$/, ''))
    .replace('{index}', String(index + 1).padStart(3, '0'))
}

const downloadPiece = async (index) => {
  const piece = splitPieces.value[index]
  if (!piece) return
  
  const blob = await canvasToBlob(piece.canvas, `image/${outputFormat.value}`, outputQuality.value / 100)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${generateFileName(index, piece.originalImageName)}.${outputFormat.value}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  showToast('图片下载成功', 'success')
}

const downloadAll = async () => {
  if (splitPieces.value.length === 0) return
  
  try {
    isProcessing.value = true
    processingProgress.value = 0
    
    const zip = new JSZip()
    
    for (let i = 0; i < splitPieces.value.length; i++) {
      const piece = splitPieces.value[i]
      const blob = await canvasToBlob(piece.canvas, `image/${outputFormat.value}`, outputQuality.value / 100)
      const filename = `${generateFileName(i, piece.originalImageName)}.${outputFormat.value}`
      zip.file(filename, blob)
      processingProgress.value = Math.round(((i + 1) / splitPieces.value.length) * 100)
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const originalName = currentImage.value?.name?.replace(/\.[^/.]+$/, '') || 'images'
    downloadZip(zipBlob, `${originalName}_split.zip`)
    
    showToast(`成功下载 ${splitPieces.value.length} 张图片`, 'success')
  } catch (error) {
    console.error('Download error:', error)
    showToast('下载失败，请重试', 'error')
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}
</script>
