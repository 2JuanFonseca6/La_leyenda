<template>
  <BreadNav :items="breadcrumbItems" />
  <h1 class="text-3xl font-bold tracking-widest uppercase text-center">Provedores</h1>
  <div class="justify-end flex my-4 space-x-4">
    <ProviderAddModal @saved="refreshTable" />
  </div>
  <div class="flex justify-start mb-4 px-4">
    <ProviderSearch @search="onProviderSearchInput" />
  </div>
  <ProviderTable ref="providerTable" :search="providerSearchTerm"/>
</template>

<script setup lang="ts">
import BreadNav from '~/components/navigation/BreadNav.vue';
import { ref } from 'vue';
import type { BreadcrumbItem } from '@nuxt/ui'
import ProviderSearch from '~/components/providers/ProviderSearch.vue';

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

const providerSearchTerm = ref('');

const refreshTable = () => {
  providerTable.value?.fetchProviders?.();
}

const onProviderSearchInput = (val: string) => {
  providerSearchTerm.value = val;
}

definePageMeta({
  middleware: ['restricted'],
  layout: "logged"
})
</script>