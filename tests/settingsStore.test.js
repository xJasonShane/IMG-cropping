import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from '../src/stores/settings'
import { useImageStore } from '../src/stores/image'

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

  it('should apply naming template from settings when generating filenames', () => {
    const settings = useSettingsStore()
    const imageStore = useImageStore()
    const image = {
      id: '1',
      name: 'photo.jpg',
      size: 1024,
      type: 'image/jpeg',
      url: 'blob:mock-image'
    }
    imageStore.setImage(image)

    expect(imageStore.generateFileName(0)).toBe('photo_001')
    expect(imageStore.generateFileName(9, 'image.png')).toBe('image_010')

    settings.setNamingTemplate('{original}_r{index}')
    expect(imageStore.generateFileName(0)).toBe('photo_r001')
  })

  describe('custom split lines', () => {
    it('should initialize even inner lines when entering custom mode', () => {
      const store = useSettingsStore()

      store.setSplitMode('custom')

      expect(store.splitMode).toBe('custom')
      expect(store.xInnerLines).toEqual([0.5])
      expect(store.yInnerLines).toEqual([0.5])
      expect(store.gridRows).toBe(2)
      expect(store.gridCols).toBe(2)
    })

    it('should derive rows/cols from custom lines', () => {
      const store = useSettingsStore()

      store.setSplitMode('custom')
      store.setCustomLines([0.3, 0.6], [0.5])

      expect(store.gridCols).toBe(3)
      expect(store.gridRows).toBe(2)
    })

    it('should reset to even lines when adjusting sliders in custom mode', () => {
      const store = useSettingsStore()

      store.setSplitMode('custom')
      store.setCustomLines([0.2, 0.8], [0.7])

      store.setGridRows(4)
      store.setGridCols(2)

      expect(store.yInnerLines).toEqual([0.25, 0.5, 0.75])
      expect(store.xInnerLines).toEqual([0.5])
      expect(store.gridRows).toBe(4)
    })

    it('should keep grid mode unchanged by slider actions', () => {
      const store = useSettingsStore()

      store.setSplitMode('grid')
      store.setGridRows(3)

      expect(store.splitMode).toBe('grid')
      expect(store.yInnerLines).toEqual([])
      expect(store.gridRows).toBe(3)
    })
  })
})
