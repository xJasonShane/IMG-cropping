self.onmessage = function(e) {
  const { type, data } = e.data

  switch (type) {
    case 'splitGrid':
      handleSplitGrid(data)
      break
    default:
      console.error('Unknown message type:', type)
  }
}

function handleSplitGrid(data) {
  const { imageBitmap, rows, cols, format, quality, startIndex, originalImageName } = data

  try {
    const pieces = []
    const pieceWidth = Math.floor(imageBitmap.width / cols)
    const pieceHeight = Math.floor(imageBitmap.height / rows)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const canvas = new OffscreenCanvas(pieceWidth, pieceHeight)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(
          imageBitmap,
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
          canvas,
          row,
          col,
          index: startIndex + row * cols + col,
          originalImageName
        })
      }
    }

    const blobsPromise = Promise.all(
      pieces.map(piece =>
        piece.canvas.convertToBlob({
          type: `image/${format}`,
          quality: quality / 100
        }).then(blob => ({
          blob,
          row: piece.row,
          col: piece.col,
          index: piece.index,
          originalImageName: piece.originalImageName
        }))
      )
    )

    blobsPromise.then(results => {
      self.postMessage({ type: 'splitGridComplete', pieces: results })
    })
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message })
  }
}
