<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Animales por Tipo -->
      <UCard class="w-full max-w-lg min-h-[300px] md:min-h-[400px] mx-auto">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Animales por Tipo</span>
            <UIcon name="i-heroicons-chart-pie" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[220px] md:h-[320px] p-4 overflow-x-auto">
          <client-only>
            <Bar v-if="!pendingAnimals" :data="animalsByTypeData" :options="chartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </client-only>
        </div>
      </UCard>
      <!-- Animales por Tipo de Ganado (PURO vs COMERCIO) -->
      <UCard class="w-full max-w-lg min-h-[300px] md:min-h-[400px] mx-auto">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Animales por Tipo de Ganado</span>
            <UIcon name="i-heroicons-pie-chart" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[220px] md:h-[320px] p-4 overflow-x-auto">
          <client-only>
            <Pie v-if="!pendingAnimals" :data="animalsByTipoGanadoData" :options="{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true}}}" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </client-only>
        </div>
      </UCard>
      <!-- Stock Bajo (Top 5) -->
      <UCard class="w-full max-w-lg min-h-[300px] md:min-h-[400px] mx-auto">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Stock Bajo (Top 5)</span>
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[220px] md:h-[320px] p-4 overflow-x-auto">
          <client-only>
            <Bar v-if="!pendingStock" :data="lowStockData" :options="stockChartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </client-only>
        </div>
      </UCard>
      <!-- Fila centrada para las dos últimas tarjetas -->
      <div class="col-span-1 md:col-span-2 xl:col-span-3 flex flex-wrap justify-center gap-8">
        <!-- Animales por Corral/Lote -->
        <UCard class="w-full max-w-xl min-h-[300px] md:min-h-[400px] mx-auto mb-6 md:mb-0">
          <template #header>
            <div class="flex items-center justify-between p-2">
              <span class="text-lg font-medium">Animales por Corral/Lote</span>
              <UIcon name="i-heroicons-rectangle-group" class="w-6 h-6 ml-2" />
            </div>
          </template>
          <div class="h-[220px] md:h-[320px] p-4 overflow-x-auto">
            <client-only>
              <Bar v-if="!pendingAnimals" :data="animalesPorCorralData" :options="corralChartOptions" />
              <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </client-only>
          </div>
        </UCard>
        <!-- Animales por Estado de Salud -->
        <UCard class="w-full max-w-xl min-h-[300px] md:min-h-[400px] mx-auto">
          <template #header>
            <div class="flex items-center justify-between p-2">
              <span class="text-lg font-medium">Animales por Estado de Salud</span>
              <UIcon name="i-heroicons-heart" class="w-6 h-6 ml-2" />
            </div>
          </template>
          <div class="h-[220px] md:h-[320px] p-4 overflow-x-auto">
            <client-only>
              <Pie v-if="!pendingAnimals" :data="animalsBySaludData" :options="{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true}}}" />
              <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </client-only>
          </div>
        </UCard>
      </div>
    </div>
    <div class="mt-10">
      <UCard class="min-h-[400px]">
        <template #header>
          <div class="flex items-center justify-between p-2">
            <span class="text-lg font-medium">Incremento Anual Promedio de Peso</span>
            <UIcon name="i-heroicons-chart-line" class="w-6 h-6 ml-2" />
          </div>
        </template>
        <div class="h-[320px] p-4 overflow-y-auto">
          <client-only>
            <Line v-if="!pendingAnimals && !pendingPesos" :data="pesoAnualData" :options="lineChartOptions" />
            <div v-else class="h-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </client-only>
        </div>
      </UCard>
    </div>
    <div v-if="errorAnimals || errorStock || errorPesos" class="mt-4 text-red-500">
      Error al cargar datos: {{ errorAnimals?.message || errorStock?.message || errorPesos?.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Line } from 'vue-chartjs'
import { Pie } from 'vue-chartjs'
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
import { ref } from 'vue'

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

// Fetch corrales
const { data: corralesRes, pending: pendingCorrales, error: errorCorrales } = await useFetch('/api/corrales/corrales', { params: { pageSize: 1000 } })
const corrales = computed(() => Array.isArray(corralesRes.value?.corrales) ? corralesRes.value.corrales : [])
const corralIdToNombre = computed(() => {
  const map: Record<string, string> = {}
  for (const c of corrales.value) {
    map[c.id_corral] = c.nombre
  }
  return map
})

// Agrupar animales por corral/lote (incluir todos los corrales)
const animalesPorCorral = computed(() => {
  const counts: Record<string, number> = {};
  // Inicializar todos los corrales en 0
  for (const c of corrales.value) {
    counts[c.nombre] = 0;
  }
  // Sumar animales por corral
  for (const a of animals.value) {
    const corralId = (a as any).id_corral;
    const nombre = corralId ? (corralIdToNombre.value[corralId] || corralId) : 'Sin corral';
    counts[nombre] = (counts[nombre] || 0) + 1;
  }
  return counts;
});
const animalesPorCorralData = computed<ChartData<'bar'>>(() => ({
  labels: Object.keys(animalesPorCorral.value),
  datasets: [{
    label: 'Cantidad',
    data: Object.values(animalesPorCorral.value),
    backgroundColor: '#c3791b'
  }]
}));
const corralChartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { beginAtZero: true } }
}));

// Obtener historiales de peso de todos los animales
const pesosPorAnimal = ref<Record<string, any[]>>({})
const errorPesos = ref<Error|null>(null)
const pendingPesos = ref(true)

if (!pendingAnimals.value && animals.value.length > 0) {
  pendingPesos.value = true
  Promise.all(
    animals.value.map(async (a) => {
      try {
        const res = await $fetch(`/api/animal/specific/${a.id_animal}/peso`)
        pesosPorAnimal.value[a.id_animal] = res.historial_peso || []
      } catch (e) {
        errorPesos.value = e instanceof Error ? e : new Error(String(e))
      }
    })
  ).finally(() => {
    pendingPesos.value = false
  })
}

// Calcular incremento anual promedio
const pesoAnualData = computed(() => {
  // Map: año -> array de incrementos
  const incrementosPorAño: Record<string, number[]> = {}
  for (const [id, historial] of Object.entries(pesosPorAnimal.value)) {
    if (!Array.isArray(historial) || historial.length < 2) continue
    // Agrupar por año
    const porAño: Record<string, { primero: number, ultimo: number }> = {}
    for (const p of historial) {
      const año = new Date(p.fecha_registro).getFullYear().toString()
      if (!(año in porAño)) {
        porAño[año] = { primero: p.peso, ultimo: p.peso }
      } else {
        porAño[año].ultimo = p.peso
      }
    }
    for (const año in porAño) {
      const inc = porAño[año].ultimo - porAño[año].primero
      if (!incrementosPorAño[año]) incrementosPorAño[año] = []
      incrementosPorAño[año].push(inc)
    }
  }
  // Calcular promedio por año
  const años = Object.keys(incrementosPorAño).sort()
  const promedios = años.map(año => {
    const arr = incrementosPorAño[año]
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  })
  return {
    labels: años,
    datasets: [{
      label: 'Incremento promedio (kg)',
      data: promedios,
      borderColor: '#c3791b',
      backgroundColor: 'rgba(195,121,27,0.2)',
      tension: 0.2,
      fill: true
    }]
  }
})

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true } },
  scales: { x: { beginAtZero: false }, y: { beginAtZero: true } }
}))

// Animales por tipo_ganado (PURO vs COMERCIO)
const animalsByTipoGanado = computed(() => {
  const counts: Record<string, number> = { PURO: 0, COMERCIO: 0 };
  for (const a of animals.value) {
    if (!a.tipo_ganado) continue;
    const tipo = String(a.tipo_ganado).trim().toUpperCase();
    if (tipo === 'SALDRAN PURO' || tipo === 'PURO') counts.PURO++;
    else if (tipo === 'COMERCIO') counts.COMERCIO++;
  }
  return counts;
});
const animalsByTipoGanadoData = computed<ChartData<'pie'>>(() => ({
  labels: ['PURO', 'COMERCIO'],
  datasets: [{
    label: 'Cantidad',
    data: [animalsByTipoGanado.value.PURO, animalsByTipoGanado.value.COMERCIO],
    backgroundColor: ['#c3791b', '#6B7280'],
  }]
}));

// Animales por estado de salud
const estadosSalud = [
  'EXCELENTE', 'BUENO', 'REGULAR', 'MALO', 'CRITICO', 'RECUPERACION', 'OBSERVACION'
];
const animalsBySalud = computed(() => {
  const counts: Record<string, number> = {};
  for (const estado of estadosSalud) counts[estado] = 0;
  for (const a of animals.value) {
    if (!a.estado_salud) continue;
    const estado = String(a.estado_salud).trim().toUpperCase();
    if (counts[estado] !== undefined) counts[estado]++;
  }
  return counts;
});
const animalsBySaludData = computed<ChartData<'pie'>>(() => ({
  labels: estadosSalud,
  datasets: [{
    label: 'Cantidad',
    data: estadosSalud.map(e => animalsBySalud.value[e]),
    backgroundColor: [
      '#22c55e', // EXCELENTE (verde)
      '#a3e635', // BUENO (lime)
      '#fde047', // REGULAR (amarillo)
      '#fb923c', // MALO (naranja)
      '#ef4444', // CRITICO (rojo)
      '#38bdf8', // RECUPERACION (celeste)
      '#a3a3a3', // OBSERVACION (gris)
    ],
  }]
}));
</script>