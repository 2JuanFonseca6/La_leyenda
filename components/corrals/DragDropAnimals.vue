<template>
  <div class="flex gap-8 p-6">
    <!-- Columna Izquierda: Animales -->
    <div class="w-1/3">
      <h2 class="text-xl font-bold mb-4">Animales Disponibles</h2>
      <div 
        class="drop-zone min-h-[300px] p-4 rounded-lg border-2 border-dashed border-gray-300"
        :class="{ 'drag-over': isDragOverUnassigned }"
        @dragover.prevent="handleUnassignedDragOver"
        @dragleave="handleDragLeave"
        @drop="onDrop($event, null)"
      >
        <div
          v-for="animal in unassignedAnimals"
          :key="animal.id"
          class="drag-el hover:bg-gray-50 mb-2"
          draggable="true"
          @dragstart="startDrag($event, animal)"
        >
          🐄 {{ animal.title }}
        </div>
        <div v-if="unassignedAnimals.length === 0" class="text-gray-500 text-center py-8">
          <div class="text-4xl mb-2">📦</div>
          <div>Arrastra animales aquí para desasignarlos</div>
        </div>
      </div>
    </div>

    <!-- Columna Derecha: Tabla de Corrales -->
    <div class="w-2/3">
      <h2 class="text-xl font-bold mb-4">Corrales</h2>
      
      <!-- Tabla personalizada con expandibles -->
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 w-12"></th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre del Corral</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Animales</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-for="corral in corrals" :key="corral.id">
              <!-- Fila principal del corral -->
              <tr 
                class="hover:bg-[var(--color-custom-100)] cursor-pointer transition-colors"
                :class="{ 'bg-[var(--color-custom-400)] text-[var(--color-custom-50)] dark:bg-[var(--color-custom-200)] dark:text-[var(--color-custom-500)]': expanded[corral.id] }"
                @click="toggleExpand(corral.id)"
              >
                <td class="px-4 py-3">
                  <UButton
                    :icon="expanded[corral.id] ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                    variant="ghost"
                    size="sm"
                    square
                    :class="expanded[corral.id] ? 'text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)]' : 'text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)]'"
                    
                  />
                </td>
                <td class="px-4 py-3 font-medium">{{ corral.name }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span :class="expanded[corral.id] ? 'text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)]' : 'text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)]'">
                      {{ getAnimalsInCorral(corral.id).length }} animal{{ getAnimalsInCorral(corral.id).length !== 1 ? 'es' : '' }}
                    </span>
                    <span 
                      v-if="getAnimalsInCorral(corral.id).length > 0"
                      class="text-xs bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] px-2 py-1 rounded-full text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)]"
                    >
                      {{ getAnimalsInCorral(corral.id).length }}
                    </span>
                  </div>
                </td>
              </tr>
              
              <!-- Fila expandible con drop zone -->
              <tr v-if="expanded[corral.id]" class="bg-gray-25">
                <td colspan="3" class="px-0 py-0">
                  <div class="px-6 py-4 bg-gray-25 border-t border-gray-100">
                    <div
                      class="drop-zone p-6 border-2 border-dashed border-gray-300 rounded-lg min-h-[120px] bg-white transition-all duration-200"
                      :class="{ 
                        'drag-over border-green-400 bg-green-50 shadow-inner': isDragOver === corral.id,
                        'border-blue-300 bg-blue-50': getAnimalsInCorral(corral.id).length > 0 && isDragOver !== corral.id
                      }"
                      @dragover.prevent="() => handleCorralDragOver(corral.id)"
                      @dragleave="handleDragLeave"
                      @drop="onDrop($event, corral.id)"
                    >
                      <!-- Animales en el corral -->
                      <div v-if="getAnimalsInCorral(corral.id).length > 0" class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-3">Animales en {{ corral.name }}:</h4>
                        <div class="flex flex-wrap gap-2">
                          <div
                            v-for="animal in getAnimalsInCorral(corral.id)"
                            :key="animal.id"
                            class="drag-el bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] border border-blue-200 hover:border-blue-400 hover:shadow-md"
                            draggable="true"
                            @dragstart="startDrag($event, animal)"
                          >
                            🐄 {{ animal.title }}
                          </div>
                        </div>
                      </div>
                      
                      <!-- Mensaje cuando está vacío -->
                      <div v-if="getAnimalsInCorral(corral.id).length === 0" class="text-center py-8">
                        <div class="text-4xl mb-3">🏠</div>
                        <div class="text-gray-500">
                          <div class="font-medium mb-1">{{ corral.name }} está vacío</div>
                          <div class="text-sm">Arrastra animales aquí para asignarlos</div>
                        </div>
                      </div>
                      
                      <!-- Indicador visual durante drag -->
                      <div 
                        v-if="isDragOver === corral.id" 
                        class="absolute inset-0 flex items-center justify-center bg-green-100 opacity-90 rounded-lg pointer-events-none"
                      >
                        <div class="text-green-700 font-medium">
                          ⬇️ Suelta aquí para asignar al {{ corral.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UButton } from '#components'
import { ref, computed } from 'vue'

type Animal = {
  id: number
  title: string
  corralId: number | null
}

type Corral = {
  id: number
  name: string
}

const animals = ref<Animal[]>([
  { id: 1, title: 'Vaca Holstein', corralId: null },
  { id: 2, title: 'Caballo Árabe', corralId: null },
  { id: 3, title: 'Cerdo Yorkshire', corralId: null },
  { id: 4, title: 'Oveja Merino', corralId: null },
  { id: 5, title: 'Toro Angus', corralId: null },
  { id: 6, title: 'Cabra Nubia', corralId: null },
])

const corrals = ref<Corral[]>([
  { id: 1, name: 'Corral A' },
  { id: 2, name: 'Corral B' },
  { id: 3, name: 'Corral C' },
])

const unassignedAnimals = computed(() => 
  animals.value.filter(animal => animal.corralId === null)
)

const getAnimalsInCorral = (corralId: number) => 
  animals.value.filter(animal => animal.corralId === corralId)

// Estado de expansión de corrales
const expanded = ref<Record<number, boolean>>({})

// Estado de drag and drop
const isDragOver = ref<number | null>(null)
const isDragOverUnassigned = ref(false)

// Funciones de drag and drop
const startDrag = (event: DragEvent, animal: Animal) => {
  if (!event.dataTransfer) return
  
  event.dataTransfer.setData('animalId', animal.id.toString())
  event.dataTransfer.effectAllowed = 'move'
  
  // Si el animal está en un corral, mantenerlo expandido durante el drag
  if (animal.corralId !== null) {
    expanded.value[animal.corralId] = true
  }
}

const handleUnassignedDragOver = () => {
  isDragOverUnassigned.value = true
}

const handleCorralDragOver = (corralId: number) => {
  isDragOver.value = corralId
  // Auto-expandir el corral cuando se arrastra sobre él
  if (!expanded.value[corralId]) {
    expanded.value[corralId] = true
  }
}

const handleDragLeave = (event: DragEvent) => {
  // Verificar si realmente salimos del elemento
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = null
    isDragOverUnassigned.value = false
  }
}

const onDrop = (event: DragEvent, corralId: number | null) => {
  event.preventDefault()
  
  // Limpiar estados de drag
  isDragOver.value = null
  isDragOverUnassigned.value = false
  
  const animalId = event.dataTransfer?.getData('animalId')
  if (!animalId) return

  const animal = animals.value.find(a => a.id === Number(animalId))
  if (animal) {
    const previousCorralId = animal.corralId
    animal.corralId = corralId
    
    // Feedback en consola
    if (corralId === null) {
      console.log(`${animal.title} fue desasignado del corral`)
    } else {
      const corral = corrals.value.find(c => c.id === corralId)
      console.log(`${animal.title} fue asignado al ${corral?.name}`)
    }
  }
}

// Función para alternar expansión manual
const toggleExpand = (corralId: number) => {
  expanded.value[corralId] = !expanded.value[corralId]
}
</script>

<style scoped>
.drag-el {
  padding: 8px 12px;
  margin: 2px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s ease;
  display: inline-block;
  user-select: none;
  position: relative;
}

.drag-el:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.drag-el:active {
  cursor: grabbing;
  transform: translateY(0);
}

.drop-zone {
  transition: all 0.3s ease;
  position: relative;
}

.drag-over {
  border-color: #4ade80 !important;
  background-color: #f0fdf4 !important;
  box-shadow: inset 0 0 0 2px #4ade80;
}

/* Estilos para la tabla */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background-color: #f9fafb;
  font-weight: 500;
}

/* tr:hover td {
  background-color: #f9fafb;
} */

/* Colores de fondo para expansión */
.bg-gray-25 {
  background-color: #fcfcfd;
}

/* Animación suave para elementos drag */
.drag-el {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>