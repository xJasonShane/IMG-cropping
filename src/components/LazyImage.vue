<template>
  <div class="lazy-image-container" :style="{ height: placeholderHeight }">
    <img
      v-if="isLoaded || !lazy"
      :src="src"
      :alt="alt"
      :class="imageClass"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-else class="placeholder">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  lazy: {
    type: Boolean,
    default: true
  },
  placeholderHeight: {
    type: String,
    default: '200px'
  },
  imageClass: {
    type: String,
    default: 'w-full h-full object-cover'
  }
})

const emit = defineEmits(['load', 'error'])

const isLoaded = ref(false)
const isError = ref(false)
const observer = ref(null)

const handleLoad = () => {
  isLoaded.value = true
  emit('load')
}

const handleError = () => {
  isError.value = true
  emit('error')
}

onMounted(() => {
  if (!props.lazy) {
    isLoaded.value = true
    return
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isLoaded.value = true
          observer.value?.disconnect()
        }
      })
    },
    {
      rootMargin: '50px'
    }
  )

  const imgElement = document.querySelector('.lazy-image-container img')
  if (imgElement) {
    observer.value.observe(imgElement.parentElement)
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
}

.placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.1;
}

.lazy-image-container img {
  transition: opacity 0.3s ease;
}
</style>