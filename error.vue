<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})
</script>

<template>
  <div class="bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] h-screen flex flex-col items-center justify-center gap-4 text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)] space-y-4">
    <img src="/assets/img/logo/logo-negro.webp" alt="Logo San Rafael" class="h-40 w-auto drop-shadow-lg mb-2 dark:hidden" />
    <img src="/assets/img/logo/logo-white.webp" alt="Logo San Rafael" class="h-40 w-auto drop-shadow-lg mb-2 hidden dark:block" />
    <h1 class="text-7xl font-extrabold tracking-tight mb-2">¡Ups! {{ error?.statusCode || 500 }}</h1>
    <p class="text-xl text-center max-w-lg mb-4">Ha ocurrido un error inesperado.<br>Por favor intenta de nuevo o vuelve al inicio.</p>
    <UButton class="px-8 py-3 text-lg font-bold rounded-lg shadow-md bg-[var(--color-custom-400)] dark:bg-[var(--color-custom-100)] text-white dark:text-[var(--color-custom-400)] hover:scale-105 transition-transform">
      <NuxtLink to="/">VOLVER AL INICIO</NuxtLink>
    </UButton>
  </div>
</template>
