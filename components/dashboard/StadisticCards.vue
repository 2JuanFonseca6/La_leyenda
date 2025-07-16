<template>
  <div>
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Animales por Tipo -->
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Animales por Tipo</span>
            <UIcon name="i-heroicons-chart-pie" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <client-only>
            <Bar v-if="!pendingAnimals" :data="animalsByTypeData" :options="chartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </client-only>
        </div>
      </UCard>

      <!-- Stock Bajo (Top 5) -->
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Stock Bajo (Top 5)</span>
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <client-only>
            <Bar v-if="!pendingStock" :data="lowStockData" :options="stockChartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </client-only>
        </div>
      </UCard>

      <!-- Gastos por Categoría (placeholder) -->
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Gastos por Categoría</span>
            <UIcon name="i-heroicons-currency-dollar-20-solid" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4 flex items-center justify-center text-gray-400">
          <span>Próximamente...</span>
        </div>
      </UCard>
    </div>
    <div v-if="errorAnimals || errorStock" class="mt-4 text-red-500">
      Error al cargar datos: {{ errorAnimals?.message || errorStock?.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { ChartOptions, ChartData } from 'chart.js'
import { useFetch } from '#app'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Animales por tipo
const { data: animalsRes, pending: pendingAnimals, error: errorAnimals } = await useFetch('/api/animal/animals', { params: { pageSize: 1000 } })
const animals = computed(() => animalsRes.value?.animals || [])
const animalsByType = computed(() => {
  const counts: Record<string, number> = {};
  for (const a of animals.value) {
    if (!a.tipo_animal) continue;
    counts[a.tipo_animal] = (counts[a.tipo_animal] || 0) + 1;
  }
  return counts;
});
const animalsByTypeData = computed<ChartData<'bar'>>(() => ({
  labels: Object.keys(animalsByType.value),
  datasets: [{
    label: 'Cantidad',
    data: Object.values(animalsByType.value),
    backgroundColor: '#c3791b'
  }]
}))

// Stock bajo (top 5)
const { data: stockRes, pending: pendingStock, error: errorStock } = await useFetch('/api/stock/stock', { params: { pageSize: 1000 } })
interface StockResponse { items?: Array<{ descripcion: string; cantidad: number }> }
const stock = computed(() => {
  const val = stockRes.value;
  if (val && typeof val === 'object' && 'items' in val && Array.isArray((val as any).items)) {
    return (val as any).items;
  }
  return [];
});
const lowStock = computed(() => [...stock.value].sort((a, b) => a.cantidad - b.cantidad).slice(0, 5))
const lowStockData = computed<ChartData<'bar'>>(() => ({
  labels: lowStock.value.map(i => i.descripcion),
  datasets: [{
    label: 'Cantidad',
    data: lowStock.value.map(i => i.cantidad),
    backgroundColor: '#c3791b'
  }]
}))
const stockChartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { beginAtZero: true } }
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { beginAtZero: true } }
}))
</script>