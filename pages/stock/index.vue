<template>
  <BreadNav :items="breadcrumbItems" />
  <h1 class="text-3xl font-bold tracking-widest uppercase text-center">Inventario</h1>
  
  <!-- Información del inventario general -->
  <div class="text-center my-6">
    <p class="text-gray-600 mb-4">Gestiona el inventario general de productos y suministros</p>
    <UButton 
      to="/stock/pajillas"
      color="primary"
      icon="i-healthicons-syringe-outline"
      class="mb-4"
    >
      Ir a Inventario de Pajillas
    </UButton>
  </div>

  <!-- Inventario General -->
  <div>
    <div class="justify-end flex my-4 space-x-4">
      <StockAddModal v-if="userRole === 'admin'" @saved="handleSaved" />
      <StockStadistics ref="stats" />
    </div>
    <StockTable ref="stockTable" @refreshed="handleTableRefreshed" />
  </div>
</template>

<script setup lang="ts">
import BreadNav from '~/components/navigation/BreadNav.vue';
import type { BreadcrumbItem } from '@nuxt/ui'
import { useUserRole } from '~/composables/arestricted'

const { userRole } = useUserRole()

const stockTable = ref();
const stats = ref();

const handleSaved = () => {
  stockTable.value?.fetchInventory();
  stats.value?.refreshMetrics();
};

const handleTableRefreshed = () => {
  stats.value?.refreshMetrics();
};

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    {
      label: 'Inicio',
      icon: 'i-heroicons-home-solid',
      to: '/'
    },
    {
      label: 'Inventario',
      icon: 'i-healthicons-i-exam-multiple-choice-outline',
      to: '/stock',
    }
  ];

  if (userRole.value === 'admin') {
    items.push({
      label: 'Proveedores',
      icon: 'i-healthicons-agriculture-worker-outline',
      to: '/stock/providers'
    });
  }

  return items;
});

definePageMeta({
  layout: "logged"
})
</script>