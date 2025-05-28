<template>
  <div class="container">
    <!-- Columna Izquierda: Animales -->
    <div
      class="column animals"
      @drop="onDrop($event, null)"
      @dragover.prevent
      @dragenter.prevent
    >
      <h2>Animales</h2>
      <div
        v-for="animal in unassignedAnimals"
        :key="animal.id"
        class="drag-el"
        draggable="true"
        @dragstart="startDrag($event, animal)"
      >
        {{ animal.title }}
      </div>
    </div>

    <!-- Columna Derecha: Corrales -->
    <div class="column corrals">
      <div
        v-for="corral in corrals"
        :key="corral.id"
        class="drop-zone"
        @drop="onDrop($event, corral.id)"
        @dragover.prevent
        @dragenter.prevent
      >
        <h2>{{ corral.name }}</h2>
        <div
          v-for="animal in getCorralAnimals(corral.id)"
          :key="animal.id"
          class="drag-el"
          draggable="true"
          @dragstart="startDrag($event, animal)"
        >
          {{ animal.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

// Lista de animales
interface Animal {
  id: number
  title: string
  corral: number | null
}

const animals = ref<Animal[]>([
  { id: 1, title: 'Animal 1', corral: null },
  { id: 2, title: 'Animal 2', corral: null },
  { id: 3, title: 'Animal 3', corral: null },
  { id: 4, title: 'Animal 4', corral: null },
])

// Lista de corrales
const corrals = ref([
  { id: 1, name: 'Corral A' },
  { id: 2, name: 'Corral B' },
  { id: 3, name: 'Corral C' },
])

// Animales sin asignar a ningún corral
const unassignedAnimals = computed(() =>
  animals.value.filter(animal => animal.corral === null)
)

// Obtener animales asignados a un corral específico
const getCorralAnimals = (corralId: number) =>
  animals.value.filter(animal => animal.corral === corralId)

// Iniciar el arrastre de un animal
const startDrag = (event: DragEvent, animal: any) => {
  event.dataTransfer?.setData('animalId', animal.id.toString())
  event.dataTransfer!.effectAllowed = 'move'
}

// Manejar el evento de soltar un animal en un corral o en la columna de animales
const onDrop = (event: DragEvent, corralId: number | null) => {
  const animalId = event.dataTransfer?.getData('animalId')
  const animal = animals.value.find(a => a.id === Number(animalId))
  if (animal) {
    animal.corral = corralId
  }
}
</script>

<style scoped>
.container {
  display: flex;
  gap: 2rem;
  padding: 1rem;
}

.column {
  flex: 1;
}

.animals {
  padding: 1rem;
  border: 1px solid #ccc;
  min-height: 200px;
}

.corrals {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.drop-zone {
  min-height: 150px;
  border: 2px dashed #aaa;
  padding: 1rem;
}

.drag-el {
  border: 1px solid #ccc;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: grab;
}
</style>
