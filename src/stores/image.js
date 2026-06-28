import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { canvasToBlob, downloadZip } from '../utils/imageProcessing'
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

const blobToDataUrl = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const blobToCanvas = async (blob) => {
  const img = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  img.close()
  return canvas
}

const splitWithWorker = async (imageDataUrl, rows, cols, format, quality, startIndex = 0, originalImageName = null) => {
  const w = getWorker()
  if (!w) return null

  const response = await fetch(imageDataUrl)
  const blob = await response.blob()
  const imageBitmap = await createImageBitmap(blob)

  return new Promise((resolve, reject) => {
    const handleMessage = (e) => {
      const { type, pieces, error } = e.data
      if (type === 'splitGridComplete') {
        w.removeEventListener('message', handleMessage)
        imageBitmap.close()
        resolve(pieces)
      } else if (type === 'error') {
        w.removeEventListener('message', handleMessage)
        imageBitmap.close()
        reject(new Error(error))
      }
    }

    w.addEventListener('message', handleMessage)
    w.postMessage({
      type: 'splitGrid',
      data: { imageBitmap, rows, cols, format, quality, startIndex, originalImageName }
    }, [imageBitmap])
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

  const pieceWidth = computed(() => {
    if (!imageWidth.value) return 0
    const settings = useSettingsStore()
    return Math.round(imageWidth.value / settings.gridCols)
  })

  const pieceHeight = computed(() => {
    if (!imageHeight.value) return 0
    const settings = useSettingsStore()
    return Math.round(imageHeight.value / settings.gridRows)
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
    splitPieces.value = []
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
    splitPieces.value = pieces
  }

  const clearImage = () => {
    currentImage.value = null
    uploadedImages.value = []
    splitPieces.value = []
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

  const splitImageToPieces = (img, rows, cols, format, quality, startIndex = 0, originalImageName = null) => {
    const pieces = []
    const pieceW = Math.floor(img.width / cols)
    const pieceH = Math.floor(img.height / rows)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const canvas = document.createElement('canvas')
        canvas.width = pieceW
        canvas.height = pieceH
        const ctx = canvas.getContext('2d')

        ctx.drawImage(
          img,
          col * pieceW,
          row * pieceH,
          pieceW,
          pieceH,
          0,
          0,
          pieceW,
          pieceH
        )

        const dataUrl = canvas.toDataURL(`image/${format}`, quality / 100)
        const piece = {
          canvas,
          dataUrl,
          row,
          col,
          index: startIndex + row * cols + col
        }
        if (originalImageName) {
          piece.originalImageName = originalImageName
        }
        pieces.push(piece)
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
        pieces = await Promise.all(
          workerPieces.map(async (p) => ({
            canvas: await blobToCanvas(p.blob),
            dataUrl: await blobToDataUrl(p.blob),
            row: p.row,
            col: p.col,
            index: p.index
          }))
        )
      } else {
        const img = await loadImage(currentImage.value.dataUrl)
        pieces = splitImageToPieces(img, settings.gridRows, settings.gridCols, settings.outputFormat, settings.outputQuality)
      }

      processingProgress.value = 100
      splitPieces.value = pieces
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
          pieces = await Promise.all(
            workerPieces.map(async (p) => ({
              canvas: await blobToCanvas(p.blob),
              dataUrl: await blobToDataUrl(p.blob),
              row: p.row,
              col: p.col,
              index: p.index,
              originalImageName: p.originalImageName
            }))
          )
        } else {
          const img = await loadImage(image.dataUrl)
          pieces = splitImageToPieces(
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

      splitPieces.value = allPieces
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

    const name = originalName || currentImage.value?.name?.replace(/\.[^/.]+$/, '') || 'image'
    return settings.namingTemplate
      .replace('{original}', name.replace(/\.[^/.]+$/, ''))
      .replace('{index}', String(index + 1).padStart(3, '0'))
  }

  const invalidChars = /[<>:"/\\|?*]/g

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

  const downloadPiece = async (index) => {
    const piece = splitPieces.value[index]
    if (!piece) return

    const settings = useSettingsStore()
    const blob = await canvasToBlob(piece.canvas, `image/${settings.outputFormat}`, settings.outputQuality / 100)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${generateFileName(index, piece.originalImageName)}.${settings.outputFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadAll = async () => {
    if (splitPieces.value.length === 0) return

    const settings = useSettingsStore()

    try {
      isProcessing.value = true
      processingProgress.value = 0

      const zip = new JSZip()

      for (let i = 0; i < splitPieces.value.length; i++) {
        const piece = splitPieces.value[i]
        const blob = await canvasToBlob(piece.canvas, `image/${settings.outputFormat}`, settings.outputQuality / 100)
        const filename = `${generateFileName(i, piece.originalImageName)}.${settings.outputFormat}`
        zip.file(filename, blob)
        processingProgress.value = Math.round(((i + 1) / splitPieces.value.length) * 100)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const originalName = currentImage.value?.name?.replace(/\.[^/.]+$/, '') || 'images'
      downloadZip(zipBlob, `${originalName}_split.zip`)

      return { success: true, count: splitPieces.value.length }
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
