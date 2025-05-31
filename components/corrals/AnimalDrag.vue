<!-- components/corrals/AnimalDrag.vue -->
<script setup lang="ts">
import { h, resolveComponent, ref, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { UButton } from '#components'

const UBadge = resolveComponent('UBadge')

type EstadoSalud =
  | 'EXCELENTE'
  | 'BUENO'
  | 'REGULAR'
  | 'MALO'
  | 'CRITICO'
  | 'RECUPERACION'
  | 'OBSERVACION'

type Animal = {
  id_animal: string
  raza: string
  peso_actual: number
  tipo_animal: string
  estado_salud: EstadoSalud
  fecha_nacimiento?: string
  venta?: boolean
  historialSalud?: any[]
  corralId?: number | null // Agregamos esta propiedad para el drag and drop
}

// Props para recibir animales asignados desde el componente padre
const props = defineProps<{
  assignedAnimals?: string[] // IDs de animales que ya están asignados a corrales
}>()

// Emits para comunicar cambios al componente padre
const emit = defineEmits<{
  animalDragStart: [animal: Animal]
  unassignAnimal: [animalId: string]
}>()

const data = ref<Animal[]>([])
const total = ref(0)
const isPending = ref(false)
const globalFilter = ref('')
const pagination = ref({
  page: 1,
  pageSize: 5
})

const estadoSaludColorMap: Record<EstadoSalud, string> = {
  EXCELENTE: 'success',
  BUENO: 'info',
  REGULAR: 'warning',
  MALO: 'error',
  CRITICO: 'error',
  RECUPERACION: 'primary',
  OBSERVACION: 'neutral'
}

const columns: TableColumn<Animal>[] = [
  {
    accessorKey: 'id_animal',
    header: 'ID Animal',
    cell: ({ row }) => {
      const animal = row.original
      return h('div', {
        class: 'drag-handle cursor-grab hover:cursor-grabbing flex items-center gap-2',
        draggable: true,
        onDragstart: (event: DragEvent) => handleDragStart(event, animal),
      }, [
        h('span', { class: 'text-lg' }, '🐄'),
        h('span', {}, animal.id_animal)
      ])
    }
  },
  {
    accessorKey: 'raza',
    header: 'Raza'
  },
  {
    accessorKey: 'peso_actual',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Peso Actual',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => `${row.getValue('peso_actual')} kg`
  },
  {
    accessorKey: 'tipo_animal',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Tipo de Animal',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
  },
  {
    accessorKey: 'estado_salud',
    header: 'Estado de Salud',
    cell: ({ row }) => {
      const estado = row.getValue('estado_salud') as EstadoSalud
      const color = estadoSaludColorMap[estado]

      return h(
        UBadge,
        {
          class: 'capitalize',
          variant: 'subtle',
          color,
          title: estado
        },
        () => estado
      )
    }
  }
]

// Función para manejar el inicio del drag
const handleDragStart = (event: DragEvent, animal: Animal) => {
  if (!event.dataTransfer) return
  
  // Almacenar el ID del animal en el dataTransfer
  event.dataTransfer.setData('animalId', animal.id_animal)
  event.dataTransfer.setData('animalData', JSON.stringify(animal))
  event.dataTransfer.effectAllowed = 'move'
  
  // Emitir evento al componente padre
  emit('animalDragStart', animal)
}

// Función para obtener animales desde la API
const fetchAnimals = async () => {
  isPending.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      search: globalFilter.value
    }
    
    // Si la búsqueda es un ID específico, usamos el endpoint específico
    if (globalFilter.value && /^[A-Za-z0-9]+$/.test(globalFilter.value)) {
      try {
        const response = await $fetch(`/api/animal/specific/${globalFilter.value}`)
        if (response.animal) {
          // Ensure tipo_animal and estado_salud are strings, not null
          const safeAnimal: Animal = {
            ...response.animal,
            tipo_animal: response.animal.tipo_animal ?? '',
            estado_salud: response.animal.estado_salud ?? 'OBSERVACION'
          }
          data.value = [safeAnimal]
          total.value = 1
        } else {
          data.value = []
          total.value = 0
        }
      } catch (specificError) {
        // Si falla la búsqueda específica, intentamos con la general
        await fetchGeneralAnimals(params)
      }
    } else {
      // Búsqueda general
      await fetchGeneralAnimals(params)
    }
  } catch (error) {
    console.error('Error fetching animals:', error)
    data.value = []
    total.value = 0
  } finally {
    isPending.value = false
  }
}

// Función para obtener animales mediante el endpoint general
const fetchGeneralAnimals = async (params: any) => {
  const response = await $fetch<{ animals: Animal[]; total: number }>(
    '/api/animal/animals',
    { params }
  )
  
  data.value = response.animals
  total.value = response.total
}

// Función para activar la búsqueda
const triggerSearch = () => {
  pagination.value.page = 1
  fetchAnimals()
}

// Watcher para cambios en la paginación
watch([() => pagination.value.page, () => pagination.value.pageSize], fetchAnimals)

// Carga inicial
fetchAnimals()

// Función para obtener las clases CSS de una fila según si está asignada
const getRowClasses = (animal: Animal) => {
  const isAssigned = props.assignedAnimals?.includes(animal.id_animal)
  return isAssigned 
    ? 'opacity-50 bg-gray-100 dark:bg-gray-800' 
    : 'hover:bg-gray-50 dark:hover:bg-gray-900'
}

// Agregar estado para el drop zone de desasignación
const isDragOver = ref(false)

// Función para manejar el drop de desasignación
const handleUnassignDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const animalId = event.dataTransfer?.getData('animalId')
  if (animalId) {
    // Emitir evento para desasignar animal
    emit('unassignAnimal', animalId)
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 w-full h-full">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">Animales Disponibles</h2>
      <div class="flex px-4 py-3.5 border-b border-accented">
        <UInput 
          v-model="globalFilter" 
          class="max-w-sm" 
          placeholder="Buscar por ID o término..." 
          icon="i-heroicons-magnifying-glass"
          :loading="isPending"
          @keyup.enter="triggerSearch" />
        <UButton 
          icon="i-heroicons-magnifying-glass"
          @click="triggerSearch" 
          class="ml-2"
        />
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <UTable
        :data="data"
        :columns="columns"
        :loading="isPending"
        :ui="{
          tbody: 'divide-y divide-gray-200 dark:divide-gray-700',
          tr: 'transition-colors duration-200'
        }"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 text-center">
            <div class="text-4xl mb-2">🔍</div>
            <div class="text-gray-500">No se encontraron animales</div>
          </div>
        </template>
      </UTable>
    </div>
    
    <div class="flex justify-center border-t border-default pt-4 mt-4">
      <UPagination 
        v-model:page="pagination.page" 
        :items-per-page="pagination.pageSize" 
        :total="total" 
      />
    </div>
</div>
</template>

<style scoped>
.drag-handle {
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing !important;
}

/* Estilos para filas de animales asignados */
:deep(.opacity-50 td) {
  color: rgb(156 163 175) !important;
}

/* Efecto visual durante drag */
.drag-handle:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
</style>