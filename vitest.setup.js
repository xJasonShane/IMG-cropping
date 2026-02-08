import { vi } from 'vitest'
import { config } from '@vue/test-utils'

config.global.stubs = {
  transition: false,
  'transition-group': false
}

vi.mock('cropperjs', () => ({
  default: class MockCropper {
    constructor() {}
    rotate() {}
    scale() {}
    reset() {}
    getCroppedCanvas() {
      return document.createElement('canvas')
    }
    getData() {
      return { scaleX: 1, scaleY: 1 }
    }
    setAspectRatio() {}
  }
}))