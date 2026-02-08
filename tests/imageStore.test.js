import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useImageStore } from '../src/stores/image'

describe('Image Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should add image to store', () => {
    const store = useImageStore()
    const image = {
      id: '1',
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
      dataUrl: 'data:image/jpeg;base64,test'
    }

    store.addImage(image)

    expect(store.images).toHaveLength(1)
    expect(store.images[0]).toEqual(image)
    expect(store.currentImage).toEqual(image)
  })

  it('should set current image', () => {
    const store = useImageStore()
    const image1 = { id: '1', name: 'test1.jpg', size: 1024, type: 'image/jpeg', dataUrl: 'data:image/jpeg;base64,test1' }
    const image2 = { id: '2', name: 'test2.jpg', size: 2048, type: 'image/jpeg', dataUrl: 'data:image/jpeg;base64,test2' }

    store.addImage(image1)
    store.addImage(image2)
    store.setCurrentImage(image1)

    expect(store.currentImage).toEqual(image1)
  })

  it('should remove image from store', () => {
    const store = useImageStore()
    const image = { id: '1', name: 'test.jpg', size: 1024, type: 'image/jpeg', dataUrl: 'data:image/jpeg;base64,test' }

    store.addImage(image)
    store.removeImage('1')

    expect(store.images).toHaveLength(0)
    expect(store.currentImage).toBeNull()
  })

  it('should support undo', () => {
    const store = useImageStore()
    const image = { id: '1', name: 'test.jpg', size: 1024, type: 'image/jpeg', dataUrl: 'data:image/jpeg;base64,test' }

    store.addImage(image)
    expect(store.images).toHaveLength(1)

    store.undo()
    expect(store.images).toHaveLength(0)
  })

  it('should support redo', () => {
    const store = useImageStore()
    const image = { id: '1', name: 'test.jpg', size: 1024, type: 'image/jpeg', dataUrl: 'data:image/jpeg;base64,test' }

    store.addImage(image)
    store.undo()
    expect(store.images).toHaveLength(0)

    store.redo()
    expect(store.images).toHaveLength(1)
  })
})