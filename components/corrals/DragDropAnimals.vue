<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 relative">
    <!-- Badge de rol de usuario -->
    <div class="absolute right-4 top-2 z-10">
      <span class="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
        Rol: {{ userRole }}
      </span>
    </div>
    <div class="p-4">
      <AnimalDrag ref="animalDragRef" :assignedAnimals="assignedAnimalIds" @animalDragStart="handleDragStart"
        @unassignAnimal="handleUnassignAnimal" />
    </div>

    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold mb-4">Lotes</h2>
        <div class="flex items-center gap-2" v-if="userRole === 'admin'">
          <DeleteCorralModal ref="deleteCorralModalRef" @corral-deleted="refreshCorrales"/>
          <CorralFormModal v-model="showCorralFormModal" @success="handleCorralSuccess" />
        </div>
      </div>
      <AnimalDrop ref="animalDropRef" @animalAssigned="handleAnimalAssigned" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useUserRole } from '~/composables/arestricted'

const { userRole } = useUserRole()

const animalDragRef = ref()
const animalDropRef = ref()
const assignedAnimalIds = ref<string[]>([])
const showCorralFormModal = ref(false)
const deleteCorralModalRef = ref()

async function loadAssignedAnimals() {
  try {
    assignedAnimalIds.value = await $fetch<string[]>('/api/corrales/assign/assigned')
  } catch (error) {
    console.error('Error cargando animales asignados:', error)
  }
}

const handleCorralSuccess = (corral: any) => {
  console.log('Corral creado/actualizado:', corral)
  // refreshCorrales()
  animalDropRef.value?.refresh?.()
  deleteCorralModalRef.value?.refresh?.()
}

const handleDragStart = (animal: any) => { }

const handleAnimalAssigned = (animalId: string) => {
  // Siempre refrescar ambas vistas para reflejar el cambio
  animalDragRef.value?.fetchAnimals?.()
  refreshCorrales()
}

const handleUnassignAnimal = async (animalId: string) => {
  try {
    await $fetch('/api/corrales/unassign/unassign', {
      method: 'PUT',
      body: { animalId }
    });

    assignedAnimalIds.value = assignedAnimalIds.value.filter(id => id !== animalId)

    animalDragRef.value?.fetchAnimals?.()
    refreshCorrales()
  } catch (error) {
    console.error('Error desasignando animal:', error)
  }
}

function refreshCorrales() {
  animalDropRef.value?.refresh?.()
}

onMounted(() => {
  loadAssignedAnimals()
})
</script>
