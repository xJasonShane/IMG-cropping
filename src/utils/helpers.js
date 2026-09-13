export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
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

/**
 * 等分模式的边界像素线：长度 count+1，首尾为 0 与 total，
 * 中间为各块前缀和（与 calcPieceSizes 完全等价）。
 */
export const gridPixelLines = (total, count) => {
  const sizes = calcPieceSizes(total, count)
  const lines = [0]
  for (let i = 0; i < count - 1; i++) {
    lines.push(lines[i] + sizes[i])
  }
  lines.push(total)
  return lines
}

/**
 * 自定义分割线：内线百分比（0-1，不含端点）转像素边界线。
 * 去重、钳制到 [2%, 98%]、排序，保证线序有效且不产生空块。
 */
export const customPixelLines = (innerPercents, total) => {
  const clamped = [...new Set(innerPercents)]
    .map((p) => Math.round(Math.min(0.98, Math.max(0.02, Number(p) || 0)) * total))
    .sort((a, b) => a - b)
  const inner = clamped.filter((v, i) => v > 0 && v < total && (i === 0 || v !== clamped[i - 1]))
  return [0, ...inner, total]
}