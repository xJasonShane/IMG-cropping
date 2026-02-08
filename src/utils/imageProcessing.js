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