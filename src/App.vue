<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    <Toast
      v-if="toastStore.show"
      :message="toastStore.message"
      :type="toastStore.type"
      @close="toastStore.hideToast"
    />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Toast from './components/Toast.vue'
import { useToastStore } from './stores/toast'

const toastStore = useToastStore()
</script>