import JSZip from 'jszip'

export const cropImage = (cropper, options = {}) => {
  const {
    format = 'image/png',
    quality = 0.9,
    width,
    height
  } = options

  const canvas = cropper.getCroppedCanvas({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    maxWidth: width,
    maxHeight: height
  })

  return canvas
}

export const cropGrid = (cropper, rows, cols, options = {}) => {
  const imageData = cropper.getImageData()
  const canvas = cropper.getCroppedCanvas()
  const ctx = canvas.getContext('2d')
  
  const pieceWidth = canvas.width / cols
  const pieceHeight = canvas.height / rows
  const pieces = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pieceCanvas = document.createElement('canvas')
      pieceCanvas.width = pieceWidth
      pieceCanvas.height = pieceHeight
      const pieceCtx = pieceCanvas.getContext('2d')

      pieceCtx.drawImage(
        canvas,
        col * pieceWidth,
        row * pieceHeight,
        pieceWidth,
        pieceHeight,
        0,
        0,
        pieceWidth,
        pieceHeight
      )

      pieces.push(pieceCanvas)
    }
  }

  return pieces
}

export const rotateImage = (cropper, degree) => {
  cropper.rotate(degree)
}

export const flipImage = (cropper, direction) => {
  if (direction === 'horizontal') {
    cropper.scaleX(-cropper.getData().scaleX || -1)
  } else if (direction === 'vertical') {
    cropper.scaleY(-cropper.getData().scaleY || -1)
  }
}

export const applyFilters = (cropper, filters = {}) => {
  const { brightness = 100, contrast = 100, saturation = 100 } = filters
  
  const canvas = cropper.getCroppedCanvas()
  const ctx = canvas.getContext('2d')
  
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  ctx.drawImage(canvas, 0, 0)
  
  return canvas
}

export const applyWatermark = (canvas, watermark) => {
  if (!watermark.enabled) return canvas
  
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  
  ctx.save()
  ctx.globalAlpha = watermark.opacity / 100
  
  if (watermark.type === 'text' && watermark.text) {
    const position = calculatePosition(width, height, watermark.position, {
      width: ctx.measureText(watermark.text).width + watermark.fontSize,
      height: watermark.fontSize * 1.5
    })
    
    ctx.translate(position.x, position.y)
    ctx.rotate((watermark.rotation * Math.PI) / 180)
    
    ctx.font = `${watermark.fontSize}px Arial, sans-serif`
    ctx.fillStyle = watermark.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    ctx.fillText(watermark.text, 0, 0)
  } else if (watermark.type === 'image' && watermark.imageUrl) {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const scale = watermark.scale / 100
        const imgWidth = img.width * scale
        const imgHeight = img.height * scale
        
        const position = calculatePosition(width, height, watermark.position, {
          width: imgWidth,
          height: imgHeight
        })
        
        ctx.translate(position.x, position.y)
        ctx.rotate((watermark.rotation * Math.PI) / 180)
        
        ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)
        
        ctx.restore()
        resolve(canvas)
      }
      img.onerror = () => {
        ctx.restore()
        resolve(canvas)
      }
      img.src = watermark.imageUrl
    })
  }
  
  ctx.restore()
  return canvas
}

const calculatePosition = (canvasWidth, canvasHeight, position, elementSize) => {
  const padding = 20
  const { width, height } = elementSize
  
  const positions = {
    'top-left': { x: padding + width / 2, y: padding + height / 2 },
    'top-center': { x: canvasWidth / 2, y: padding + height / 2 },
    'top-right': { x: canvasWidth - padding - width / 2, y: padding + height / 2 },
    'middle-left': { x: padding + width / 2, y: canvasHeight / 2 },
    'center': { x: canvasWidth / 2, y: canvasHeight / 2 },
    'middle-right': { x: canvasWidth - padding - width / 2, y: canvasHeight / 2 },
    'bottom-left': { x: padding + width / 2, y: canvasHeight - padding - height / 2 },
    'bottom-center': { x: canvasWidth / 2, y: canvasHeight - padding - height / 2 },
    'bottom-right': { x: canvasWidth - padding - width / 2, y: canvasHeight - padding - height / 2 }
  }
  
  return positions[position] || positions['bottom-right']
}

export const resizeCanvas = (canvas, targetWidth, targetHeight, maintainAspectRatio = true) => {
  if (!targetWidth && !targetHeight) return canvas
  
  const sourceWidth = canvas.width
  const sourceHeight = canvas.height
  
  let newWidth = targetWidth || sourceWidth
  let newHeight = targetHeight || sourceHeight
  
  if (maintainAspectRatio && targetWidth && targetHeight) {
    const sourceRatio = sourceWidth / sourceHeight
    const targetRatio = targetWidth / targetHeight
    
    if (sourceRatio > targetRatio) {
      newHeight = targetWidth / sourceRatio
      newWidth = targetWidth
    } else {
      newWidth = targetHeight * sourceRatio
      newHeight = targetHeight
    }
  } else if (maintainAspectRatio) {
    const ratio = sourceWidth / sourceHeight
    if (targetWidth) {
      newHeight = targetWidth / ratio
    } else if (targetHeight) {
      newWidth = targetHeight * ratio
    }
  }
  
  const resizedCanvas = document.createElement('canvas')
  resizedCanvas.width = newWidth
  resizedCanvas.height = newHeight
  
  const ctx = resizedCanvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(canvas, 0, 0, sourceWidth, sourceHeight, 0, 0, newWidth, newHeight)
  
  return resizedCanvas
}

export const createZipFromImages = async (images, filenames) => {
  const zip = new JSZip()
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const filename = filenames[i] || `image_${i + 1}.png`
    
    const blob = await new Promise((resolve) => {
      image.toBlob((blob) => resolve(blob), 'image/png', 0.9)
    })
    
    zip.file(filename, blob)
  }
  
  return await zip.generateAsync({ type: 'blob' })
}

export const downloadZip = (zipBlob, filename = 'cropped_images.zip') => {
  const url = URL.createObjectURL(zipBlob)
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
