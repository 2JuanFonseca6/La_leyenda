<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
      <!-- 1) Ventas por Animal -->
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Ventas por Animal</span>
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <ClientOnly>
            <Bar v-if="!pending" :data="salesBarData" :options="chartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </ClientOnly>
        </div>
      </UCard>

      <!-- 2) Evolución Mensual Año Actual -->
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Evolución de Ventas</span>
            <UIcon name="i-heroicons-presentation-chart-line" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <ClientOnly>
            <Line v-if="!pending" :data="salesLineData" :options="chartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </ClientOnly>
        </div>
      </UCard>

      <!-- 3) % Variación entre Ventas Consecutivas -->
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">% Variación Ventas</span>
            <UIcon name="i-heroicons-arrow-trending-up-20-solid" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4">
          <ClientOnly>
            <Line v-if="!pending" :data="salesPctData" :options="pctChartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </ClientOnly>
        </div>
      </UCard>
    </div>

    <div v-if="error" class="mt-4 text-red-500">
      Error al cargar datos: {{ error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const chartOptions = computed<ChartOptions<'bar' | 'line'>>(() => ({
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
          const y = ctx.parsed.y
          return typeof y === 'number'
            ? `\$${y.toLocaleString('es-CL')}`
            : ''
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
        color: '#6B7280',
        callback: (val) => `\$${Number(val).toLocaleString('es-CL')}`
      },
      grid: {
        drawBorder: false,
        color: '#E5E7EB'
      }
    }
  }
}))

const pctChartOptions = computed<ChartOptions<'line'>>(() => ({
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
          const y = ctx.parsed.y
          return typeof y === 'number'
            ? `${y.toFixed(2)}%`
            : ''
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
        color: '#6B7280',
        callback: (val) => `${Number(val).toFixed(0)}%`
      },
      grid: {
        drawBorder: false,
        color: '#E5E7EB'
      }
    }
  }
}))

const salesBarData = computed<ChartData<'bar'>>(() => {
  const byAnimal = metrics.value.salesData.reduce<Record<string, number>>((acc, s) => {
    acc[s.animal_id] = (acc[s.animal_id] || 0) + s.monto
    return acc
  }, {})
  return {
    labels: Object.keys(byAnimal),
    datasets: [{
      label: 'Ventas por Animal',
      data: Object.values(byAnimal),
      backgroundColor: '#c3791b'
    }]
  }
})

const salesLineData = computed<ChartData<'line'>>(() => {
  const año = new Date().getFullYear().toString()
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const ventas = metrics.value.analisis_ventas.ventas_anuales[año]?.ventas_por_mes ?? Array(12).fill(0)
  return {
    labels: meses,
    datasets: [{
      label: `Ventas ${año}`,
      data: ventas,
      borderColor: '#c3791b',
      tension: 0.2,
      fill: false,
      pointBackgroundColor: '#c3791b'
    }]
  }
})

const salesPctData = computed<ChartData<'line'>>(() => {
  const sorted = [...metrics.value.salesData].sort(
    (a,b) => new Date(a.fecha_venta).getTime() - new Date(b.fecha_venta).getTime()
  )
  const dates = sorted.map(s => new Date(s.fecha_venta).toLocaleDateString())
  const pct = sorted.map((s,i,arr) => {
    if (i===0) return 0
    const prev = arr[i-1].monto
    return prev > 0
      ? ((s.monto - prev) / prev) * 100
      : 0
  })
  return {
    labels: dates,
    datasets: [{
      label: '% Variación',
      data: pct,
      borderColor: '#c3791b',
      tension: 0.2,
      fill: false,
      pointRadius: 3,
      pointBackgroundColor: '#c3791b'
    }]
  }
})
</script>