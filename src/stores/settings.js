import { defineStore } from 'pinia'
import { ref } from 'vue'

// 生成 count 等分的内线百分比数组（不含 0/1 端点）
const evenInnerLines = (count) => {
  return Array.from({ length: Math.max(0, count - 1) }, (_, i) => (i + 1) / count)
}

export const useSettingsStore = defineStore('settings', () => {
  const gridRows = ref(2)
  const gridCols = ref(2)
  const outputFormat = ref('png')
  const outputQuality = ref(90)
  const namingTemplate = ref('{original}_{index}')

  // 分割模式：grid=等分滑杆；custom=预览图上拖拽自由分割线
  const splitMode = ref('grid')
  // 自定义内线百分比（0-1，不含端点），x=列线（垂直），y=行线（水平）
  const xInnerLines = ref([])
  const yInnerLines = ref([])

  const setGridRows = (rows) => {
    gridRows.value = Math.max(1, Math.min(20, rows))
    // 自定义模式下调整行数：重置为等分线，保持线数量与行数一致
    if (splitMode.value === 'custom') {
      yInnerLines.value = evenInnerLines(gridRows.value)
    }
  }

  const setGridCols = (cols) => {
    gridCols.value = Math.max(1, Math.min(20, cols))
    if (splitMode.value === 'custom') {
      xInnerLines.value = evenInnerLines(gridCols.value)
    }
  }

  const setOutputFormat = (format) => {
    outputFormat.value = format
  }

  const setOutputQuality = (quality) => {
    outputQuality.value = Math.max(10, Math.min(100, quality))
  }

  const setNamingTemplate = (template) => {
    namingTemplate.value = template
  }

  const setSplitMode = (mode) => {
    splitMode.value = mode
    // 首次进入自定义模式：按当前行列数生成等分内线作为拖拽起点
    if (mode === 'custom') {
      if (xInnerLines.value.length === 0) {
        xInnerLines.value = evenInnerLines(gridCols.value)
      }
      if (yInnerLines.value.length === 0) {
        yInnerLines.value = evenInnerLines(gridRows.value)
      }
    }
  }

  const setCustomLines = (xInner, yInner) => {
    xInnerLines.value = xInner
    yInnerLines.value = yInner
    // 行列数由线数量派生，保证信息面板与切图逻辑一致
    gridCols.value = xInner.length + 1
    gridRows.value = yInner.length + 1
  }

  return {
    gridRows,
    gridCols,
    outputFormat,
    outputQuality,
    namingTemplate,
    splitMode,
    xInnerLines,
    yInnerLines,
    setGridRows,
    setGridCols,
    setOutputFormat,
    setOutputQuality,
    setNamingTemplate,
    setSplitMode,
    setCustomLines
  }
})
