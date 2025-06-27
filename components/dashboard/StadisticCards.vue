<template>
  <div>
    <div class="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
      <!-- Card 1: Recursos por Animal -->
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Recursos por Animal</span>
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <client-only>
            <Bar v-if="!pending" :data="animalBarData" :options="chartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </client-only>
        </div>
      </UCard>

      <!-- Card 2: Control de Inventario -->
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Control de Inventario</span>
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <client-only>
            <Bar v-if="!pending" :data="inventoryBarData" :options="chartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </client-only>
        </div>
      </UCard>

      <!-- Card 3: Gastos Totales -->
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Gastos Totales</span>
            <UIcon name="i-heroicons-currency-dollar-20-solid" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <client-only>
            <Bar v-if="!pending" :data="costBarData" :options="chartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </client-only>
        </div>
      </UCard>
    </div>

    <div v-if="error" class="mt-4 text-red-500">
      Error al cargar gráficos: {{ error.message }}
    </div>

    <div class="mt-10">
      <AnimalWeightTimeline />
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
import { AnimalWeightTimeline } from './index'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

type StatsData = {
  totalAnimals: number
  weightIncreasePercent: number
  totalInsumos: number
  lowStock: number
  totalExpenses: number
}

const { data: mr, pending, error } = await useFetch<StatsData>('/api/dashboard/metrics')

const stats = computed(() => mr.value ?? {
  totalAnimals: 0,
  weightIncreasePercent: 0,
  totalInsumos: 0,
  lowStock: 0,
  totalExpenses: 0
})

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      position: 'top',
      labels: { 
        padding: 20,
        boxWidth: 10,
        color: '#6B7280'
      }
    },
    tooltip: {
      padding: 12,
      callbacks: {
        label: (ctx) => {
          let label = ctx.dataset.label || ''
          if (label) label += ': '
          const y = ctx.parsed.y
          if (y != null) {
            label += new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              maximumFractionDigits: 0
            }).format(y)
          }
          return label
        }
      }
    }
  },
  scales: {
    x: { 
      ticks: { 
        color: '#6B7280',
        maxRotation: 45,
        minRotation: 45
      }
    },
    y: { 
      ticks: { 
        color: '#6B7280'
      },
      grid: {
        drawBorder: false,
        color: '#E5E7EB'
      }
    }
  }
}))

const animalBarData = computed<ChartData<'bar'>>(() => ({
  labels: ['Total Animales', 'Incremento de Peso (%)'],
  datasets: [{
    label: 'Animales',
    data: [stats.value.totalAnimals, stats.value.weightIncreasePercent],
    backgroundColor: ['#c3791b', '#c3791b']
  }]
}))

const inventoryBarData = computed<ChartData<'bar'>>(() => ({
  labels: ['Total Insumos', 'Stock Bajo'],
  datasets: [{
    label: 'Inventario',
    data: [stats.value.totalInsumos, stats.value.lowStock],
    backgroundColor: ['#c3791b', '#c3791b']
  }]
}))

const costBarData = computed<ChartData<'bar'>>(() => ({
  labels: ['Gastos Totales'],
  datasets: [{
    label: 'Gastos',
    data: [stats.value.totalExpenses],
    backgroundColor: '#c3791b'
  }]
}))
</script>