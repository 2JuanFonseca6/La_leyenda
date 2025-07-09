<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="w-full max-w-4xl bg-white rounded shadow p-4">
      <h2 class="text-xl font-bold mb-4">Visualizador de PDF</h2>
      <iframe
        v-if="pdfUrl"
        :src="pdfUrl"
        class="w-full h-[80vh] border rounded"
        frameborder="0"
      ></iframe>
      <div v-else class="text-red-500">No se proporcionó URL de PDF.</div>
      <NuxtLink to="/" class="mt-6 inline-block text-primary underline">Volver al inicio</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const pdfUrl = decodeURIComponent(route.query.url || '')
</script> 