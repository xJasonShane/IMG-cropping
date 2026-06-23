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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2 space-y-6">
        <ImageUpload 
          @upload="handleUpload" 
          @image-selected="handleImageSelected"
        />
        
        <div v-if="imageStore.currentImage" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"></path>
              </svg>
              {{ imageStore.currentImage.name }}
            </h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ imageStore.imageWidth }} × {{ imageStore.imageHeight }} px
            </span>
          </div>
          
          <ImagePreview 
            ref="previewRef" 
            :image="imageStore.currentImage" 
            :rows="settingsStore.gridRows" 
            :cols="settingsStore.gridCols"
          />
          
          <div class="mt-6 flex flex-wrap gap-3">
            <button
              @click="splitImage"
              :disabled="imageStore.isProcessing"
              class="btn-primary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              <span>{{ imageStore.isProcessing ? `分割中 ${imageStore.processingProgress}%` : '分割图片' }}</span>
            </button>
            
            <button
              v-if="imageStore.uploadedImages.length > 1"
              @click="splitAllImages"
              :disabled="imageStore.isProcessing"
              class="btn-secondary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
              </svg>
              <span>分割全部 ({{ imageStore.uploadedImages.length }}张)</span>
            </button>
            
            <button
              v-if="imageStore.splitPieces.length > 0"
              @click="downloadAll"
              class="btn-primary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span>下载全部 ({{ imageStore.splitPieces.length }}张)</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="space-y-6">
        <SettingsPanel 
          v-model:rows="settingsStore.gridRows" 
          v-model:cols="settingsStore.gridCols"
          v-model:format="settingsStore.outputFormat"
          v-model:quality="settingsStore.outputQuality"
          v-model:namingTemplate="settingsStore.namingTemplate"
        />
        
        <div v-if="imageStore.currentImage" class="card">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            图片信息
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">文件名</span>
              <span class="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[150px]" :title="imageStore.currentImage.name">
                {{ imageStore.currentImage.name }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">原始尺寸</span>
              <span class="text-sm font-medium text-gray-800 dark:text-white">
                {{ imageStore.imageWidth }} × {{ imageStore.imageHeight }} px
              </span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">文件大小</span>
              <span class="text-sm font-medium text-gray-800 dark:text-white">
                {{ formatFileSize(imageStore.currentImage.size) }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">分割数量</span>
              <span class="text-sm font-medium text-primary-500">
                {{ settingsStore.gridRows * settingsStore.gridCols }} 张
              </span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">每块尺寸</span>
              <span class="text-sm font-medium text-gray-800 dark:text-white">
                {{ imageStore.pieceWidth }} × {{ imageStore.pieceHeight }} px
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="imageStore.splitPieces.length > 0" class="card">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
        <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
        分割结果 ({{ imageStore.splitPieces.length }} 张) - {{ imageStore.displayRows }} 行 × {{ imageStore.displayCols }} 列
      </h3>
      <div 
        class="grid gap-2"
        :style="{
          gridTemplateColumns: `repeat(${imageStore.displayCols}, minmax(0, 1fr))`
        }"
      >
        <div
          v-for="(piece, index) in imageStore.splitPieces"
          :key="index"
          class="relative group"
        >
          <div class="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <img
              :src="piece.dataUrl"
              :alt="`分割图片 ${index + 1}`"
              class="w-full h-auto"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                @click="downloadPiece(index)"
                class="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                title="下载此图片"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="mt-2 space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">
                #{{ index + 1 }}
              </span>
              <input
                type="text"
                :value="getDisplayFileName(index, piece.originalImageName)"
                @input="handleFileNameInput(index, $event.target.value, piece.originalImageName)"
                :class="getInputClass(index, piece.originalImageName)"
                :placeholder="`默认: ${getDefaultFileName(index, piece.originalImageName)}`"
              />
            </div>
            <p 
              v-if="imageStore.getCustomFileName(index) && !imageStore.validateFileName(imageStore.getCustomFileName(index)).valid"
              class="text-xs text-red-500"
            >
              {{ imageStore.validateFileName(imageStore.getCustomFileName(index)).error }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatFileSize } from '../utils/helpers'
import { useImageStore } from '../stores/image'
import { useSettingsStore } from '../stores/settings'
import { useToastStore } from '../stores/toast'
import ImageUpload from '../components/ImageUpload.vue'
import ImagePreview from '../components/ImagePreview.vue'
import SettingsPanel from '../components/SettingsPanel.vue'

const imageStore = useImageStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()

const previewRef = ref(null)

const handleUpload = (image) => {
  imageStore.addUploadedImage(image)
}

const handleImageSelected = (image) => {
  imageStore.setImage(image)
}

const getDefaultFileName = (index, originalName = null) => {
  const name = originalName || imageStore.currentImage?.name?.replace(/\.[^/.]+$/, '') || 'image'
  return settingsStore.namingTemplate
    .replace('{original}', name.replace(/\.[^/.]+$/, ''))
    .replace('{index}', String(index + 1).padStart(3, '0'))
}

const getDisplayFileName = (index, originalName = null) => {
  const custom = imageStore.getCustomFileName(index)
  return custom || ''
}

const getInputClass = (index, originalName = null) => {
  let classes = 'flex-1 min-w-0 text-xs px-2 py-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500'
  
  const hasCustom = imageStore.getCustomFileName(index)
  
  if (hasCustom) {
    const validation = imageStore.validateFileName(hasCustom)
    if (!validation.valid) {
      classes += ' border-red-500'
    } else {
      classes += ' border-primary-500 bg-primary-50 dark:bg-primary-900/20'
    }
  }
  
  return classes
}

const handleFileNameInput = (index, value, originalName = null) => {
  imageStore.setCustomFileName(index, value)
}

const splitImage = async () => {
  const result = await imageStore.splitImage()
  if (result?.success) {
    toastStore.showToast(`成功分割为 ${result.count} 张图片`, 'success')
  } else {
    toastStore.showToast('分割失败，请重试', 'error')
  }
}

const splitAllImages = async () => {
  const result = await imageStore.splitAllImages()
  if (result?.success) {
    toastStore.showToast(`成功分割 ${result.imageCount} 张图片，共 ${result.pieceCount} 个分块`, 'success')
  } else {
    toastStore.showToast('批量分割失败，请重试', 'error')
  }
}

const downloadPiece = async (index) => {
  await imageStore.downloadPiece(index)
  toastStore.showToast('图片下载成功', 'success')
}

const downloadAll = async () => {
  const result = await imageStore.downloadAll()
  if (result?.success) {
    toastStore.showToast(`成功下载 ${result.count} 张图片`, 'success')
  } else {
    toastStore.showToast('下载失败，请重试', 'error')
  }
}
</script>
