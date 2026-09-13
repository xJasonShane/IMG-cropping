import { describe, it, expect } from 'vitest'
import { generateId, validateImageFile, formatFileSize, parseAspectRatio, calcPieceSizes } from '../src/utils/helpers'

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

  describe('calcPieceSizes', () => {
    it('should split with remainder added to the last piece', () => {
      expect(calcPieceSizes(1000, 3)).toEqual([333, 333, 334])
      expect(calcPieceSizes(10, 3)).toEqual([3, 3, 4])
      expect(calcPieceSizes(7, 2)).toEqual([3, 4])
    })

    it('should cover the total size completely', () => {
      for (const [total, count] of [[4000, 7], [1001, 13], [99, 20], [50, 3]]) {
        const sizes = calcPieceSizes(total, count)
        expect(sizes).toHaveLength(count)
        expect(sizes.reduce((a, b) => a + b, 0)).toBe(total)
      }
    })

    it('should handle single piece', () => {
      expect(calcPieceSizes(1000, 1)).toEqual([1000])
    })

    it('should handle evenly divisible sizes', () => {
      expect(calcPieceSizes(1000, 4)).toEqual([250, 250, 250, 250])
    })
  })
})