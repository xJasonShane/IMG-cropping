import JSZip from 'jszip'

export const splitImageToPieces = (imageElement, rows, cols) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  const pieceWidth = Math.floor(imageElement.width / cols)
  const pieceHeight = Math.floor(imageElement.height / rows)
  
  const pieces = []
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pieceCanvas = document.createElement('canvas')
      pieceCanvas.width = pieceWidth
      pieceCanvas.height = pieceHeight
      const pieceCtx = pieceCanvas.getContext('2d')
      
      pieceCtx.drawImage(
        imageElement,
        col * pieceWidth,
        row * pieceHeight,
        pieceWidth,
        pieceHeight,
        0,
        0,
        pieceWidth,
        pieceHeight
      )
      
      pieces.push({
        canvas: pieceCanvas,
        row,
        col,
        index: row * cols + col
      })
    }
  }
  
  return pieces
}

export const downloadZip = (zipBlob, filename = 'split_images.zip') => {
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

export const createZipFromPieces = async (pieces, filenames, format, quality) => {
  const zip = new JSZip()
  
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i]
    const blob = await canvasToBlob(piece.canvas, `image/${format}`, quality / 100)
    const filename = filenames[i] || `piece_${i + 1}.${format}`
    zip.file(filename, blob)
  }
  
  return await zip.generateAsync({ type: 'blob' })
}
