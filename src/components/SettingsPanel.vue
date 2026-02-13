<template>
  <div class="settings-panel card">
    <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
      <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
      分割设置
    </h3>
    
    <div class="space-y-6">
      <div>
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">网格设置</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              行数: <span class="font-semibold text-primary-500">{{ rows }}</span>
            </label>
            <input
              type="range"
              :value="rows"
              @input="$emit('update:rows', Number($event.target.value))"
              min="1"
              max="20"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              列数: <span class="font-semibold text-primary-500">{{ cols }}</span>
            </label>
            <input
              type="range"
              :value="cols"
              @input="$emit('update:cols', Number($event.target.value))"
              min="1"
              max="20"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">快速预设</h4>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="preset in presets"
            :key="preset.label"
            @click="applyPreset(preset)"
            class="px-3 py-2 text-sm rounded-lg border-2 transition-all"
            :class="rows === preset.rows && cols === preset.cols 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 text-gray-700 dark:text-gray-300'"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>
      
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">输出设置</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              输出格式
            </label>
            <select 
              :value="format" 
              @change="$emit('update:format', $event.target.value)"
              class="input-field"
            >
              <option value="png">PNG (无损)</option>
              <option value="jpeg">JPG (压缩)</option>
              <option value="webp">WebP (高效)</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              质量: <span class="font-semibold text-primary-500">{{ quality }}%</span>
            </label>
            <input
              type="range"
              :value="quality"
              @input="$emit('update:quality', Number($event.target.value))"
              min="10"
              max="100"
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              命名模板
            </label>
            <input
              type="text"
              :value="namingTemplate"
              @input="$emit('update:namingTemplate', $event.target.value)"
              class="input-field"
              placeholder="{original}_{index}"
            />
            <p class="text-xs text-gray-400 mt-1">
              {original} = 原文件名, {index} = 序号
            </p>
          </div>
        </div>
      </div>
      
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <span class="text-sm text-gray-700 dark:text-gray-300">分割总数</span>
          <span class="text-lg font-bold text-primary-500">{{ rows * cols }} 张</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: {
    type: Number,
    default: 2
  },
  cols: {
    type: Number,
    default: 2
  },
  format: {
    type: String,
    default: 'png'
  },
  quality: {
    type: Number,
    default: 90
  },
  namingTemplate: {
    type: String,
    default: '{original}_{index}'
  }
})

const emit = defineEmits(['update:rows', 'update:cols', 'update:format', 'update:quality', 'update:namingTemplate'])

const presets = [
  { label: '2×2', rows: 2, cols: 2 },
  { label: '3×3', rows: 3, cols: 3 },
  { label: '4×4', rows: 4, cols: 4 },
  { label: '2×3', rows: 2, cols: 3 },
  { label: '3×4', rows: 3, cols: 4 },
  { label: '4×6', rows: 4, cols: 6 }
]

const applyPreset = (preset) => {
  emit('update:rows', preset.rows)
  emit('update:cols', preset.cols)
}
</script>
