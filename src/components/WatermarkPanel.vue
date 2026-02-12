<template>
  <div class="watermark-panel card">
    <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
      </svg>
      水印设置
    </h3>
    
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          启用水印
        </label>
        <button
          @click="enabled = !enabled"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="enabled ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
      
      <template v-if="enabled">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            水印类型
          </label>
          <div class="flex space-x-2">
            <button
              @click="type = 'text'"
              class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
              :class="type === 'text' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            >
              文字
            </button>
            <button
              @click="type = 'image'"
              class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
              :class="type === 'image' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            >
              图片
            </button>
          </div>
        </div>
        
        <template v-if="type === 'text'">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              水印文字
            </label>
            <input
              v-model="text"
              type="text"
              class="input-field"
              placeholder="请输入水印文字"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              字体大小: {{ fontSize }}px
            </label>
            <input
              type="range"
              v-model.number="fontSize"
              min="12"
              max="72"
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              文字颜色
            </label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                v-model="color"
                class="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                v-model="color"
                class="input-field flex-1"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </template>
        
        <template v-else>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              水印图片
            </label>
            <div
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500 transition-colors"
              @click="triggerImageUpload"
            >
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
              <template v-if="imageUrl">
                <img :src="imageUrl" class="max-h-20 mx-auto mb-2" />
                <p class="text-sm text-gray-500 dark:text-gray-400">点击更换图片</p>
              </template>
              <template v-else>
                <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-sm text-gray-500 dark:text-gray-400">点击上传水印图片</p>
              </template>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              缩放比例: {{ scale }}%
            </label>
            <input
              type="range"
              v-model.number="scale"
              min="10"
              max="100"
              class="w-full"
            />
          </div>
        </template>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            透明度: {{ opacity }}%
          </label>
          <input
            type="range"
            v-model.number="opacity"
            min="10"
            max="100"
            class="w-full"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            位置
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="pos in positions"
              :key="pos.value"
              @click="position = pos.value"
              class="py-2 px-3 rounded-lg text-xs font-medium transition-all"
              :class="position === pos.value ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            >
              {{ pos.label }}
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            旋转角度: {{ rotation }}°
          </label>
          <input
            type="range"
            v-model.number="rotation"
            min="-180"
            max="180"
            class="w-full"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const imageInput = ref(null)

const positions = [
  { label: '左上', value: 'top-left' },
  { label: '上中', value: 'top-center' },
  { label: '右上', value: 'top-right' },
  { label: '左中', value: 'middle-left' },
  { label: '居中', value: 'center' },
  { label: '右中', value: 'middle-right' },
  { label: '左下', value: 'bottom-left' },
  { label: '下中', value: 'bottom-center' },
  { label: '右下', value: 'bottom-right' }
]

const enabled = computed({
  get: () => settingsStore.watermark.enabled,
  set: (value) => settingsStore.updateWatermark({ enabled: value })
})

const type = computed({
  get: () => settingsStore.watermark.type,
  set: (value) => settingsStore.updateWatermark({ type: value })
})

const text = computed({
  get: () => settingsStore.watermark.text,
  set: (value) => settingsStore.updateWatermark({ text: value })
})

const fontSize = computed({
  get: () => settingsStore.watermark.fontSize,
  set: (value) => settingsStore.updateWatermark({ fontSize: value })
})

const color = computed({
  get: () => settingsStore.watermark.color,
  set: (value) => settingsStore.updateWatermark({ color: value })
})

const opacity = computed({
  get: () => settingsStore.watermark.opacity,
  set: (value) => settingsStore.updateWatermark({ opacity: value })
})

const position = computed({
  get: () => settingsStore.watermark.position,
  set: (value) => settingsStore.updateWatermark({ position: value })
})

const rotation = computed({
  get: () => settingsStore.watermark.rotation,
  set: (value) => settingsStore.updateWatermark({ rotation: value })
})

const scale = computed({
  get: () => settingsStore.watermark.scale,
  set: (value) => settingsStore.updateWatermark({ scale: value })
})

const imageUrl = computed(() => settingsStore.watermark.imageUrl)

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageSelect = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      settingsStore.updateWatermark({ imageUrl: event.target.result })
    }
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}
</script>
