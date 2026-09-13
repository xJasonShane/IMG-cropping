self.onmessage = function(e) {
  const { type, data, requestId } = e.data

  switch (type) {
    case 'splitGrid':
      handleSplitGrid(data, requestId)
      break
    default:
      console.error('Unknown message type:', type)
  }
}

function handleSplitGrid(data) {
  const { imageBitmap, xLinesPx, yLinesPx, format, quality, startIndex, originalImageName } = data

  try {
    const pieces = []
    // 边界线像素数组由主线程按模式（等分/自定义）计算后传入
    const rowCount = yLinesPx.length - 1
    const colCount = xLinesPx.length - 1

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const pieceWidth = xLinesPx[col + 1] - xLinesPx[col]
        const pieceHeight = yLinesPx[row + 1] - yLinesPx[row]
        const offsetX = xLinesPx[col]
        const offsetY = yLinesPx[row]

        const canvas = new OffscreenCanvas(pieceWidth, pieceHeight)
        const ctx = canvas.getContext('2d')

        // JPEG 不支持透明，透明区域编码后会变黑，先铺白底
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, pieceWidth, pieceHeight)
        }

        ctx.drawImage(
          imageBitmap,
          offsetX,
          offsetY,
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
          index: startIndex + row * colCount + col,
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
      self.postMessage({ type: 'splitGridComplete', pieces: results, requestId })
    })
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message, requestId })
  }
}
