<template>
  <div class="home">
    <!-- 操作流程引导：纯展示，状态由应用数据派生 -->
    <ol class="flex items-center flex-wrap gap-y-2 gap-x-2 sm:gap-x-3 mb-6" aria-label="操作流程">
      <li v-for="(step, i) in steps" :key="step.label" class="flex items-center gap-2">
        <span
          class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors"
          :class="step.state === 'done'
            ? 'bg-primary-500 text-white'
            : step.state === 'active'
              ? 'border-2 border-primary-500 text-primary-500'
              : 'border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'"
          :aria-current="step.state === 'active' ? 'step' : undefined"
        >
          <svg v-if="step.state === 'done'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span
          class="text-sm font-medium"
          :class="step.state === 'active'
            ? 'text-gray-900 dark:text-white'
            : step.state === 'done'
              ? 'text-gray-600 dark:text-gray-300'
              : 'text-gray-400 dark:text-gray-500'"
        >
          {{ step.label }}
        </span>
      </li>
      <li
        v-for="i in steps.length - 1"
        :key="'sep-' + i"
        class="hidden sm:block w-6 h-px bg-gray-300 dark:bg-gray-600"
        aria-hidden="true"
      ></li>
    </ol>

    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6">
      <!-- ① 上传区 -->
      <section class="lg:col-start-1 lg:row-start-1" aria-label="上传图片">
        <ImageUpload />
      </section>

      <!-- ② 设置栏：桌面端居右，移动端位于上传与预览之间，符合操作顺序 -->
      <aside
        class="space-y-6 lg:col-start-2 lg:row-start-1"
        :class="{ 'lg:row-span-3': imageStore.currentImage }"
        aria-label="分割设置"
      >
        <SettingsPanel
          :rows="settingsStore.gridRows"
          :cols="settingsStore.gridCols"
          :format="settingsStore.outputFormat"
          :quality="settingsStore.outputQuality"
          :naming-template="settingsStore.namingTemplate"
          :split-mode="settingsStore.splitMode"
          :gap-size="settingsStore.gapSize"
          :trim-size="settingsStore.trimSize"
          :scale-target="settingsStore.scaleTarget"
          @update:rows="settingsStore.setGridRows"
          @update:cols="settingsStore.setGridCols"
          @update:format="settingsStore.setOutputFormat"
          @update:quality="settingsStore.setOutputQuality"
          @update:namingTemplate="settingsStore.setNamingTemplate"
          @update:splitMode="settingsStore.setSplitMode"
          @update:gapSize="settingsStore.setGapSize"
          @update:trimSize="settingsStore.setTrimSize"
          @update:scaleTarget="settingsStore.setScaleTarget"
        />

        <div v-if="imageStore.currentImage" class="card">
          <h3 class="panel-title">
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
      </aside>

      <!-- ③ 预览与操作 -->
      <section v-if="imageStore.currentImage" class="card lg:col-start-1" aria-label="预览与分割操作">
        <div class="flex items-center justify-between mb-4">
          <h3 class="panel-title mb-0">
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
          :x-lines="previewXLines"
          :y-lines="previewYLines"
          :editable="settingsStore.splitMode === 'custom'"
          @lines-change="handleLinesChange"
        />

        <!-- 主操作条：分割 → 下载，按流程从左到右排列 -->
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap gap-3">
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-2-2v-6z"></path>
              </svg>
              <span>分割全部 ({{ imageStore.uploadedImages.length }}张)</span>
            </button>

            <button
              v-if="imageStore.splitPieces.length > 0"
              @click="imageStore.isDownloading ? imageStore.cancelDownload() : downloadAll()"
              :disabled="imageStore.isProcessing && !imageStore.isDownloading"
              class="btn-primary flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span v-if="imageStore.isDownloading">取消下载</span>
              <span v-else>下载全部 ({{ imageStore.splitPieces.length }}张)</span>
            </button>
          </div>

          <div v-if="imageStore.isProcessing" class="mt-4">
            <div class="flex items-center justify-between mb-2 text-sm">
              <span class="text-gray-600 dark:text-gray-300">{{ imageStore.processingLabel || '处理中...' }}</span>
              <span class="text-primary-500 font-semibold">{{ imageStore.processingProgress }}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300"
                :style="{ width: imageStore.processingProgress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ④ 分割结果 -->
      <section v-if="imageStore.splitPieces.length > 0" class="card lg:col-start-1" aria-label="分割结果">
        <h3 class="panel-title">
          <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
          分割结果
          <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            {{ imageStore.splitPieces.length }} 张 · {{ imageStore.displayRows }} 行 × {{ imageStore.displayCols }} 列
          </span>
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
            class="relative group [content-visibility:auto] [contain-intrinsic-size:auto_300px]"
          >
            <div class="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <img
                :src="piece.url"
                :alt="`分割图片 ${index + 1}`"
                loading="lazy"
                decoding="async"
                class="w-full h-auto cursor-zoom-in"
                @click="lightboxIndex = index"
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
      </section>
    </div>

    <!-- 分块灯箱预览 -->
    <TransitionRoot appear :show="lightboxIndex >= 0" as="template">
      <Dialog as="div" class="relative z-50" @close="lightboxIndex = -1">
        <TransitionChild
          as="template"
          enter="duration-200 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/85" />
        </TransitionChild>

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            class="w-full max-w-5xl max-h-full flex flex-col items-center"
            v-if="lightboxPiece"
          >
            <img
              :src="lightboxPiece.url"
              :alt="`分割图片 ${lightboxIndex + 1}`"
              class="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
            <div class="mt-4 flex items-center gap-3">
              <button
                type="button"
                class="btn-primary"
                @click="downloadPiece(lightboxIndex); lightboxIndex = -1"
              >
                下载此图
              </button>
              <button
                type="button"
                class="btn-secondary"
                @click="lightboxIndex = -1"
              >
                关闭
              </button>
              <span class="text-sm text-gray-300 ml-2">
                {{ lightboxIndex + 1 }} / {{ imageStore.splitPieces.length }}
              </span>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </TransitionRoot>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
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

// 灯箱：当前预览的分块索引，-1 为关闭
const lightboxIndex = ref(-1)
const lightboxPiece = computed(() => imageStore.splitPieces[lightboxIndex.value] || null)

// 流程引导（纯展示）：上传 → 调整参数 → 分割下载，由应用数据派生当前所处环节
const steps = computed(() => {
  const hasImage = !!imageStore.currentImage
  const hasPieces = imageStore.splitPieces.length > 0
  const busy = imageStore.isProcessing || imageStore.isDownloading

  const current = !hasImage ? 1 : (hasPieces || busy ? 3 : 2)
  return [
    { label: '上传图片', state: hasImage ? 'done' : current === 1 ? 'active' : '' },
    { label: '调整参数', state: current === 2 ? 'active' : current > 2 ? 'done' : '' },
    { label: '分割下载', state: hasPieces && !busy ? 'done' : current === 3 ? 'active' : '' }
  ]
})

// 预览边界线（百分比，含端点）：自定义模式用拖拽线，等分模式按行列数生成
const previewXLines = computed(() => {
  const s = settingsStore
  if (s.splitMode === 'custom' && s.xInnerLines.length > 0) {
    return [0, ...s.xInnerLines, 1]
  }
  return Array.from({ length: s.gridCols + 1 }, (_, i) => i / s.gridCols)
})

const previewYLines = computed(() => {
  const s = settingsStore
  if (s.splitMode === 'custom' && s.yInnerLines.length > 0) {
    return [0, ...s.yInnerLines, 1]
  }
  return Array.from({ length: s.gridRows + 1 }, (_, i) => i / s.gridRows)
})

// 拖拽回调：linesIndex 为全量边界线数组中的索引（内线索引 = linesIndex - 1）
const handleLinesChange = (axis, linesIndex, ratio) => {
  const s = settingsStore
  if (axis === 'x') {
    const arr = [...s.xInnerLines]
    arr[linesIndex - 1] = ratio
    s.setCustomLines(arr, [...s.yInnerLines])
  } else {
    const arr = [...s.yInnerLines]
    arr[linesIndex - 1] = ratio
    s.setCustomLines([...s.xInnerLines], arr)
  }
}

// 默认命名（复用 store 实现，custom 为空时即返回模板命名）
const getDefaultFileName = (index, originalName = null) => {
  return imageStore.generateFileName(index, originalName)
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
  const result = await imageStore.downloadPiece(index)
  if (result?.success) {
    if (result.warning) {
      toastStore.showToast(`文件名非法：${result.warning}，已使用默认命名下载`, 'error')
    } else {
      toastStore.showToast('图片下载成功', 'success')
    }
  } else {
    toastStore.showToast(result?.error || '下载失败，请重试', 'error')
  }
}

const downloadAll = async () => {
  const result = await imageStore.downloadAll()
  if (result?.cancelled) {
    toastStore.showToast('已取消下载', 'info')
    return
  }
  if (result?.success) {
    if (result.invalidNameCount > 0) {
      toastStore.showToast(`下载成功，但 ${result.invalidNameCount} 个自定义文件名非法，已回退为默认命名`, 'error')
    } else {
      toastStore.showToast(`成功下载 ${result.count} 张图片`, 'success')
    }
  } else {
    toastStore.showToast(result?.error || '下载失败，请重试', 'error')
  }
}
</script>
