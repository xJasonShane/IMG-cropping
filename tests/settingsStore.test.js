import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from '../src/stores/settings'

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have default values', () => {
    const store = useSettingsStore()

    expect(store.gridRows).toBe(2)
    expect(store.gridCols).toBe(2)
    expect(store.outputFormat).toBe('png')
    expect(store.outputQuality).toBe(90)
    expect(store.namingTemplate).toBe('{original}_{index}')
  })

  it('should set grid rows', () => {
    const store = useSettingsStore()
    store.setGridRows(5)

    expect(store.gridRows).toBe(5)
  })

  it('should clamp grid rows between 1 and 20', () => {
    const store = useSettingsStore()
    
    store.setGridRows(0)
    expect(store.gridRows).toBe(1)
    
    store.setGridRows(25)
    expect(store.gridRows).toBe(20)
  })

  it('should set grid cols', () => {
    const store = useSettingsStore()
    store.setGridCols(4)

    expect(store.gridCols).toBe(4)
  })

  it('should clamp grid cols between 1 and 20', () => {
    const store = useSettingsStore()
    
    store.setGridCols(0)
    expect(store.gridCols).toBe(1)
    
    store.setGridCols(25)
    expect(store.gridCols).toBe(20)
  })

  it('should set output format', () => {
    const store = useSettingsStore()
    store.setOutputFormat('jpeg')

    expect(store.outputFormat).toBe('jpeg')
  })

  it('should set output quality', () => {
    const store = useSettingsStore()
    store.setOutputQuality(80)

    expect(store.outputQuality).toBe(80)
  })

  it('should clamp output quality between 10 and 100', () => {
    const store = useSettingsStore()
    
    store.setOutputQuality(5)
    expect(store.outputQuality).toBe(10)
    
    store.setOutputQuality(150)
    expect(store.outputQuality).toBe(100)
  })

  it('should generate filename with template', () => {
    const store = useSettingsStore()
    
    const filename = store.generateFileName('photo.jpg', 0)
    expect(filename).toBe('photo_001')
    
    const filename2 = store.generateFileName('image.png', 9)
    expect(filename2).toBe('image_010')
  })
})
