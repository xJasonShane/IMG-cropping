<template>
  <div class="home">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        图片裁剪工具
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        上传图片，设置参数，一键裁剪并下载
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <ImageUpload @upload="handleUpload" />
        
        <div v-if="currentImage" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
              {{ currentImage.name }}
            </h3>
            <div class="flex space-x-2">
              <button
                @click="undo"
                :disabled="!canUndo"
                class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="撤销 (Ctrl+Z)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                </svg>
              </button>
              <button
                @click="redo"
                :disabled="!canRedo"
                class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="重做 (Ctrl+Y)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <ImageCropper ref="cropperRef" :image="currentImage" :key="currentImage?.id" />
          
          <div class="mt-6 flex flex-wrap gap-4">
            <button
              @click="cropSingle"
              class="btn-primary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span>下载当前裁剪</span>
            </button>
            
            <button
              @click="cropGrid"
              class="btn-primary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              <span>裁剪网格 ({{ gridRows }}x{{ gridCols }})</span>
            </button>
            
            <button
              @click="cropAll"
              :disabled="isProcessing"
              class="btn-secondary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              <span>{{ isProcessing ? `处理中 ${processingProgress}%` : '批量裁剪所有图片' }}</span>
            </button>
            
            <button
              v-if="images.length > 1"
              @click="exportAllOriginal"
              class="btn-secondary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>导出所有原图</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="space-y-6">
        <SettingsPanel />
        
        <FiltersPanel v-if="currentImage" :cropper="cropperRef?.cropper" />
        
        <div v-if="images.length > 0" class="card">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            图片列表 ({{ images.length }})
          </h3>
          <ImageList />
        </div>
      </div>
    </div>
    
    <div v-if="showToast" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useImageStore } from '../stores/image'
import { useSettingsStore } from '../stores/settings'
import { cropImage, cropGrid as cropGridUtil, createZipFromImages, downloadZip, canvasToBlob } from '../utils/imageProcessing'
import { downloadImage, formatFileSize } from '../utils/helpers'
import JSZip from 'jszip'
import ImageUpload from '../components/ImageUpload.vue'
import ImageCropper from '../components/ImageCropper.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import FiltersPanel from '../components/FiltersPanel.vue'
import ImageList from '../components/ImageList.vue'

const imageStore = useImageStore()
const settingsStore = useSettingsStore()

const cropperRef = ref(null)
const isProcessing = ref(false)
const processingProgress = ref(0)
const showToast = ref(false)
const toastMessage = ref('')

const currentImage = computed(() => imageStore.currentImage)
const images = computed(() => imageStore.images)
const canUndo = computed(() => imageStore.canUndo)
const canRedo = computed(() => imageStore.canRedo)
const gridRows = computed(() => settingsStore.gridRows)
const gridCols = computed(() => settingsStore.gridCols)

const handleUpload = (image) => {
  console.log('Image uploaded:', image.name)
  showNotification(`${image.name} 上传成功`)
}

const showNotification = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const undo = () => {
  imageStore.undo()
}

const redo = () => {
  imageStore.redo()
}

const cropSingle = async () => {
  if (!cropperRef.value?.cropper) return
  
  try {
    const canvas = cropImage(cropperRef.value.cropper, {
      format: `image/${settingsStore.outputFormat}`,
      quality: settingsStore.outputQuality / 100
    })
    
    const blob = await canvasToBlob(
      canvas,
      `image/${settingsStore.outputFormat}`,
      settingsStore.outputQuality / 100
    )
    
    const filename = settingsStore.generateFileName(currentImage.value.name, 0)
    downloadImage(blob, `${filename}.${settingsStore.outputFormat}`)
    showNotification('图片下载成功')
  } catch (error) {
    console.error('Crop error:', error)
    showNotification('裁剪失败，请重试')
  }
}

const cropGrid = async () => {
  if (!cropperRef.value?.cropper) return
  
  try {
    isProcessing.value = true
    processingProgress.value = 0
    
    const pieces = cropGridUtil(
      cropperRef.value.cropper,
      gridRows.value,
      gridCols.value
    )
    
    processingProgress.value = 50
    
    const filenames = pieces.map((_, index) => 
      settingsStore.generateFileName(currentImage.value.name, index)
    )
    
    const zip = await createZipFromImages(pieces, filenames)
    downloadZip(zip, `${currentImage.value.name.replace(/\.[^/.]+$/, '')}_grid.zip`)
    
    processingProgress.value = 100
    showNotification(`成功裁剪 ${pieces.length} 张图片`)
  } catch (error) {
    console.error('Grid crop error:', error)
    showNotification('网格裁剪失败，请重试')
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const cropAll = async () => {
  if (images.value.length === 0) return
  
  try {
    isProcessing.value = true
    processingProgress.value = 0
    
    const allPieces = []
    const allFilenames = []
    const totalImages = images.value.length
    
    for (let i = 0; i < images.value.length; i++) {
      const image = images.value[i]
      imageStore.setCurrentImage(image)
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (cropperRef.value?.cropper) {
        const pieces = cropGridUtil(
          cropperRef.value.cropper,
          gridRows.value,
          gridCols.value
        )
        
        const filenames = pieces.map((_, index) => 
          settingsStore.generateFileName(image.name, index)
        )
        
        allPieces.push(...pieces)
        allFilenames.push(...filenames)
      }
      
      processingProgress.value = Math.round(((i + 1) / totalImages) * 100)
    }
    
    if (allPieces.length > 0) {
      const zip = await createZipFromImages(allPieces, allFilenames)
      downloadZip(zip, 'all_cropped_images.zip')
      showNotification(`成功处理 ${allPieces.length} 张图片`)
    }
  } catch (error) {
    console.error('Batch crop error:', error)
    showNotification('批量处理失败，请重试')
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const exportAllOriginal = async () => {
  if (images.value.length === 0) return
  
  try {
    isProcessing.value = true
    processingProgress.value = 0
    
    const zip = new JSZip()
    const totalImages = images.value.length
    
    for (let i = 0; i < images.value.length; i++) {
      const image = images.value[i]
      
      const response = await fetch(image.dataUrl)
      const blob = await response.blob()
      
      const filename = image.name
      zip.file(filename, blob)
      
      processingProgress.value = Math.round(((i + 1) / totalImages) * 100)
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadZip(zipBlob, 'all_original_images.zip')
    showNotification(`成功导出 ${images.value.length} 张原图`)
  } catch (error) {
    console.error('Export error:', error)
    showNotification('导出失败，请重试')
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const handleKeyboard = (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z') {
      e.preventDefault()
      undo()
    } else if (e.key === 'y') {
      e.preventDefault()
      redo()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
})
</script>