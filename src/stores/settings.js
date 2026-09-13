import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const gridRows = ref(2)
  const gridCols = ref(2)
  const outputFormat = ref('png')
  const outputQuality = ref(90)
  const namingTemplate = ref('{original}_{index}')

  const setGridRows = (rows) => {
    gridRows.value = Math.max(1, Math.min(20, rows))
  }

  const setGridCols = (cols) => {
    gridCols.value = Math.max(1, Math.min(20, cols))
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

  return {
    gridRows,
    gridCols,
    outputFormat,
    outputQuality,
    namingTemplate,
    setGridRows,
    setGridCols,
    setOutputFormat,
    setOutputQuality,
    setNamingTemplate
  }
})
