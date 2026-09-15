<template>
  <div class="settings-panel card">
    <h3 class="panel-title">
      <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
      分割设置
      <span class="ml-auto px-2 py-0.5 text-xs font-semibold rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
        共 {{ rows * cols }} 张
      </span>
    </h3>

    <div class="space-y-4">
      <!-- ① 网格设置（含快速预设） -->
      <section aria-label="网格设置">
        <h4 class="section-title"><span class="step-badge">1</span>网格设置</h4>

        <div class="flex rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden mb-3">
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium transition-all"
            :class="splitMode === 'grid'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            @click="$emit('update:splitMode', 'grid')"
          >
            等分分割
          </button>
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium transition-all"
            :class="splitMode === 'custom'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            @click="$emit('update:splitMode', 'custom')"
          >
            自定义分割线
          </button>
        </div>
        <p v-if="splitMode === 'custom'" class="text-xs text-primary-500/90 mb-3">
          已切换到自定义模式：在预览图上拖动高亮分割线，调整各分块大小
        </p>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="grid-rows" class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1.5">
              <span>行数</span>
              <span class="font-semibold text-primary-500">{{ rows }}</span>
            </label>
            <input
              type="range"
              id="grid-rows"
              :value="rows"
              @input="$emit('update:rows', Number($event.target.value))"
              min="1"
              max="20"
              class="w-full"
            />
          </div>
          <div>
            <label for="grid-cols" class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1.5">
              <span>列数</span>
              <span class="font-semibold text-primary-500">{{ cols }}</span>
            </label>
            <input
              type="range"
              id="grid-cols"
              :value="cols"
              @input="$emit('update:cols', Number($event.target.value))"
              min="1"
              max="20"
              class="w-full"
            />
          </div>
        </div>

        <!-- 快速预设：网格设置的快捷入口，视觉上次一级 -->
        <div class="mt-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1.5">快速预设</p>
          <div class="grid grid-cols-6 gap-1.5">
            <button
              v-for="preset in presets"
              :key="preset.label"
              @click="applyPreset(preset)"
              class="py-1.5 text-xs rounded-md border transition-all"
              :class="rows === preset.rows && cols === preset.cols
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/25 text-primary-600 dark:text-primary-400 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 text-gray-600 dark:text-gray-300'"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- ② 间隙与裁边 -->
      <section class="pt-4 border-t border-gray-200 dark:border-gray-700" aria-label="间隙与裁边">
        <h4 class="section-title"><span class="step-badge">2</span>间隙与裁边</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="gap-size" class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1.5">
              <span>分块间隙</span>
              <span class="font-semibold text-primary-500">{{ gapSize }}px</span>
            </label>
            <input
              type="range"
              id="gap-size"
              :value="gapSize"
              @input="$emit('update:gapSize', Number($event.target.value))"
              min="0"
              max="100"
              class="w-full"
            />
          </div>
          <div>
            <label for="trim-size" class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1.5">
              <span>边缘裁切</span>
              <span class="font-semibold text-primary-500">{{ trimSize }}px</span>
            </label>
            <input
              type="range"
              id="trim-size"
              :value="trimSize"
              @input="$emit('update:trimSize', Number($event.target.value))"
              min="0"
              max="500"
              class="w-full"
            />
          </div>
        </div>
      </section>

      <!-- ③ 输出设置 -->
      <section class="pt-4 border-t border-gray-200 dark:border-gray-700" aria-label="输出设置">
        <h4 class="section-title"><span class="step-badge">3</span>输出设置</h4>
        <div class="space-y-3">
          <div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="output-format" class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                  输出格式
                </label>
                <select
                  id="output-format"
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
                <label for="scale-target" class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                  输出宽度
                </label>
                <select
                  id="scale-target"
                  :value="scaleTarget"
                  @change="$emit('update:scaleTarget', Number($event.target.value))"
                  class="input-field"
                >
                  <option :value="0">原始尺寸</option>
                  <option :value="512">512px</option>
                  <option :value="768">768px</option>
                  <option :value="1024">1024px</option>
                  <option :value="1080">1080px</option>
                  <option :value="2048">2048px</option>
                </select>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">大于目标宽度的分块将等比缩小</p>
          </div>

          <div>
            <label for="output-quality" class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1.5">
              <span>质量</span>
              <span class="font-semibold text-primary-500">{{ quality }}%</span>
            </label>
            <input
              type="range"
              id="output-quality"
              :value="quality"
              @input="$emit('update:quality', Number($event.target.value))"
              min="10"
              max="100"
              class="w-full"
            />
          </div>

          <div>
            <label for="naming-template" class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
              命名模板
            </label>
            <input
              type="text"
              id="naming-template"
              :value="namingTemplate"
              @input="$emit('update:namingTemplate', $event.target.value)"
              class="input-field"
              placeholder="{original}_{index}"
            />
            <p class="text-xs text-gray-500 mt-1">
              {original} = 原文件名, {index} = 序号
            </p>
          </div>
        </div>
      </section>
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
  },
  splitMode: {
    type: String,
    default: 'grid'
  },
  gapSize: {
    type: Number,
    default: 0
  },
  trimSize: {
    type: Number,
    default: 0
  },
  scaleTarget: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:rows', 'update:cols', 'update:format', 'update:quality', 'update:namingTemplate', 'update:splitMode', 'update:gapSize', 'update:trimSize', 'update:scaleTarget'])

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
