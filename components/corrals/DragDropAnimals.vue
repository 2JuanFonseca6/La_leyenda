<!-- components/corrals/DragDropAnimals.vue -->
<template>
  <div class="flex gap-8 p-6">
    <!-- Columna Izquierda: Componente de Tabla de Animales -->
    <div class="w-2/3 flex flex-col">
      <AnimalDrag :assigned-animals="assignedAnimalIds" @animal-drag-start="handleAnimalDragStart"
        @unassign-animal="handleUnassignAnimal" />
    </div>

    <!-- Columna Derecha: Tabla de Corrales -->
    <div class="w-1/3">
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
              <tr class="hover:bg-[var(--color-custom-100)] cursor-pointer transition-colors"
                :class="{ 'bg-[var(--color-custom-400)] text-[var(--color-custom-50)] dark:bg-[var(--color-custom-200)] dark:text-[var(--color-custom-500)]': expanded[corral.id] }"
                @click="toggleExpand(corral.id)">
                <td class="px-4 py-3">
                  <UButton :icon="expanded[corral.id] ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                    variant="ghost" size="sm" square
                    :class="expanded[corral.id] ? 'text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)]' : 'text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)]'" />
                </td>
                <td class="px-4 py-3 font-medium">{{ corral.name }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span
                      :class="expanded[corral.id] ? 'text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)]' : 'text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)]'">
                      {{ getAnimalsInCorral(corral.id).length }} animal{{ getAnimalsInCorral(corral.id).length !== 1 ?
                      'es' : '' }}
                    </span>
                    <span v-if="getAnimalsInCorral(corral.id).length > 0"
                      class="text-xs bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] px-2 py-1 rounded-full text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)]">
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
                        'border-blue-300 bg-blue-50': getAnimalsInCorral(corral.id).length > 0 && isDragOver !== corral.id,
                        'border-red-400 bg-red-50': isDragOver === corral.id && isAnimalAlreadyAssigned(currentDraggedAnimal)
                      }" @dragover.prevent="() => handleCorralDragOver(corral.id)" @dragleave="handleDragLeave"
                      @drop="onDrop($event, corral.id)">
                      <!-- Animales en el corral con scroll -->
                      <div v-if="getAnimalsInCorral(corral.id).length > 0" class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-3">Animales en {{ corral.name }}:</h4>
                        <div class="animals-container max-h-48 overflow-y-auto pr-2">
                          <div class="flex flex-wrap gap-2">
                            <div v-for="animal in getAnimalsInCorral(corral.id)" :key="animal.id_animal"
                              class="drag-el bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] border border-blue-200 hover:border-blue-400 hover:shadow-md group relative"
                              draggable="true" @dragstart="startDrag($event, animal)">
                              <span>🐄 {{ animal.id_animal }} - {{ animal.raza }} - {{ animal.tipo_animal }}</span>
                              <!-- Botón de eliminar -->
                              <button @click.stop="removeAnimalFromCorral(animal.id_animal)"
                                class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                                title="Remover del corral">
                                ✕
                              </button>
                            </div>
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

                      <!-- Indicador visual durante drag - éxito -->
                      <div v-if="isDragOver === corral.id && !isAnimalAlreadyAssigned(currentDraggedAnimal)"
                        class="absolute inset-0 flex items-center justify-center bg-green-100 opacity-90 rounded-lg pointer-events-none">
                        <div class="text-green-700 font-medium">
                          ⬇️ Suelta aquí para asignar al {{ corral.name }}
                        </div>
                      </div>

                      <!-- Indicador visual durante drag - error -->
                      <div v-if="isDragOver === corral.id && isAnimalAlreadyAssigned(currentDraggedAnimal)"
                        class="absolute inset-0 flex items-center justify-center bg-red-100 opacity-90 rounded-lg pointer-events-none">
                        <div class="text-red-700 font-medium text-center">
                          ❌ Este animal ya está asignado a otro corral<br>
                          <span class="text-sm">Remuévelo primero para reasignarlo</span>
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
import AnimalDrag from './AnimalDrag.vue'

// Tipos actualizados para usar los datos reales de la API
type Animal = {
  id_animal: string
  raza: string
  peso_actual: number
  tipo_animal: string
  estado_salud: string
  fecha_nacimiento?: string
  venta?: boolean
  historialSalud?: any[]
  corralId: number | null
}

type Corral = {
  id: number
  name: string
}

// Estado para almacenar animales asignados a corrales
const animals = ref<Animal[]>([])

const corrals = ref<Corral[]>([
  { id: 1, name: 'Corral A' },
  { id: 2, name: 'Corral B' },
  { id: 3, name: 'Corral C' },
])

// Computed para obtener IDs de animales asignados
const assignedAnimalIds = computed(() =>
  animals.value
    .filter(animal => animal.corralId !== null)
    .map(animal => animal.id_animal)
)

const getAnimalsInCorral = (corralId: number) =>
  animals.value.filter(animal => animal.corralId === corralId)

// Estado de expansión de corrales
const expanded = ref<Record<number, boolean>>({})

// Estado de drag and drop
const isDragOver = ref<number | null>(null)
const currentDraggedAnimal = ref<Animal | null>(null)

// Función para verificar si un animal ya está asignado
const isAnimalAlreadyAssigned = (animal: Animal | null) => {
  if (!animal) return false
  return animal.corralId !== null
}

// Funciones de drag and drop
const startDrag = (event: DragEvent, animal: Animal) => {
  if (!event.dataTransfer) return

  event.dataTransfer.setData('animalId', animal.id_animal)
  event.dataTransfer.setData('animalData', JSON.stringify(animal))
  event.dataTransfer.effectAllowed = 'move'

  currentDraggedAnimal.value = animal

  // Si el animal está en un corral, mantenerlo expandido durante el drag
  if (animal.corralId !== null) {
    expanded.value[animal.corralId] = true
  }
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
  }
}

const onDrop = (event: DragEvent, corralId: number | null) => {
  event.preventDefault()

  // Limpiar estados de drag
  isDragOver.value = null

  const animalId = event.dataTransfer?.getData('animalId')
  const animalDataStr = event.dataTransfer?.getData('animalData')

  if (!animalId || !animalDataStr) return

  try {
    const animalData = JSON.parse(animalDataStr)

    // Buscar si el animal ya existe en nuestro estado local
    let animal = animals.value.find(a => a.id_animal === animalId)

    // Si no existe, crearlo a partir de los datos recibidos
    if (!animal) {
      animal = {
        ...animalData,
        corralId: null
      }
      if (animal) {
        animals.value.push(animal)
      }
    }

    if (!animal) return;

    // Verificar si el animal ya está asignado a otro corral
    if (animal.corralId !== null && animal.corralId !== corralId) {
      console.warn(`El animal ${animal.id_animal} ya está asignado al corral ${animal.corralId}. No se puede asignar a múltiples corrales.`)
      return;
    }

    // Actualizar la asignación del corral solo si no está ya asignado
    const previousCorralId = animal.corralId
    animal.corralId = corralId

    // Feedback en consola
    if (corralId === null) {
      console.log(`${animal.id_animal} - ${animal.raza} fue desasignado del corral`)
    } else {
      const corral = corrals.value.find(c => c.id === corralId)
      console.log(`${animal.id_animal} - ${animal.raza} fue asignado al ${corral?.name}`)
    }
  } catch (error) {
    console.error('Error al procesar el drop:', error)
  }

  currentDraggedAnimal.value = null
}

// Función para alternar expansión manual
const toggleExpand = (corralId: number) => {
  expanded.value[corralId] = !expanded.value[corralId]
}

// Función para remover animal del corral
const removeAnimalFromCorral = (animalId: string) => {
  const animal = animals.value.find(a => a.id_animal === animalId)
  if (animal) {
    const previousCorral = corrals.value.find(c => c.id === animal.corralId)
    animal.corralId = null
    console.log(`${animal.id_animal} - ${animal.raza} fue removido del ${previousCorral?.name}`)
  }
}

// Manejadores de eventos del componente AnimalDrag
const handleAnimalDragStart = (animal: any) => {
  currentDraggedAnimal.value = animal
  console.log('Iniciando drag del animal:', animal.id_animal)
}

const handleUnassignAnimal = (animalId: string) => {
  const animal = animals.value.find(a => a.id_animal === animalId)
  if (animal) {
    animal.corralId = null
    console.log(`${animal.id_animal} - ${animal.raza} fue desasignado`)
  }
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

/* Estilos para el scrollbar personalizado */
.animals-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.animals-container::-webkit-scrollbar {
  width: 6px;
}

.animals-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.animals-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.animals-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
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

/* Estilos para el botón de eliminar */
.drag-el .group:hover button {
  opacity: 1;
}
</style>