<template>
  <!-- Encabezado de impresión -->
  <PrintHeader title="Listado de Animales" />
  
  <BreadNav :items="breadcrumbItems" />
  <h1 class="text-3xl font-bold tracking-widest uppercase text-center">Animales</h1>
  <AnimalTable />
</template>

<script setup lang="ts">
import BreadNav from '~/components/navigation/BreadNav.vue';
import PrintHeader from '~/components/PrintHeader.vue';
import type { BreadcrumbItem } from '@nuxt/ui'

const breadcrumbItems: BreadcrumbItem[] = [
  {
    label: 'Inicio',
    icon: 'i-heroicons-home-solid',
    to: '/'
  },
  {
    label: 'Animales',
    icon: 'i-healthicons-animal-cow',
    to: '/animals'
  },

  {
    label: 'Reproducción',
    icon: 'i-healthicons-syringe-outline',
    to: '/animals/reproduction',
    showInBreadcrumb: false
  }
]

definePageMeta({
  layout: "logged"
})
</script>