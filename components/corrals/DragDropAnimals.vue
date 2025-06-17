<!-- pages/corrals.vue -->
<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 class="text-xl font-bold mb-4">Animales Disponibles</h2>
      <AnimalDrag ref="animalDragRef" :assignedAnimals="assignedAnimalIds" @animalDragStart="handleDragStart"
        @unassignAnimal="handleUnassignAnimal" />
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 class="text-xl font-bold mb-4">Corrales</h2>
      <AnimalDrop ref="animalDropRef" @animalAssigned="handleAnimalAssigned" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const animalDragRef = ref()
const animalDropRef = ref()
const assignedAnimalIds = ref<string[]>([])
const currentDraggedAnimal = ref<string | null>(null)

// Manejar inicio de arrastre
const handleDragStart = (animal: any) => {
  currentDraggedAnimal.value = animal.id_animal
}

// Manejar animal asignado
const handleAnimalAssigned = (animalId: string) => {
  if (!assignedAnimalIds.value.includes(animalId)) {
    assignedAnimalIds.value.push(animalId)
  }

  // Forzar actualización de ambos componentes
  animalDragRef.value?.fetchAnimals?.()
  animalDropRef.value?.refresh?.()
}

// Manejar desasignación
const handleUnassignAnimal = (animalId: string) => {
  assignedAnimalIds.value = assignedAnimalIds.value.filter(id => id !== animalId)
  animalDropRef.value?.refresh?.()
}
</script>