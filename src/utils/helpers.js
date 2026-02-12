export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
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

export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('文件不存在'))
      return
    }

    const reader = new FileReader()
    
    reader.onload = (e) => {
      if (e.target.result) {
        resolve(e.target.result)
      } else {
        reject(new Error('文件读取失败'))
      }
    }
    
    reader.onerror = (e) => {
      console.error('FileReader error:', e)
      reject(new Error('文件读取失败，请检查文件是否损坏'))
    }
    
    reader.onabort = () => {
      reject(new Error('文件读取被中断'))
    }
    
    try {
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('readAsDataURL error:', error)
      reject(new Error('文件读取失败'))
    }
  })
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

export const canvasToBlob = (canvas, type = 'image/png', quality = 0.9) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, type, quality)
  })
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