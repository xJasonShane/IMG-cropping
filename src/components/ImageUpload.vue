<template>
  <div class="card">
    <!-- 空状态：完整拖放区；已有图片后折叠为一行紧凑入口，避免与预览区重复占位 -->
    <div
      v-if="images.length === 0"
      class="upload-zone border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      :class="[
        isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 transform scale-105' : 'hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-lg'
      ]"
      role="button"
      tabindex="0"
      aria-label="上传图片区域：拖放图片或按回车键选择文件"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      @keydown.enter.prevent="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        class="hidden"
        aria-label="选择图片文件"
        @change="handleFileSelect"
      />

      <div class="flex flex-col items-center space-y-4">
        <div
          class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center transition-transform duration-300"
          :class="isDragging ? 'scale-110' : ''"
        >
          <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>

        <div>
          <p class="text-lg font-medium text-gray-700 dark:text-gray-300">
            拖放图片到这里或点击上传
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            支持 JPG、PNG、WebP 格式，支持批量上传
          </p>
        </div>

        <button class="btn-primary" type="button">
          选择图片
        </button>
      </div>
    </div>

    <!-- 折叠态：标题行 + 添加入口 + 缩略图列表 -->
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
          已上传图片 ({{ images.length }}张)
        </h4>
        <button type="button" class="btn-secondary" @click="triggerFileInput">
          添加图片
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          class="hidden"
          aria-label="选择图片文件"
          @change="handleFileSelect"
        />
      </div>
      <div class="flex flex-wrap gap-2 mt-3">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="relative group"
        >
          <div class="relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer"
               :class="[
                 currentImageId === image.id ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
               ]"
               @click="selectImage(image)">
            <img :src="image.url" :alt="image.name" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <button
                @click.stop="removeImage(index)"
                class="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors pointer-events-auto"
                title="删除此图片"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate text-center mt-1">
            {{ imageNameShort(image.name) }}
          </p>
        </div>
      </div>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">
        提示：将图片拖到页面任意位置也可快速上传
      </p>
    </template>

    <!-- 整页拖放遮罩：拖拽文件到页面任意位置均可上传 -->
    <Teleport to="body">
      <div
        v-if="isPageDragging"
        class="fixed inset-0 z-50 bg-primary-500/10 dark:bg-primary-400/10 backdrop-blur-sm flex items-center justify-center pointer-events-none"
      >
        <div class="border-4 border-dashed border-primary-500 rounded-2xl w-full h-full m-4 flex items-center justify-center">
          <div class="bg-white dark:bg-gray-800 rounded-2xl px-8 py-6 shadow-2xl text-center">
            <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">松开鼠标上传图片</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">支持批量拖放</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useImageStore } from '../stores/image'
import { useToastStore } from '../stores/toast'
import { validateImageFile, generateId } from '../utils/helpers'

const imageStore = useImageStore()
const toastStore = useToastStore()
const fileInput = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const images = ref([])
const currentImageId = ref(null)
const isPageDragging = ref(false)

// 整页拖放深度计数：子元素会反复触发 enter/leave，计数归零才隐藏遮罩
let dragDepth = 0

const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files')

const onPageDragEnter = (e) => {
  if (!hasFiles(e)) return
  e.preventDefault()
  dragDepth++
  isPageDragging.value = true
}

const onPageDragOver = (e) => {
  // 必须 preventDefault 才允许 drop
  if (hasFiles(e)) e.preventDefault()
}

const onPageDragLeave = (e) => {
  if (!hasFiles(e)) return
  e.preventDefault()
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) {
    isPageDragging.value = false
  }
}

const onPageDrop = async (e) => {
  if (!hasFiles(e)) return
  e.preventDefault()
  dragDepth = 0
  isPageDragging.value = false
  // 上传区自身已处理过的 drop 不重复处理（其 handler 已 preventDefault）
  if (e.defaultPrevented && e.target.closest?.('.upload-zone')) return
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length > 0) {
    await processFiles(files)
  }
}

onMounted(() => {
  window.addEventListener('dragenter', onPageDragEnter)
  window.addEventListener('dragover', onPageDragOver)
  window.addEventListener('dragleave', onPageDragLeave)
  window.addEventListener('drop', onPageDrop)
})

onUnmounted(() => {
  window.removeEventListener('dragenter', onPageDragEnter)
  window.removeEventListener('dragover', onPageDragOver)
  window.removeEventListener('dragleave', onPageDragLeave)
  window.removeEventListener('drop', onPageDrop)
})

const imageNameShort = (name) => {
  if (name.length > 10) {
    return name.substring(0, 10) + '...'
  }
  return name
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  await processFiles(files)
}

const triggerFileInput = () => {
  if (!isProcessing.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files)
  await processFiles(files)
  e.target.value = ''
}

const processFiles = async (files) => {
  if (isProcessing.value) return

  // 空入参（如 change 事件被程序性触发）静默忽略，避免误报错误提示
  if (!files || files.length === 0) return

  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) {
    toastStore.showToast('请选择有效的图片文件（JPG、PNG、WebP）', 'error')
    return
  }

  isProcessing.value = true
  let successCount = 0
  
  for (const file of imageFiles) {
    try {
      validateImageFile(file)

      // 使用 objectURL 引用原始文件，避免 base64 dataURL 常驻内存导致多图上传时内存暴涨
      const url = URL.createObjectURL(file)
      if (!url) {
        throw new Error('文件读取失败，请重试')
      }

      const image = {
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url
      }
      
      images.value.push(image)
      imageStore.addUploadedImage(image)
      
      if (images.value.length === 1) {
        selectImage(image)
      }
      
      successCount++
    } catch (error) {
      console.error('File processing error:', error)
      toastStore.showToast(file.name + ': ' + error.message, 'error')
    }
  }
  
  if (successCount > 0) {
    toastStore.showToast('成功上传 ' + successCount + ' 张图片', 'success')
  }
  
  isProcessing.value = false
}

const selectImage = (image) => {
  currentImageId.value = image.id
  imageStore.setImage(image)
}

const removeImage = (index) => {
  const removed = images.value[index]
  images.value.splice(index, 1)
  imageStore.removeUploadedImage(index)
  
  if (currentImageId.value === removed.id) {
    if (images.value.length > 0) {
      selectImage(images.value[0])
    } else {
      currentImageId.value = null
    }
  }
}
</script>
