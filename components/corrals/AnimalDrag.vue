<!-- components/corrals/AnimalDrag.vue -->
<script setup lang="ts">
import { h, resolveComponent, ref, watch, computed } from 'vue'
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

// Computed para filtrar animales no asignados
const availableAnimals = computed(() => {
  return data.value.filter(animal => !props.assignedAnimals?.includes(animal.id_animal))
})

const columns: TableColumn<Animal>[] = [
  {
    accessorKey: 'id_animal',
    header: 'ID Animal',
    cell: ({ row }) => {
      const animal = row.original
      const isAssigned = props.assignedAnimals?.includes(animal.id_animal)
      const UIcon = resolveComponent('UIcon')

      return h('div', {
        class: `drag-handle flex items-center gap-2 ${isAssigned
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-grab hover:cursor-grabbing'
          }`,
        draggable: !isAssigned,
        onDragstart: !isAssigned ? (event: DragEvent) => handleDragStart(event, animal) : undefined,
        title: isAssigned ? 'Animal ya asignado a un corral' : 'Arrastra para asignar a un corral'
      }, [
        isAssigned
          ? h(UIcon, { name: 'i-heroicons-lock-closed', class: 'size-5 text-lg' })
          : h(UIcon, { name: 'i-healthicons-animal-cow-outline', class: 'size-5 text-lg' }),
        h('span', {}, animal.id_animal),
        isAssigned ? h('span', {
          class: 'text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full ml-2'
        }, 'Asignado') : null
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

  // Verificar si el animal ya está asignado
  if (props.assignedAnimals?.includes(animal.id_animal)) {
    event.preventDefault()
    return
  }

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
    ? 'opacity-50 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
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
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Animales Disponibles</h2>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <span class="text-lg">
              <UIcon name="i-healthicons-animal-cow-outline" class="size-5" />
            </span>
            <span>{{ availableAnimals.length }} disponibles</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-lg">
              <UIcon name="i-heroicons-lock-closed" class="size-5" />
            </span>
            <span>{{ (props.assignedAnimals?.length || 0) }} asignados</span>
          </div>
        </div>
      </div>

      <div class="flex px-4 py-3.5 border-b border-accented">
        <UInput v-model="globalFilter" class="max-w-sm" placeholder="Buscar por ID o término..."
          icon="i-heroicons-magnifying-glass" :loading="isPending" @keyup.enter="triggerSearch" />
        <UButton icon="i-heroicons-magnifying-glass" @click="triggerSearch" class="ml-2" />
      </div>

      <!-- Zona de desasignación -->
      <div v-if="props.assignedAnimals && props.assignedAnimals.length > 0"
        class="mt-4 p-4 border-2 border-dashed border-red-300 rounded-lg text-center transition-all duration-200"
        :class="{ 'border-red-500 bg-red-100': isDragOver }" @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false" @drop="handleUnassignDrop">
        <div class="text-red-600">
          <div class="text-2xl mb-2">🗑️</div>
          <div class="font-medium">Zona de Desasignación</div>
          <div class="text-sm">Arrastra aquí los animales asignados para liberarlos</div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <UTable :data="data" :columns="columns" :loading="isPending" :ui="{
        tbody: 'divide-y divide-gray-200 dark:divide-gray-700',
        tr: 'transition-colors duration-200'
      }">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 text-center">
            <div class="text-4xl mb-2">🔍</div>
            <div class="text-gray-500">No se encontraron animales</div>
          </div>
        </template>

        <!-- Personalizar filas según estado de asignación -->
        <template #row="{ row }">
          <tr :class="getRowClasses(row.original)">
            <td v-for="(cell, index) in row.getVisibleCells()" :key="index" class="px-4 py-3">
              <component :is="cell" />
            </td>
          </tr>
        </template>
      </UTable>
    </div>

    <div class="flex justify-between items-center border-t border-default pt-4 mt-4">
      <div class="text-sm text-gray-600">
        Mostrando {{ data.length }} de {{ total }} animales
      </div>
      <UPagination v-model:page="pagination.page" :items-per-page="pagination.pageSize" :total="total" />
    </div>
  </div>
</template>

<style scoped>
.drag-handle {
  user-select: none;
}

.drag-handle:not(.cursor-not-allowed):active {
  cursor: grabbing !important;
}

/* Estilos para filas de animales asignados */
:deep(.opacity-50 td) {
  color: rgb(156 163 175) !important;
}

/* Efecto visual durante drag */
.drag-handle:not(.cursor-not-allowed):hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Estilos para animales no disponibles */
.cursor-not-allowed {
  pointer-events: none;
}

.cursor-not-allowed:hover {
  transform: none !important;
}

/* Animación para la zona de desasignación */
.border-red-300 {
  transition: all 0.3s ease;
}
</style>