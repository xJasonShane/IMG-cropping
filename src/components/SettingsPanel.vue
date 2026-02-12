<template>
  <div class="settings-panel space-y-6">
    <div class="card">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">裁剪网格</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            行数: {{ gridRows }}
          </label>
          <input
            type="range"
            v-model.number="gridRows"
            min="1"
            max="20"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            列数: {{ gridCols }}
          </label>
          <input
            type="range"
            v-model.number="gridCols"
            min="1"
            max="20"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">比例设置</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            预设比例
          </label>
          <select v-model="aspectRatio" class="input-field">
            <option v-for="ratio in aspectRatios" :key="ratio.value" :value="ratio.value">
              {{ ratio.label }}
            </option>
          </select>
        </div>
        
        <div v-if="aspectRatio === 'custom'" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              宽度
            </label>
            <input
              type="number"
              v-model.number="customAspectRatio.width"
              min="1"
              class="input-field"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              高度
            </label>
            <input
              type="number"
              v-model.number="customAspectRatio.height"
              min="1"
              class="input-field"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            预设模板
          </label>
          <select v-model="selectedPreset" class="input-field">
            <option :value="null">无</option>
            <option v-for="preset in presetTemplates" :key="preset.name" :value="preset">
              {{ preset.name }} ({{ preset.width }}x{{ preset.height }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">输出尺寸</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            自定义尺寸
          </label>
          <button
            @click="useCustomSize = !useCustomSize"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="useCustomSize ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="useCustomSize ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
        
        <template v-if="useCustomSize">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                宽度 (px)
              </label>
              <input
                type="number"
                v-model.number="outputWidth"
                min="1"
                placeholder="自动"
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                高度 (px)
              </label>
              <input
                type="number"
                v-model.number="outputHeight"
                min="1"
                placeholder="自动"
                class="input-field"
              />
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="maintainRatio"
              v-model="maintainAspectRatio"
              class="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <label for="maintainRatio" class="text-sm text-gray-700 dark:text-gray-300">
              保持宽高比
            </label>
          </div>
        </template>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">输出设置</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输出格式
          </label>
          <select v-model="outputFormat" class="input-field">
            <option value="png">PNG (无损)</option>
            <option value="jpeg">JPG (压缩)</option>
            <option value="webp">WebP (高效)</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            质量: {{ outputQuality }}%
          </label>
          <input
            type="range"
            v-model.number="outputQuality"
            min="10"
            max="100"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>最小</span>
            <span>最佳</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">命名规则</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            命名模板
          </label>
          <input
            v-model="namingTemplate"
            type="text"
            class="input-field"
            placeholder="{original}_{index}"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            可用变量: {original} - 原文件名, {index} - 序号
          </p>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <button
            v-for="template in namingTemplates"
            :key="template"
            @click="namingTemplate = template"
            class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {{ template }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

const gridRows = computed({
  get: () => settingsStore.gridRows,
  set: (value) => settingsStore.setGridRows(value)
})

const gridCols = computed({
  get: () => settingsStore.gridCols,
  set: (value) => settingsStore.setGridCols(value)
})

const aspectRatio = computed({
  get: () => settingsStore.aspectRatio,
  set: (value) => settingsStore.setAspectRatio(value)
})

const customAspectRatio = computed({
  get: () => settingsStore.customAspectRatio,
  set: (value) => settingsStore.setCustomAspectRatio(value.width, value.height)
})

const outputFormat = computed({
  get: () => settingsStore.outputFormat,
  set: (value) => settingsStore.setOutputFormat(value)
})

const outputQuality = computed({
  get: () => settingsStore.outputQuality,
  set: (value) => settingsStore.setOutputQuality(value)
})

const namingTemplate = computed({
  get: () => settingsStore.namingTemplate,
  set: (value) => settingsStore.setNamingTemplate(value)
})

const aspectRatios = computed(() => settingsStore.aspectRatios)
const presetTemplates = computed(() => settingsStore.presetTemplates)

const selectedPreset = computed({
  get: () => settingsStore.presetTemplate,
  set: (value) => settingsStore.setPresetTemplate(value)
})

const useCustomSize = ref(false)

const outputWidth = computed({
  get: () => settingsStore.outputWidth,
  set: (value) => settingsStore.setOutputWidth(value)
})

const outputHeight = computed({
  get: () => settingsStore.outputHeight,
  set: (value) => settingsStore.setOutputHeight(value)
})

const maintainAspectRatio = computed({
  get: () => settingsStore.maintainAspectRatio,
  set: (value) => settingsStore.setMaintainAspectRatio(value)
})

watch(selectedPreset, (preset) => {
  if (preset) {
    useCustomSize.value = true
  }
})

const namingTemplates = [
  '{original}_{index}',
  '{original}_cropped_{index}',
  'crop_{index}',
  'img_{index}',
  '{original}'
]
</script>
