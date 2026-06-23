import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const show = ref(false)
  const message = ref('')
  const type = ref('success')
  let timer = null

  const showToast = (msg, toastType = 'success', duration = 3000) => {
    if (timer) {
      clearTimeout(timer)
    }
    message.value = msg
    type.value = toastType
    show.value = true

    timer = setTimeout(() => {
      show.value = false
      timer = null
    }, duration)
  }

  const hideToast = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    show.value = false
  }

  return {
    show,
    message,
    type,
    showToast,
    hideToast
  }
})
