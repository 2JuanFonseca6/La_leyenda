<template>
  <BreadNav :items="breadcrumbItems" />

  <div class="container mx-auto px-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold uppercase tracking-widest text-gray-800 dark:text-white">
        Dashboard
      </h1>
    </div>

    <!-- Menú mejorado con diseño consistente -->
    <div class="flex gap-2 mb-4 bg-[var(--color-custom-50)] p-2 rounded-lg dark:bg-[var(--color-custom-900)]">
      <UButton
        v-for="view in views"
        :key="view.id"
        :color="currentView === view.id ? 'primary' : 'neutral'"
        @click="currentView = view.id"
        class="flex-1 justify-center"
      >
        <UIcon :name="view.icon" class="mr-2" />
        {{ view.label }}
      </UButton>
    </div>

    <!-- Contenedor principal con grid responsivo -->
    <div class="w-full">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="transform opacity-0"
      >
        <div :key="currentView">
          <MetricsCards v-if="currentView === 'metrics'" />
          <StadisticCards v-if="currentView === 'charts'" />
          <SalesCharts v-if="currentView === 'sales'" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { BreadcrumbItem } from "@nuxt/ui";
import MetricsCards from '~/components/dashboard/MetricsCards.vue'
import StadisticCards from '~/components/dashboard/StadisticCards.vue'
import SalesCharts from '~/components/dashboard/SalesCharts.vue'

definePageMeta({ layout: "logged" });

const views = [
  { id: 'metrics', label: 'Métricas', icon: 'i-heroicons-chart-bar-square' },
  { id: 'charts', label: 'Gráficos', icon: 'i-heroicons-chart-pie' },
  { id: 'sales', label: 'Ventas', icon: 'i-heroicons-currency-dollar' }
];

const currentView = ref('metrics');

const breadcrumbItems = ref<BreadcrumbItem[]>([
  {
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/'
  }
]);
</script>