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
  const { imageBitmap, xLinesPx, yLinesPx, format, quality, gapPx, trimPx, scaleTarget, startIndex, originalImageName } = data

  try {
    const pieces = []
    // 边界线像素数组由主线程按模式（等分/自定义）计算后传入
    const rowCount = yLinesPx.length - 1
    const colCount = xLinesPx.length - 1
    // 间隙内缩量：相邻块各内缩一半形成视觉间隔；边缘裁切只作用于最外侧边
    const gapHalf = (gapPx || 0) / 2
    const trim = trimPx || 0

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        // 源区域内缩：贴边侧用裁切值，块间侧用一半间隙
        const srcX0 = xLinesPx[col] + (col === 0 ? trim : gapHalf)
        const srcX1 = xLinesPx[col + 1] - (col === colCount - 1 ? trim : gapHalf)
        const srcY0 = yLinesPx[row] + (row === 0 ? trim : gapHalf)
        const srcY1 = yLinesPx[row + 1] - (row === rowCount - 1 ? trim : gapHalf)
        const srcW = Math.max(1, srcX1 - srcX0)
        const srcH = Math.max(1, srcY1 - srcY0)

        // 输出缩放：按目标宽度等比缩小（不放大）
        let outW = srcW
        let outH = srcH
        if (scaleTarget > 0 && srcW > scaleTarget) {
          outW = scaleTarget
          outH = Math.max(1, Math.round(srcH * scaleTarget / srcW))
        }

        const canvas = new OffscreenCanvas(outW, outH)
        const ctx = canvas.getContext('2d')

        // JPEG 不支持透明，透明区域编码后会变黑，先铺白底
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, outW, outH)
        }

        ctx.drawImage(
          imageBitmap,
          srcX0,
          srcY0,
          srcW,
          srcH,
          0,
          0,
          outW,
          outH
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

    blobsPromise
      .then(results => {
        self.postMessage({ type: 'splitGridComplete', pieces: results, requestId })
      })
      .catch(error => {
        // 编码失败也必须回执，否则主线程会一直等待直至超时
        self.postMessage({ type: 'error', error: error.message, requestId })
      })
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message, requestId })
  }
}
