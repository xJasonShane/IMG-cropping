import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { canvasToBlob, downloadZip } from '../utils/imageProcessing'
import { calcPieceSizes } from '../utils/helpers'
import JSZip from 'jszip'
import { useSettingsStore } from './settings'

let worker = null
let workerSupported = null

const checkWorkerSupport = () => {
  if (workerSupported !== null) return workerSupported
  try {
    workerSupported = typeof OffscreenCanvas !== 'undefined' &&
      typeof createImageBitmap !== 'undefined' &&
      typeof Worker !== 'undefined'
  } catch {
    workerSupported = false
  }
  return workerSupported
}

const getWorker = () => {
  if (!worker && checkWorkerSupport()) {
    worker = new Worker(new URL('../workers/imageWorker.js', import.meta.url), { type: 'module' })
  }
  return worker
}

// worker 崩溃或超时后终止并重建，避免后续分割任务永远无响应
const recreateWorker = () => {
  if (worker) {
    worker.terminate()
    worker = null
  }
}

// 分割任务超时兜底时间（毫秒）
const WORKER_TIMEOUT = 60000

// 将含透明通道的画布铺到白色背景上，用于 JPEG 编码前处理
const flattenToWhiteBackground = (source) => {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(source, 0, 0)
  return canvas
}

// 由 blob 构建分块：只保留 blob 与预览用 objectURL，不再额外持有 canvas 和 base64 dataUrl
const createPieceFromBlob = (blob, { row, col, index, format, originalImageName }) => {
  const piece = {
    blob,
    url: URL.createObjectURL(blob),
    format,
    row,
    col,
    index
  }
  if (originalImageName) {
    piece.originalImageName = originalImageName
  }
  return piece
}

// 释放分块的 objectURL，防止长时间使用后内存泄漏
const revokePieces = (pieces) => {
  if (Array.isArray(pieces)) {
    pieces.forEach((p) => {
      if (p?.url) URL.revokeObjectURL(p.url)
    })
  }
}

// 显式按 EXIF 方向解码，避免 iPhone 等设备拍摄的照片在不同浏览器中方向不一致；
// 旧浏览器不支持 imageOrientation 选项时降级为默认解码
const createBitmapFromBlob = async (blob) => {
  try {
    return await createImageBitmap(blob, { imageOrientation: 'from-image' })
  } catch {
    return await createImageBitmap(blob)
  }
}

const splitWithWorker = async (imageDataUrl, rows, cols, format, quality, startIndex = 0, originalImageName = null) => {
  const w = getWorker()
  if (!w) return null

  const response = await fetch(imageDataUrl)
  const blob = await response.blob()
  const imageBitmap = await createBitmapFromBlob(blob)

  return new Promise((resolve, reject) => {
    let settled = false
    let timeoutId = null

    const handleMessage = (e) => {
      const { type, pieces, error } = e.data
      if (type === 'splitGridComplete') {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        w.removeEventListener('message', handleMessage)
        w.removeEventListener('error', handleError)
        imageBitmap.close()
        resolve(pieces)
      } else if (type === 'error') {
        fail(new Error(error))
      }
    }

    const handleError = () => {
      fail(new Error('图片处理线程异常，请重试'))
    }

    const fail = (err) => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      w.removeEventListener('message', handleMessage)
      w.removeEventListener('error', handleError)
      imageBitmap.close()
      reject(err)
      // worker 可能已处于崩溃状态，重建以便后续任务正常执行
      recreateWorker()
    }

    // 超时兜底：worker 无响应时终止并重建，避免 isProcessing 永久卡死
    timeoutId = setTimeout(() => {
      fail(new Error('图片处理超时，请重试'))
    }, WORKER_TIMEOUT)

    w.addEventListener('message', handleMessage)
    w.addEventListener('error', handleError)

    try {
      w.postMessage({
        type: 'splitGrid',
        data: { imageBitmap, rows, cols, format, quality, startIndex, originalImageName }
      }, [imageBitmap])
    } catch (err) {
      fail(err)
    }
  })
}

export const useImageStore = defineStore('image', () => {
  const currentImage = ref(null)
  const uploadedImages = ref([])
  const splitPieces = ref([])
  const imageWidth = ref(0)
  const imageHeight = ref(0)
  const isProcessing = ref(false)
  const processingProgress = ref(0)
  const customFileNames = ref({})

  // 标准块尺寸（末块会补齐余数，略大于此值），与实际切图逻辑一致
  const pieceWidth = computed(() => {
    if (!imageWidth.value) return 0
    const settings = useSettingsStore()
    return Math.floor(imageWidth.value / settings.gridCols)
  })

  const pieceHeight = computed(() => {
    if (!imageHeight.value) return 0
    const settings = useSettingsStore()
    return Math.floor(imageHeight.value / settings.gridRows)
  })

  const displayCols = computed(() => {
    if (splitPieces.value.length === 0) return 1
    const settings = useSettingsStore()
    const hasMultipleImages = splitPieces.value.some(p => p.originalImageName !== undefined)
    if (hasMultipleImages) {
      return Math.min(4, Math.ceil(Math.sqrt(splitPieces.value.length)))
    }
    return settings.gridCols
  })

  const displayRows = computed(() => {
    if (splitPieces.value.length === 0) return 1
    const settings = useSettingsStore()
    const hasMultipleImages = splitPieces.value.some(p => p.originalImageName !== undefined)
    if (hasMultipleImages) {
      return Math.ceil(splitPieces.value.length / displayCols.value)
    }
    return settings.gridRows
  })

  const setImage = (image) => {
    currentImage.value = image
    setSplitPieces([])
    customFileNames.value = {}

    const img = new Image()
    img.onload = () => {
      imageWidth.value = img.width
      imageHeight.value = img.height
    }
    img.src = image.dataUrl
  }

  const addUploadedImage = (image) => {
    uploadedImages.value.push(image)
  }

  const removeUploadedImage = (index) => {
    const removed = uploadedImages.value[index]
    uploadedImages.value.splice(index, 1)

    if (currentImage.value?.id === removed.id) {
      if (uploadedImages.value.length > 0) {
        setImage(uploadedImages.value[0])
      } else {
        clearImage()
      }
    }
  }

  const setSplitPieces = (pieces) => {
    revokePieces(splitPieces.value)
    splitPieces.value = pieces
  }

  const clearImage = () => {
    setSplitPieces([])
    currentImage.value = null
    uploadedImages.value = []
    imageWidth.value = 0
    imageHeight.value = 0
    customFileNames.value = {}
  }

  const getCustomFileName = (index) => {
    return customFileNames.value[index] || ''
  }

  const setCustomFileName = (index, value) => {
    if (value && value.trim() !== '') {
      customFileNames.value[index] = value.trim()
    } else {
      delete customFileNames.value[index]
    }
  }

  const loadImage = async (dataUrl) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = dataUrl
    })
    return img
  }

  const splitImageToPieces = async (img, rows, cols, format, quality, startIndex = 0, originalImageName = null) => {
    const pieces = []
    // 标准块向下取整、末块补齐余数，确保切割结果完整覆盖原图
    const colSizes = calcPieceSizes(img.width, cols)
    const rowSizes = calcPieceSizes(img.height, rows)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pieceW = colSizes[col]
        const pieceH = rowSizes[row]
        const offsetX = colSizes.slice(0, col).reduce((a, b) => a + b, 0)
        const offsetY = rowSizes.slice(0, row).reduce((a, b) => a + b, 0)

        const canvas = document.createElement('canvas')
        canvas.width = pieceW
        canvas.height = pieceH
        const ctx = canvas.getContext('2d')

        // JPEG 不支持透明，透明区域编码后会变黑，先铺白底
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, pieceW, pieceH)
        }

        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          pieceW,
          pieceH,
          0,
          0,
          pieceW,
          pieceH
        )

        const blob = await canvasToBlob(canvas, `image/${format}`, quality / 100)
        if (!blob) {
          throw new Error('图片编码失败，请重试')
        }
        pieces.push(createPieceFromBlob(blob, {
          row,
          col,
          index: startIndex + row * cols + col,
          format,
          originalImageName
        }))
      }
    }

    return pieces
  }

  const splitImage = async () => {
    if (!currentImage.value) return

    const settings = useSettingsStore()

    try {
      isProcessing.value = true
      processingProgress.value = 0
      customFileNames.value = {}

      let pieces

      if (checkWorkerSupport()) {
        const workerPieces = await splitWithWorker(
          currentImage.value.dataUrl,
          settings.gridRows,
          settings.gridCols,
          settings.outputFormat,
          settings.outputQuality
        )
        pieces = workerPieces.map((p) => createPieceFromBlob(p.blob, {
          row: p.row,
          col: p.col,
          index: p.index,
          format: settings.outputFormat
        }))
      } else {
        const img = await loadImage(currentImage.value.dataUrl)
        pieces = await splitImageToPieces(img, settings.gridRows, settings.gridCols, settings.outputFormat, settings.outputQuality)
      }

      processingProgress.value = 100
      setSplitPieces(pieces)
      return { success: true, count: pieces.length }
    } catch (error) {
      console.error('Split error:', error)
      return { success: false, error: error.message }
    } finally {
      isProcessing.value = false
      processingProgress.value = 0
    }
  }

  const splitAllImages = async () => {
    if (uploadedImages.value.length === 0) return

    const settings = useSettingsStore()

    try {
      isProcessing.value = true
      processingProgress.value = 0

      const allPieces = []
      const totalImages = uploadedImages.value.length

      for (let i = 0; i < uploadedImages.value.length; i++) {
        const image = uploadedImages.value[i]
        let pieces

        if (checkWorkerSupport()) {
          const workerPieces = await splitWithWorker(
            image.dataUrl,
            settings.gridRows,
            settings.gridCols,
            settings.outputFormat,
            settings.outputQuality,
            allPieces.length,
            image.name
          )
          pieces = workerPieces.map((p) => createPieceFromBlob(p.blob, {
            row: p.row,
            col: p.col,
            index: p.index,
            format: settings.outputFormat,
            originalImageName: p.originalImageName
          }))
        } else {
          const img = await loadImage(image.dataUrl)
          pieces = await splitImageToPieces(
            img,
            settings.gridRows,
            settings.gridCols,
            settings.outputFormat,
            settings.outputQuality,
            allPieces.length,
            image.name
          )
        }

        allPieces.push(...pieces)
        processingProgress.value = Math.round(((i + 1) / totalImages) * 100)
      }

      setSplitPieces(allPieces)
      return { success: true, imageCount: uploadedImages.value.length, pieceCount: allPieces.length }
    } catch (error) {
      console.error('Split all error:', error)
      return { success: false, error: error.message }
    } finally {
      isProcessing.value = false
      processingProgress.value = 0
    }
  }

  const generateFileName = (index, originalName = null) => {
    const settings = useSettingsStore()
    const custom = getCustomFileName(index)
    if (custom) {
      const validation = validateFileName(custom)
      if (validation.valid) {
        return custom
      }
    }

    const rawName = originalName || currentImage.value?.name || 'image'
    return settings.namingTemplate
      .replace('{original}', rawName.replace(/\.[^/.]+$/, ''))
      .replace('{index}', String(index + 1).padStart(3, '0'))
  }

  const invalidChars = /[<>:"/\\|?*]/

  const validateFileName = (name) => {
    if (!name || name.trim() === '') {
      return { valid: false, error: '文件名不能为空' }
    }

    if (invalidChars.test(name)) {
      return { valid: false, error: '文件名不能包含以下字符: < > : " / \\ | ? *' }
    }

    if (name.length > 255) {
      return { valid: false, error: '文件名不能超过255个字符' }
    }

    return { valid: true, error: '' }
  }

  // 检查自定义文件名是否非法（非法时 generateFileName 会回退到默认命名）
  const checkCustomNameWarning = (index) => {
    const custom = getCustomFileName(index)
    if (!custom) return null
    const validation = validateFileName(custom)
    return validation.valid ? null : validation.error
  }

  // 获取用于下载/打包的 blob：格式一致时直接复用分割时的编码结果，切换输出格式时才重新编码
  const getDownloadBlob = async (piece, settings) => {
    if (piece.format === settings.outputFormat) {
      return piece.blob
    }

    const bitmap = await createBitmapFromBlob(piece.blob)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close()

    // 分块可能含透明通道，JPEG 编码前铺白底避免透明区域变黑
    const source = settings.outputFormat === 'jpeg'
      ? flattenToWhiteBackground(canvas)
      : canvas
    const blob = await canvasToBlob(source, `image/${settings.outputFormat}`, settings.outputQuality / 100)
    if (!blob) {
      throw new Error('图片编码失败，请重试')
    }
    return blob
  }

  const downloadPiece = async (index) => {
    const piece = splitPieces.value[index]
    if (!piece) return { success: false, error: '分块不存在' }

    const settings = useSettingsStore()
    const warning = checkCustomNameWarning(index)

    try {
      const blob = await getDownloadBlob(piece, settings)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${generateFileName(index, piece.originalImageName)}.${settings.outputFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return { success: true, warning }
    } catch (error) {
      console.error('Download piece error:', error)
      return { success: false, error: error.message }
    }
  }

  const downloadAll = async () => {
    if (splitPieces.value.length === 0) return

    const settings = useSettingsStore()

    try {
      isProcessing.value = true
      processingProgress.value = 0

      const zip = new JSZip()
      let invalidNameCount = 0

      for (let i = 0; i < splitPieces.value.length; i++) {
        const piece = splitPieces.value[i]
        if (checkCustomNameWarning(i)) invalidNameCount++
        const blob = await getDownloadBlob(piece, settings)
        const filename = `${generateFileName(i, piece.originalImageName)}.${settings.outputFormat}`
        zip.file(filename, blob)
        processingProgress.value = Math.round(((i + 1) / splitPieces.value.length) * 100)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const originalName = currentImage.value?.name?.replace(/\.[^/.]+$/, '') || 'images'
      downloadZip(zipBlob, `${originalName}_split.zip`)

      return { success: true, count: splitPieces.value.length, invalidNameCount }
    } catch (error) {
      console.error('Download error:', error)
      return { success: false, error: error.message }
    } finally {
      isProcessing.value = false
      processingProgress.value = 0
    }
  }

  return {
    currentImage,
    uploadedImages,
    splitPieces,
    imageWidth,
    imageHeight,
    isProcessing,
    processingProgress,
    customFileNames,
    pieceWidth,
    pieceHeight,
    displayCols,
    displayRows,
    setImage,
    addUploadedImage,
    removeUploadedImage,
    setSplitPieces,
    clearImage,
    getCustomFileName,
    setCustomFileName,
    splitImage,
    splitAllImages,
    generateFileName,
    validateFileName,
    downloadPiece,
    downloadAll
  }
})
