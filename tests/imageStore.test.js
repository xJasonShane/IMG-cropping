import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useImageStore } from '../src/stores/image'

describe('Image Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have default values', () => {
    const store = useImageStore()

    expect(store.currentImage).toBeNull()
    expect(store.splitPieces).toHaveLength(0)
  })

  it('should set image', () => {
    const store = useImageStore()
    const image = { 
      id: '1', 
      name: 'test.jpg', 
      size: 1024, 
      type: 'image/jpeg', 
      dataUrl: 'data:image/jpeg;base64,test' 
    }

    store.setImage(image)

    expect(store.currentImage).toEqual(image)
    expect(store.splitPieces).toHaveLength(0)
  })

  it('should set split pieces', () => {
    const store = useImageStore()
    const pieces = [
      { canvas: {}, row: 0, col: 0, index: 0 },
      { canvas: {}, row: 0, col: 1, index: 1 }
    ]

    store.setSplitPieces(pieces)

    expect(store.splitPieces).toHaveLength(2)
    expect(store.splitPieces[0].index).toBe(0)
    expect(store.splitPieces[1].index).toBe(1)
  })

  it('should clear image', () => {
    const store = useImageStore()
    const image = {
      id: '1',
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
      dataUrl: 'data:image/jpeg;base64,test'
    }

    store.setImage(image)
    store.setSplitPieces([{ canvas: {}, row: 0, col: 0, index: 0 }])

    store.clearImage()

    expect(store.currentImage).toBeNull()
    expect(store.splitPieces).toHaveLength(0)
  })

  it('should validate file names consistently across consecutive calls', () => {
    const store = useImageStore()

    // 连续多次调用：/g 标志导致的 lastIndex 状态污染曾使校验结果交替错误
    for (let i = 0; i < 3; i++) {
      expect(store.validateFileName('img<a').valid).toBe(false)
      expect(store.validateFileName('valid_name').valid).toBe(true)
    }
  })

  it('should reject all invalid characters in file names', () => {
    const store = useImageStore()
    const invalidNames = ['a<b', 'a>b', 'a:b', 'a"b', 'a/b', 'a\\b', 'a|b', 'a?b', 'a*b']

    invalidNames.forEach((name) => {
      expect(store.validateFileName(name).valid).toBe(false)
    })

    expect(store.validateFileName('').valid).toBe(false)
    expect(store.validateFileName('   ').valid).toBe(false)
    expect(store.validateFileName('x'.repeat(256)).valid).toBe(false)
  })
})
