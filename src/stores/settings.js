import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'img-cropping-settings'

// 生成 count 等分的内线百分比数组（不含 0/1 端点）
const evenInnerLines = (count) => {
  return Array.from({ length: Math.max(0, count - 1) }, (_, i) => (i + 1) / count)
}

// 读取持久化设置（缺失字段回退默认值）
const loadPersisted = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = loadPersisted()

  const gridRows = ref(saved.gridRows ?? 2)
  const gridCols = ref(saved.gridCols ?? 2)
  const outputFormat = ref(saved.outputFormat ?? 'png')
  const outputQuality = ref(saved.outputQuality ?? 90)
  const namingTemplate = ref(saved.namingTemplate ?? '{original}_{index}')

  // 分块间隙（px）：相邻块各内缩一半，形成视觉间隔
  const gapSize = ref(saved.gapSize ?? 0)
  // 边缘裁切（px）：分割前去除四边内容
  const trimSize = ref(saved.trimSize ?? 0)
  // 输出缩放：0=保持原始尺寸，>0=按该宽度等比缩放（不放大）
  const scaleTarget = ref(saved.scaleTarget ?? 0)

  // 分割模式：grid=等分滑杆；custom=预览图上拖拽自由分割线
  const splitMode = ref(saved.splitMode ?? 'grid')
  // 自定义内线百分比（0-1，不含端点），x=列线（垂直），y=行线（水平）
  const xInnerLines = ref(saved.xInnerLines ?? [])
  const yInnerLines = ref(saved.yInnerLines ?? [])

  // 持久化到 localStorage
  watch(
    [gridRows, gridCols, outputFormat, outputQuality, namingTemplate, gapSize, trimSize, scaleTarget, splitMode, xInnerLines, yInnerLines],
    () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          gridRows: gridRows.value,
          gridCols: gridCols.value,
          outputFormat: outputFormat.value,
          outputQuality: outputQuality.value,
          namingTemplate: namingTemplate.value,
          gapSize: gapSize.value,
          trimSize: trimSize.value,
          scaleTarget: scaleTarget.value,
          splitMode: splitMode.value,
          xInnerLines: xInnerLines.value,
          yInnerLines: yInnerLines.value
        }))
      } catch {
        // 存储配额满或不可用时静默降级为不持久化
      }
    },
    { deep: true }
  )

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

  const setGapSize = (gap) => {
    gapSize.value = Math.max(0, Math.min(100, gap))
  }

  const setTrimSize = (trim) => {
    trimSize.value = Math.max(0, Math.min(500, trim))
  }

  const setScaleTarget = (target) => {
    scaleTarget.value = Math.max(0, Math.min(4096, target))
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
    gapSize,
    trimSize,
    scaleTarget,
    splitMode,
    xInnerLines,
    yInnerLines,
    setGridRows,
    setGridCols,
    setOutputFormat,
    setOutputQuality,
    setNamingTemplate,
    setGapSize,
    setTrimSize,
    setScaleTarget,
    setSplitMode,
    setCustomLines
  }
})
