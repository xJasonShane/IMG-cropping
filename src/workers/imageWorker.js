self.onmessage = function(e) {
  const { type, data } = e.data

  switch (type) {
    case 'crop':
      handleCrop(data)
      break
    case 'cropGrid':
      handleCropGrid(data)
      break
    case 'applyFilters':
      handleApplyFilters(data)
      break
    default:
      console.error('Unknown message type:', type)
  }
}

function handleCrop(data) {
  const { imageData, cropData, options } = data
  
  try {
    const canvas = new OffscreenCanvas(cropData.width, cropData.height)
    const ctx = canvas.getContext('2d')
    
    ctx.drawImage(
      imageData,
      cropData.x,
      cropData.y,
      cropData.width,
      cropData.height,
      0,
      0,
      cropData.width,
      cropData.height
    )
    
    const blob = canvas.convertToBlob({
      type: options.format || 'image/png',
      quality: options.quality || 0.9
    }).then(blob => {
      self.postMessage({ type: 'cropComplete', blob })
    })
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message })
  }
}

function handleCropGrid(data) {
  const { imageData, rows, cols, options } = data
  
  try {
    const pieces = []
    const pieceWidth = imageData.width / cols
    const pieceHeight = imageData.height / rows
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const canvas = new OffscreenCanvas(pieceWidth, pieceHeight)
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(
          imageData,
          col * pieceWidth,
          row * pieceHeight,
          pieceWidth,
          pieceHeight,
          0,
          0,
          pieceWidth,
          pieceHeight
        )
        
        pieces.push(canvas)
      }
    }
    
    const blobs = Promise.all(
      pieces.map(canvas =>
        canvas.convertToBlob({
          type: options.format || 'image/png',
          quality: options.quality || 0.9
        })
      )
    ).then(blobs => {
      self.postMessage({ type: 'cropGridComplete', blobs })
    })
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message })
  }
}

function handleApplyFilters(data) {
  const { imageData, filters } = data
  
  try {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height)
    const ctx = canvas.getContext('2d')
    
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%) blur(${filters.blur}px)`
    ctx.drawImage(imageData, 0, 0)
    
    const blob = canvas.convertToBlob({
      type: 'image/png',
      quality: 0.9
    }).then(blob => {
      self.postMessage({ type: 'filtersComplete', blob })
    })
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message })
  }
}