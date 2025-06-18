<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 class="text-xl font-bold mb-4">Animales Disponibles</h2>
      <AnimalDrag 
        ref="animalDragRef" 
        :assignedAnimals="assignedAnimalIds" 
        @animalDragStart="handleDragStart"
        @unassignAnimal="handleUnassignAnimal" 
      />
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 class="text-xl font-bold mb-4">Corrales</h2>
      <AnimalDrop 
        ref="animalDropRef" 
        @animalAssigned="handleAnimalAssigned" 
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const animalDragRef = ref()
const animalDropRef = ref()
const assignedAnimalIds = ref<string[]>([])

// Cargar animales asignados al iniciar
async function loadAssignedAnimals() {
  try {
    assignedAnimalIds.value = await $fetch<string[]>('/api/corrales/assign/assigned')
  } catch (error) {
    console.error('Error cargando animales asignados:', error)
  }
}

// Manejar inicio de arrastre
const handleDragStart = (animal: any) => {
  // No es necesario hacer nada especial aquí
}

// Manejar animal asignado
const handleAnimalAssigned = (animalId: string) => {
  if (!assignedAnimalIds.value.includes(animalId)) {
    assignedAnimalIds.value.push(animalId)
  }
  animalDragRef.value?.fetchAnimals?.()
}

// Manejar desasignación
const handleUnassignAnimal = async (animalId: string) => {
  try {
    // Desasignar en la base de datos
    await $fetch('/api/corrales/unassign/unassign', {
      method: 'PUT',
      body: { animalId }
    });
    
    // Actualizar estado local
    assignedAnimalIds.value = assignedAnimalIds.value.filter(id => id !== animalId)
    
    // Refrescar componentes
    animalDragRef.value?.fetchAnimals?.()
    animalDropRef.value?.refresh?.()
    
  } catch (error) {
    console.error('Error desasignando animal:', error)
  }
}

const handleCorralDragStart = (animalId: string) => {
  // Activar visualización en zona de desasignación
  animalDragRef.value?.activateUnassignZone?.(true);
}

// Cargar animales asignados al montar el componente
onMounted(() => {
  loadAssignedAnimals()
})
</script>