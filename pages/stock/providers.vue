<template>
  <BreadNav :items="breadcrumbItems" />
  <h1 class="text-3xl font-bold tracking-widest uppercase text-center">Provedores</h1>
  <div class="justify-end flex my-4 space-x-4">
    <ProviderAddModal @saved="refreshTable" />
  </div>
  <ProviderTable ref="providerTable"/>
</template>

<script setup lang="ts">
import BreadNav from '~/components/navigation/BreadNav.vue';
import { ref } from 'vue';
import type { BreadcrumbItem } from '@nuxt/ui'
const providerTable = ref();
const breadcrumbItems: BreadcrumbItem[] = [
  {
    label: 'Inicio',
    icon: 'i-heroicons-home-solid',
    to: '/'
  },
  {
    label: 'Inventario',
    icon: 'i-healthicons-i-exam-multiple-choice-outline',
    to: '/stock',
  },
  {
    label: 'Proveedores',
    icon: 'i-healthicons-agriculture-worker-outline',
    to: '/stock/providers',
  }
]

const refreshTable = () => {
  providerTable.value?.fetchProviders?.();
}

definePageMeta({
  middleware: ['restricted'],
  layout: "logged"
})
</script>