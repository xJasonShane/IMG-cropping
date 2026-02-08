<template>
  <div class="image-list">
    <div v-if="images.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
      暂无图片，请上传
    </div>
    
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="image in images"
        :key="image.id"
        class="relative group cursor-pointer"
        @click="selectImage(image)"
      >
        <div
          class="aspect-square rounded-lg overflow-hidden border-2 transition-all"
          :class="{
            'border-primary-500 ring-2 ring-primary-500': currentImage?.id === image.id,
            'border-gray-200 dark:border-gray-700': currentImage?.id !== image.id
          }"
        >
          <img
            :src="image.dataUrl"
            :alt="image.name"
            class="w-full h-full object-cover"
          />
        </div>
        
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <button
            @click.stop="removeImage(image.id)"
            class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="删除"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
        
        <div class="mt-2">
          <p class="text-sm text-gray-700 dark:text-gray-300 truncate" :title="image.name">
            {{ image.name }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatFileSize(image.size) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useImageStore } from '../stores/image'
import { formatFileSize } from '../utils/helpers'

const imageStore = useImageStore()

const images = computed(() => imageStore.images)
const currentImage = computed(() => imageStore.currentImage)

const selectImage = (image) => {
  imageStore.setCurrentImage(image)
}

const removeImage = (imageId) => {
  if (confirm('确定要删除这张图片吗？')) {
    imageStore.removeImage(imageId)
  }
}
</script>