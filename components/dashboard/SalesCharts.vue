<template>
  <div class="space-y-8">
    <!-- Nueva fila para las gráficas combinadas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Ventas Mensuales por Animal</span>
            <UIcon name="heroicons-outline:bars-3-bottom-left" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <ClientOnly>
            <Bar v-if="!pending && stackedBarData.datasets.length > 0" :data="stackedBarData" :options="stackedBarOptions" />
            <div v-else-if="pending" class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div class="text-center">
                <UIcon name="heroicons-outline:chart-bar" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay datos de ventas disponibles</p>
              </div>
            </div>
          </ClientOnly>
        </div>
      </UCard>
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Ventas Detalladas por año</span>
            <UIcon name="heroicons-outline:chart-line" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <ClientOnly>
            <Line v-if="!pending && multiLineData.datasets.length > 0" :data="multiLineData" :options="multiLineOptions" />
            <div v-else-if="pending" class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div class="text-center">
                <UIcon name="heroicons-outline:chart-line" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay datos de ventas disponibles</p>
              </div>
            </div>
          </ClientOnly>
        </div>
      </UCard>
    </div>

    <!-- Tarjetas de métricas con filtros -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Métrica de ventas por mes -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Total Ventas por Mes</span>
            <UIcon name="heroicons-outline:currency-dollar" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Seleccionar Mes
            </label>
            <select
              v-model="selectedMonth"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option v-for="month in monthOptions" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 dark:text-green-400">
              ${{ monthlyTotal.toLocaleString('es-CL') }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ selectedMonthLabel }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Métrica de ventas por año -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Total Ventas por Año</span>
            <UIcon name="heroicons-outline:calendar" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Seleccionar Año
            </label>
            <select
              v-model="selectedYear"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${{ yearlyTotal.toLocaleString('es-CL') }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Año {{ selectedYear }}
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div v-if="error" class="mt-4 text-red-500">
      Error al cargar datos: {{ error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
} from 'chart.js'
import type { ChartOptions, ChartData } from 'chart.js'
import { useFetch } from '#app'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
)

type SalesPoint = { animal_id: string; monto: number; fecha_venta: string }

interface MetricsResponse {
  salesData: SalesPoint[]
  analisis_ventas: {
    ventas_anuales: Record<string, { ventas_por_mes: number[] }>
  }
}

const { data: mr, pending, error } = await useFetch<MetricsResponse>('/api/dashboard/metrics')

const metrics = computed(() => mr.value ?? {
  salesData: [] as SalesPoint[],
  analisis_ventas: { ventas_anuales: {} }
})

// Estados para los filtros
const selectedMonth = ref<number>(new Date().getMonth())
const selectedYear = ref<string>(new Date().getFullYear().toString())

// Obtener todos los animales para mapear id_animal a nombre/código
const { data: animalsRes } = await useFetch('/api/animal/animals', { params: { pageSize: 1000 } })
const animalMap = computed(() => {
  const map: Record<string, { id: string; raza: string; displayName: string }> = {}
  for (const a of animalsRes.value?.animals || []) {
    map[a.id_animal] = {
      id: a.id_animal,
      raza: a.raza || 'Sin raza',
      displayName: a.id_animal + (a.raza ? ` (${a.raza})` : '')
    }
  }
  return map
})

// Opciones para los selectores
const monthOptions = computed(() => [
  { label: 'Enero', value: 0 },
  { label: 'Febrero', value: 1 },
  { label: 'Marzo', value: 2 },
  { label: 'Abril', value: 3 },
  { label: 'Mayo', value: 4 },
  { label: 'Junio', value: 5 },
  { label: 'Julio', value: 6 },
  { label: 'Agosto', value: 7 },
  { label: 'Septiembre', value: 8 },
  { label: 'Octubre', value: 9 },
  { label: 'Noviembre', value: 10 },
  { label: 'Diciembre', value: 11 }
])

const yearOptions = computed(() => {
  const years = new Set<string>()
  for (const sale of metrics.value.salesData) {
    const year = new Date(sale.fecha_venta).getFullYear().toString()
    years.add(year)
  }
  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
})

// Labels para mostrar
const selectedMonthLabel = computed(() => {
  const month = monthOptions.value.find(m => m.value === selectedMonth.value)
  return month ? month.label : 'Mes seleccionado'
})

// Cálculo de totales
const monthlyTotal = computed(() => {
  const sales = metrics.value.salesData
  return sales
    .filter(sale => {
      const date = new Date(sale.fecha_venta)
      return date.getMonth() === selectedMonth.value
    })
    .reduce((total, sale) => total + sale.monto, 0)
})

const yearlyTotal = computed(() => {
  const sales = metrics.value.salesData
  return sales
    .filter(sale => {
      const date = new Date(sale.fecha_venta)
      return date.getFullYear().toString() === selectedYear.value
    })
    .reduce((total, sale) => total + sale.monto, 0)
})

// Agrupar ventas por mes y animal (para barras apiladas)
function getSalesByAnimalAndMonth() {
  const sales = metrics.value.salesData
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const byAnimal: Record<string, number[]> = {}
  
  for (const s of sales) {
    const date = new Date(s.fecha_venta)
    const month = date.getMonth()
    const animal = animalMap.value[s.animal_id] || { id: s.animal_id, raza: 'Sin raza', displayName: s.animal_id }
    if (!byAnimal[animal.displayName]) byAnimal[animal.displayName] = Array(12).fill(0)
    byAnimal[animal.displayName][month] += s.monto
  }
  
  return { byAnimal, months }
}

// Agrupar ventas por año y animal (para líneas anuales)
function getSalesByAnimalAndYear() {
  const sales = metrics.value.salesData
  const byAnimal: Record<string, { x: string; y: number; animalInfo: any }[]> = {}
  
  for (const s of sales) {
    const date = new Date(s.fecha_venta)
    const year = date.getFullYear().toString()
    const animal = animalMap.value[s.animal_id] || { id: s.animal_id, raza: 'Sin raza', displayName: s.animal_id }
    if (!byAnimal[animal.displayName]) byAnimal[animal.displayName] = []
    
    // Buscar si ya existe un registro para este año
    const existingYearIndex = byAnimal[animal.displayName].findIndex(d => d.x === year)
    if (existingYearIndex >= 0) {
      byAnimal[animal.displayName][existingYearIndex].y += s.monto
    } else {
      byAnimal[animal.displayName].push({
        x: year,
        y: s.monto,
        animalInfo: animal
      })
    }
  }
  
  // Ordenar por año
  for (const animal in byAnimal) {
    byAnimal[animal].sort((a, b) => parseInt(a.x) - parseInt(b.x))
  }
  
  return byAnimal
}

// Remove the problematic chartOptions and use specific ones for each chart type

// Datos para barra apilada (por mes)
const stackedBarData = computed<ChartData<'bar'>>(() => {
  const { byAnimal, months } = getSalesByAnimalAndMonth()
  const datasets = Object.entries(byAnimal).map(([animal, data], i) => ({
    label: animal,
    data,
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',   // Azul
      'rgba(16, 185, 129, 0.8)',   // Verde
      'rgba(245, 158, 11, 0.8)',   // Amarillo
      'rgba(239, 68, 68, 0.8)',    // Rojo
      'rgba(139, 92, 246, 0.8)',   // Púrpura
      'rgba(236, 72, 153, 0.8)',   // Rosa
      'rgba(14, 165, 233, 0.8)',   // Cian
      'rgba(34, 197, 94, 0.8)',    // Verde esmeralda
      'rgba(251, 146, 60, 0.8)',   // Naranja
      'rgba(168, 85, 247, 0.8)',   // Violeta
    ][i % 10],
    borderColor: [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(14, 165, 233, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(251, 146, 60, 1)',
      'rgba(168, 85, 247, 1)',
    ][i % 10],
    borderWidth: 2,
    borderRadius: 8,
    borderSkipped: false,
    hoverBackgroundColor: [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(14, 165, 233, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(251, 146, 60, 1)',
      'rgba(168, 85, 247, 1)',
    ][i % 10],
    hoverBorderColor: 'rgba(255, 255, 255, 1)',
    hoverBorderWidth: 3
  }))
  return {
    labels: months,
    datasets
  }
})
const stackedBarOptions = computed((): ChartOptions<'bar'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      position: 'top',
      labels: {
        padding: 20,
        boxWidth: 15,
        boxHeight: 8,
        color: '#374151',
        font: {
          size: 12,
          weight: 'bold'
        },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      displayColors: true,
      callbacks: {
        title: (items) => {
          const item = items[0]
          return `📅 ${item.label}`
        },
        label: (ctx) => {
          const y = ctx.parsed.y
          return `💰 ${ctx.dataset.label}: $${y.toLocaleString('es-CL')}`
        }
      }
    }
  },
  scales: {
    x: { 
      stacked: true,
      grid: {
        display: false
      },
      ticks: { 
        color: '#6B7280',
        font: {
          size: 11,
          weight: 'bold'
        },
        maxRotation: 0,
        minRotation: 0
      }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: {
        color: 'rgba(229, 231, 235, 0.5)',
        drawBorder: false,
        lineWidth: 1
      },
      ticks: {
        color: '#6B7280',
        font: {
          size: 11,
          weight: 'bold'
        },
        callback: (val) => `$${Number(val).toLocaleString('es-CL')}`,
        padding: 8
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
}) as ChartOptions<'bar'>)

// Datos para líneas múltiples (por año)
const multiLineData = computed<ChartData<'line'>>(() => {
  const byAnimal = getSalesByAnimalAndYear()
  const datasets = Object.entries(byAnimal).map(([animal, data], i) => ({
    label: animal,
    data: data.map(d => ({ x: parseInt(d.x), y: d.y })),
    borderColor: [
      'rgba(59, 130, 246, 1)',   // Azul
      'rgba(16, 185, 129, 1)',   // Verde
      'rgba(245, 158, 11, 1)',   // Amarillo
      'rgba(239, 68, 68, 1)',    // Rojo
      'rgba(139, 92, 246, 1)',   // Púrpura
      'rgba(236, 72, 153, 1)',   // Rosa
      'rgba(14, 165, 233, 1)',   // Cian
      'rgba(34, 197, 94, 1)',    // Verde esmeralda
      'rgba(251, 146, 60, 1)',   // Naranja
      'rgba(168, 85, 247, 1)',   // Violeta
    ][i % 10],
    backgroundColor: [
      'rgba(59, 130, 246, 0.1)',
      'rgba(16, 185, 129, 0.1)',
      'rgba(245, 158, 11, 0.1)',
      'rgba(239, 68, 68, 0.1)',
      'rgba(139, 92, 246, 0.1)',
      'rgba(236, 72, 153, 0.1)',
      'rgba(14, 165, 233, 0.1)',
      'rgba(34, 197, 94, 0.1)',
      'rgba(251, 146, 60, 0.1)',
      'rgba(168, 85, 247, 0.1)',
    ][i % 10],
    tension: 0.4,
    fill: true,
    pointRadius: 6,
    pointHoverRadius: 10,
    pointBackgroundColor: [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(14, 165, 233, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(251, 146, 60, 1)',
      'rgba(168, 85, 247, 1)',
    ][i % 10],
    pointBorderColor: '#ffffff',
    pointBorderWidth: 3,
    pointHoverBackgroundColor: '#ffffff',
    pointHoverBorderColor: [
      'rgba(59, 130, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(14, 165, 233, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(251, 146, 60, 1)',
      'rgba(168, 85, 247, 1)',
    ][i % 10],
    pointHoverBorderWidth: 4,
    borderWidth: 3
  }))
  return {
    datasets
  }
})
const multiLineOptions = computed((): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      position: 'top',
      labels: {
        padding: 20,
        boxWidth: 15,
        boxHeight: 8,
        color: '#374151',
        font: {
          size: 12,
          weight: 'bold'
        },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      displayColors: true,
      callbacks: {
        title: (items) => {
          const item = items[0]
          return `📅 Año: ${item.parsed.x}`
        },
        label: (ctx) => {
          const y = ctx.parsed.y
          return `💰 ${ctx.dataset.label}: $${y.toLocaleString('es-CL')}`
        }
      }
    }
  },
  scales: {
    x: { 
      grid: {
        color: 'rgba(229, 231, 235, 0.3)',
        drawBorder: false,
        lineWidth: 1
      },
      ticks: { 
        color: '#6B7280',
        font: {
          size: 11,
          weight: 'bold'
        },
        maxRotation: 0,
        minRotation: 0,
        padding: 8
      }
    },
    y: {
      grid: {
        color: 'rgba(229, 231, 235, 0.3)',
        drawBorder: false,
        lineWidth: 1
      },
      ticks: {
        color: '#6B7280',
        font: {
          size: 11,
          weight: 'bold'
        },
        callback: (val) => `$${Number(val).toLocaleString('es-CL')}`,
        padding: 8
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
}) as ChartOptions<'line'>)
</script>