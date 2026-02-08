<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
</script>