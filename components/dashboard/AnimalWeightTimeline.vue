<template>
  <div>
    <h2 class="text-xl font-bold mb-4">Evolución de Peso del Animal</h2>
    <div class="mb-4">
      <UInput v-model="search" placeholder="Buscar animal por ID o nombre..." @input="onSearch" />
      <ul v-if="filteredAnimals.length && search" class="bg-white border rounded shadow mt-2 max-h-40 overflow-y-auto">
        <li v-for="animal in filteredAnimals" :key="animal.id_animal" @click="selectAnimal(animal)" class="p-2 hover:bg-gray-100 cursor-pointer">
          {{ animal.id_animal }} - {{ animal.raza }} ({{ animal.tipo_animal }})
        </li>
      </ul>
    </div>
    <div v-if="selectedAnimal">
      <h3 class="text-lg font-semibold mb-2">{{ selectedAnimal.id_animal }} - {{ selectedAnimal.raza }}</h3>
      <canvas ref="chartRef" height="120"></canvas>
      <div v-if="historialPeso.length === 0" class="text-gray-500 mt-2">No hay registros de peso para este animal.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import type { Animal, HistorialPeso } from '~/types/animal'
import Chart from 'chart.js/auto'

const search = ref('')
const animals = ref<Animal[]>([])
const filteredAnimals = ref<Animal[]>([])
const selectedAnimal = ref<Animal | null>(null)
const historialPeso = ref<HistorialPeso[]>([])
const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const fetchAnimals = async () => {
  const { animals: data } = await $fetch('/api/animal/animals', { params: { page: 1, pageSize: 1000 } })
  animals.value = data
}

const onSearch = () => {
  const term = search.value.trim().toLowerCase()
  if (!term) {
    filteredAnimals.value = []
    return
  }
  filteredAnimals.value = animals.value.filter(a =>
    a.id_animal.toLowerCase().includes(term) ||
    a.raza.toLowerCase().includes(term) ||
    a.tipo_animal.toLowerCase().includes(term)
  )
}

const selectAnimal = async (animal: Animal) => {
  selectedAnimal.value = animal
  search.value = `${animal.id_animal} - ${animal.raza}`
  filteredAnimals.value = []
  await fetchHistorialPeso(animal.id_animal)
  await nextTick()
  renderChart()
}

const fetchHistorialPeso = async (id_animal: string) => {
  const { historial_peso } = await $fetch(`/api/animal/specific/${id_animal}/peso`)
  historialPeso.value = historial_peso || []
}

const renderChart = () => {
  if (!chartRef.value) return
  if (chartInstance) {
    chartInstance.destroy()
  }
  if (!historialPeso.value.length) return
  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: historialPeso.value.map(h => new Date(h.fecha_registro).toLocaleDateString()),
      datasets: [
        {
          label: 'Peso (kg)',
          data: historialPeso.value.map(h => h.peso),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: false }
      },
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { title: { display: true, text: 'Peso (kg)' }, beginAtZero: true }
      }
    }
  })
}

onMounted(fetchAnimals)

watch(historialPeso, () => {
  renderChart()
})
</script>

<style scoped>
ul { list-style: none; margin: 0; padding: 0; }
li { transition: background 0.2s; }
</style> 