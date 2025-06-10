<template>
  <BreadNav :items="breadcrumbItems" />
    <h1 class="text-3xl font-bold tracking-widest uppercase text-center">Genealogía</h1>
  <GenealogyTable  />

</template>

<script setup lang="ts">
import BreadNav from '~/components/navigation/BreadNav.vue';

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
    label: 'reproducción',
    icon: 'i-healthicons-sperm-outline',
    to: '/animals/genealogy'
  }
]

definePageMeta({
  layout: "logged"
})
</script>