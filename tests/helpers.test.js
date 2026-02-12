import { describe, it, expect } from 'vitest'
import { generateId, validateImageFile, formatFileSize, parseAspectRatio } from '../src/utils/helpers'

describe('Helper Functions', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should generate string IDs', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })
  })

  describe('validateImageFile', () => {
    it('should accept valid image types', () => {
      const validFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      expect(() => validateImageFile(validFile)).not.toThrow()
    })

    it('should reject invalid file types', () => {
      const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      expect(() => validateImageFile(invalidFile)).toThrow('仅支持 JPG、PNG、WebP 格式的图片')
    })

    it('should reject files larger than 50MB', () => {
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' })
      expect(() => validateImageFile(largeFile)).toThrow('图片大小不能超过 50MB')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })
  })

  describe('parseAspectRatio', () => {
    it('should parse aspect ratios correctly', () => {
      expect(parseAspectRatio('1:1')).toBe(1)
      expect(parseAspectRatio('16:9')).toBe(16 / 9)
      expect(parseAspectRatio('4:3')).toBe(4 / 3)
    })

    it('should return NaN for free aspect ratio', () => {
      expect(parseAspectRatio('free')).toBeNaN()
    })
  })
})