import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const gridRows = ref(1)
  const gridCols = ref(1)
  const aspectRatio = ref('free')
  const customAspectRatio = ref({ width: 1, height: 1 })
  const outputFormat = ref('png')
  const outputQuality = ref(90)
  const namingTemplate = ref('{original}_{index}')
  const presetTemplate = ref(null)

  const aspectRatios = [
    { label: '自由', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:2', value: '3:2' },
    { label: '5:4', value: '5:4' },
    { label: '自定义', value: 'custom' }
  ]

  const presetTemplates = [
    { name: '社交媒体头像', width: 400, height: 400, aspectRatio: '1:1' },
    { name: 'Instagram 正方形', width: 1080, height: 1080, aspectRatio: '1:1' },
    { name: 'Instagram 竖版', width: 1080, height: 1350, aspectRatio: '4:5' },
    { name: 'Instagram 横版', width: 1080, height: 608, aspectRatio: '16:9' },
    { name: 'Twitter 头像', width: 400, height: 400, aspectRatio: '1:1' },
    { name: 'Twitter 封面', width: 1500, height: 500, aspectRatio: '3:1' },
    { name: 'YouTube 缩略图', width: 1280, height: 720, aspectRatio: '16:9' },
    { name: '证件照 (1寸)', width: 295, height: 413, aspectRatio: '25:35' },
    { name: '证件照 (2寸)', width: 413, height: 579, aspectRatio: '35:49' }
  ]

  const setGridRows = (rows) => {
    gridRows.value = Math.max(1, Math.min(20, rows))
  }

  const setGridCols = (cols) => {
    gridCols.value = Math.max(1, Math.min(20, cols))
  }

  const setAspectRatio = (ratio) => {
    aspectRatio.value = ratio
  }

  const setCustomAspectRatio = (width, height) => {
    customAspectRatio.value = { width, height }
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

  const setPresetTemplate = (preset) => {
    presetTemplate.value = preset
    if (preset) {
      aspectRatio.value = preset.aspectRatio
    }
  }

  const generateFileName = (originalName, index) => {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    return namingTemplate.value
      .replace('{original}', nameWithoutExt)
      .replace('{index}', String(index + 1).padStart(3, '0'))
  }

  return {
    gridRows,
    gridCols,
    aspectRatio,
    customAspectRatio,
    outputFormat,
    outputQuality,
    namingTemplate,
    presetTemplate,
    aspectRatios,
    presetTemplates,
    setGridRows,
    setGridCols,
    setAspectRatio,
    setCustomAspectRatio,
    setOutputFormat,
    setOutputQuality,
    setNamingTemplate,
    setPresetTemplate,
    generateFileName
  }
})