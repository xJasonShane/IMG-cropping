import { calcPieceSizes } from '../utils/helpers'

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

function handleSplitGrid(data, requestId) {
  const { imageBitmap, rows, cols, format, quality, startIndex, originalImageName } = data

  try {
    const pieces = []
    // 标准块向下取整、末块补齐余数，确保切割结果完整覆盖原图
    const colSizes = calcPieceSizes(imageBitmap.width, cols)
    const rowSizes = calcPieceSizes(imageBitmap.height, rows)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pieceWidth = colSizes[col]
        const pieceHeight = rowSizes[row]
        const offsetX = colSizes.slice(0, col).reduce((a, b) => a + b, 0)
        const offsetY = rowSizes.slice(0, row).reduce((a, b) => a + b, 0)

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
      self.postMessage({ type: 'splitGridComplete', pieces: results, requestId })
    })
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message, requestId })
  }
}
