export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 50 * 1024 * 1024

  if (!file) {
    throw new Error('文件不存在')
  }

  if (!validTypes.includes(file.type)) {
    throw new Error('仅支持 JPG、PNG、WebP 格式的图片')
  }

  if (file.size > maxSize) {
    throw new Error('图片大小不能超过 50MB')
  }

  if (file.size === 0) {
    throw new Error('文件大小为 0，可能已损坏')
  }

  return true
}

export const downloadImage = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const parseAspectRatio = (ratio) => {
  if (ratio === 'free') return NaN
  const [width, height] = ratio.split(':').map(Number)
  return width / height
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 计算某条边按 count 等分后每块的尺寸：
 * 标准块向下取整，最后一块补齐全部余数，保证切割结果完整覆盖原图。
 */
export const calcPieceSizes = (total, count) => {
  const base = Math.floor(total / count)
  const sizes = new Array(count).fill(base)
  sizes[count - 1] = total - base * (count - 1)
  return sizes
}