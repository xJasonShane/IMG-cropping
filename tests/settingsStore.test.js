import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../src/stores/settings'

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have default values', () => {
    const store = useSettingsStore()

    expect(store.gridRows).toBe(1)
    expect(store.gridCols).toBe(1)
    expect(store.aspectRatio).toBe('free')
    expect(store.outputFormat).toBe('png')
    expect(store.outputQuality).toBe(90)
  })

  it('should set grid rows', () => {
    const store = useSettingsStore()
    store.setGridRows(5)

    expect(store.gridRows).toBe(5)
  })

  it('should clamp grid rows between 1 and 20', () => {
    const store = useSettingsStore()
    store.setGridRows(25)

    expect(store.gridRows).toBe(20)

    store.setGridRows(0)
    expect(store.gridRows).toBe(1)
  })

  it('should set grid cols', () => {
    const store = useSettingsStore()
    store.setGridCols(10)

    expect(store.gridCols).toBe(10)
  })

  it('should set aspect ratio', () => {
    const store = useSettingsStore()
    store.setAspectRatio('16:9')

    expect(store.aspectRatio).toBe('16:9')
  })

  it('should set output format', () => {
    const store = useSettingsStore()
    store.setOutputFormat('webp')

    expect(store.outputFormat).toBe('webp')
  })

  it('should set output quality', () => {
    const store = useSettingsStore()
    store.setOutputQuality(75)

    expect(store.outputQuality).toBe(75)
  })

  it('should clamp output quality between 10 and 100', () => {
    const store = useSettingsStore()
    store.setOutputQuality(150)

    expect(store.outputQuality).toBe(100)

    store.setOutputQuality(5)
    expect(store.outputQuality).toBe(10)
  })

  it('should generate filename with template', () => {
    const store = useSettingsStore()
    store.setNamingTemplate('{original}_cropped_{index}')

    const filename = store.generateFileName('test.jpg', 2)
    expect(filename).toBe('test_cropped_003')
  })

  it('should have preset templates', () => {
    const store = useSettingsStore()

    expect(store.presetTemplates).toBeDefined()
    expect(store.presetTemplates.length).toBeGreaterThan(0)
    expect(store.presetTemplates[0]).toHaveProperty('name')
    expect(store.presetTemplates[0]).toHaveProperty('aspectRatio')
  })
})