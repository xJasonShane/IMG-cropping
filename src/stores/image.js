import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { canvasToBlob, downloadZip } from '../utils/imageProcessing'
import { gridPixelLines, customPixelLines } from '../utils/helpers'
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

// 当前图片的解码缓存（容量 1）：调整行列数重复分割时免于重新解码原图
let cachedBitmap = null
let cachedBitmapId = null

const getBitmapForImage = async (image) => {
  if (cachedBitmap && cachedBitmapId === image.id) {
    return cachedBitmap
  }
  if (cachedBitmap) {
    cachedBitmap.close()
    cachedBitmap = null
    cachedBitmapId = null
  }
  const response = await fetch(image.url)
  const blob = await response.blob()
  cachedBitmap = await createBitmapFromBlob(blob)
  cachedBitmapId = image.id
  return cachedBitmap
}

// worker 请求序号：响应按 requestId 路由，避免共享单例 worker 的消息串扰
let requestSeq = 0

// 按分割模式解析某条边的边界像素线：等分模式用 gridPixelLines，自定义模式用百分比内线转换
const resolvePixelLines = (settings, total, axis) => {
  const inner = axis === 'x' ? settings.xInnerLines : settings.yInnerLines
  const count = axis === 'x' ? settings.gridCols : settings.gridRows
  return settings.splitMode === 'custom' && inner.length > 0
    ? customPixelLines(inner, total)
    : gridPixelLines(total, count)
}

const splitWithWorker = async (image, settings, startIndex = 0, originalImageName = null) => {
  const w = getWorker()
  if (!w) return null

  // 缓存的 bitmap 以克隆方式传给 worker（不能 transfer，否则主线程副本被 detach 无法复用）
  const imageBitmap = await getBitmapForImage(image)
  const requestId = ++requestSeq
  // 自定义线以百分比存储，解码后按实际尺寸转为像素边界线
  const xLinesPx = resolvePixelLines(settings, imageBitmap.width, 'x')
  const yLinesPx = resolvePixelLines(settings, imageBitmap.height, 'y')

  return new Promise((resolve, reject) => {
    let settled = false
    let timeoutId = null

    const handleMessage = (e) => {
      const { type, pieces, error, requestId: responseId } = e.data
      if (responseId !== requestId) return
      if (type === 'splitGridComplete') {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        w.removeEventListener('message', handleMessage)
        w.removeEventListener('error', handleError)
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
        requestId,
        data: {
          imageBitmap,
          xLinesPx,
          yLinesPx,
          format: settings.outputFormat,
          quality: settings.outputQuality,
          startIndex,
          originalImageName
        }
      })
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
  const isDownloading = ref(false)
  const processingProgress = ref(0)
  const processingLabel = ref('')
  const customFileNames = ref({})

  // 批量下载取消标志（非响应式，仅用于批间中断判断）
  let downloadCancelled = false

  // 打包下载并发编码数：过大易触发内存峰值，8 为吞吐与内存的平衡值
  const DOWNLOAD_BATCH_SIZE = 8

  // 第一块尺寸（自定义模式下各块宽度可能不同），与实际切图逻辑一致
  const pieceWidth = computed(() => {
    if (!imageWidth.value) return 0
    const settings = useSettingsStore()
    const lines = resolvePixelLines(settings, imageWidth.value, 'x')
    return lines[1] - lines[0]
  })

  const pieceHeight = computed(() => {
    if (!imageHeight.value) return 0
    const settings = useSettingsStore()
    const lines = resolvePixelLines(settings, imageHeight.value, 'y')
    return lines[1] - lines[0]
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
    img.src = image.url
  }

  const addUploadedImage = (image) => {
    uploadedImages.value.push(image)
  }

  const removeUploadedImage = (index) => {
    const removed = uploadedImages.value[index]
    uploadedImages.value.splice(index, 1)
    if (removed?.url) {
      URL.revokeObjectURL(removed.url)
    }

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
    uploadedImages.value.forEach((img) => {
      if (img?.url) URL.revokeObjectURL(img.url)
    })
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

  const loadImage = async (src) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = src
    })
    return img
  }

  const splitImageToPieces = async (img, settings, startIndex = 0, originalImageName = null) => {
    const pieces = []
    // 边界线像素数组（等分/自定义统一入口）
    const xLinesPx = resolvePixelLines(settings, img.width, 'x')
    const yLinesPx = resolvePixelLines(settings, img.height, 'y')
    const format = settings.outputFormat
    const quality = settings.outputQuality

    for (let row = 0; row < yLinesPx.length - 1; row++) {
      for (let col = 0; col < xLinesPx.length - 1; col++) {
        const pieceW = xLinesPx[col + 1] - xLinesPx[col]
        const pieceH = yLinesPx[row + 1] - yLinesPx[row]
        const offsetX = xLinesPx[col]
        const offsetY = yLinesPx[row]

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
          index: startIndex + row * (xLinesPx.length - 1) + col,
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
      processingLabel.value = '正在分割...'
      customFileNames.value = {}

      let pieces

      if (checkWorkerSupport()) {
        const workerPieces = await splitWithWorker(currentImage.value, settings)
        pieces = workerPieces.map((p) => createPieceFromBlob(p.blob, {
          row: p.row,
          col: p.col,
          index: p.index,
          format: settings.outputFormat
        }))
      } else {
        const img = await loadImage(currentImage.value.url)
        pieces = await splitImageToPieces(img, settings)
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
      processingLabel.value = ''
    }
  }

  const splitAllImages = async () => {
    if (uploadedImages.value.length === 0) return

    const settings = useSettingsStore()

    try {
      isProcessing.value = true
      processingProgress.value = 0
      // 分块索引将整体重排，旧的自定义命名需一并清空（与 splitImage 行为一致）
      customFileNames.value = {}

      const allPieces = []
      const totalImages = uploadedImages.value.length

      for (let i = 0; i < uploadedImages.value.length; i++) {
        const image = uploadedImages.value[i]
        let pieces

        if (checkWorkerSupport()) {
          const workerPieces = await splitWithWorker(image, settings, allPieces.length, image.name)
          pieces = workerPieces.map((p) => createPieceFromBlob(p.blob, {
            row: p.row,
            col: p.col,
            index: p.index,
            format: settings.outputFormat,
            originalImageName: p.originalImageName
          }))
        } else {
          const img = await loadImage(image.url)
          pieces = await splitImageToPieces(img, settings, allPieces.length, image.name)
        }

        allPieces.push(...pieces)
        processingProgress.value = Math.round(((i + 1) / totalImages) * 100)
        processingLabel.value = `正在分割第 ${i + 1}/${totalImages} 张`
      }

      setSplitPieces(allPieces)
      return { success: true, imageCount: uploadedImages.value.length, pieceCount: allPieces.length }
    } catch (error) {
      console.error('Split all error:', error)
      return { success: false, error: error.message }
    } finally {
      isProcessing.value = false
      processingProgress.value = 0
      processingLabel.value = ''
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
      isDownloading.value = true
      downloadCancelled = false
      processingProgress.value = 0

      const zip = new JSZip()
      let invalidNameCount = 0
      const total = splitPieces.value.length

      // 分批并行编码：格式一致时 getDownloadBlob 直接复用 blob，仅格式变更时才有真实编码开销
      for (let i = 0; i < total; i += DOWNLOAD_BATCH_SIZE) {
        if (downloadCancelled) {
          return { success: false, cancelled: true }
        }

        const batch = splitPieces.value.slice(i, i + DOWNLOAD_BATCH_SIZE)
        const entries = await Promise.all(
          batch.map(async (piece, j) => {
            const idx = i + j
            if (checkCustomNameWarning(idx)) invalidNameCount++
            const blob = await getDownloadBlob(piece, settings)
            return {
              blob,
              filename: `${generateFileName(idx, piece.originalImageName)}.${settings.outputFormat}`
            }
          })
        )

        entries.forEach(({ blob, filename }) => zip.file(filename, blob))
        processingProgress.value = Math.min(100, Math.round(((i + DOWNLOAD_BATCH_SIZE) / total) * 100))
        processingLabel.value = `正在打包 ${Math.min(total, i + DOWNLOAD_BATCH_SIZE)}/${total} 张`
      }

      if (downloadCancelled) {
        return { success: false, cancelled: true }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const originalName = currentImage.value?.name?.replace(/\.[^/.]+$/, '') || 'images'
      downloadZip(zipBlob, `${originalName}_split.zip`)

      return { success: true, count: total, invalidNameCount }
    } catch (error) {
      console.error('Download error:', error)
      return { success: false, error: error.message }
    } finally {
      isProcessing.value = false
      isDownloading.value = false
      downloadCancelled = false
      processingProgress.value = 0
      processingLabel.value = ''
    }
  }

  const cancelDownload = () => {
    if (isDownloading.value) {
      downloadCancelled = true
    }
  }

  return {
    currentImage,
    uploadedImages,
    splitPieces,
    imageWidth,
    imageHeight,
    isProcessing,
    isDownloading,
    processingProgress,
    processingLabel,
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
    downloadAll,
    cancelDownload
  }
})
