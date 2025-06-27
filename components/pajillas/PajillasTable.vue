<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import type { Table } from '@tanstack/table-core'
import { useUserRole } from '~/composables/arestricted'

const props = defineProps<{ search?: string }>()

const { canCreate } = useUserRole()

type Pajilla = {
  id: number
  pajilla: string
  stock: number
  animal_id: string | null
  fecha_uso: string | null
  descripcion: string | null
  created_at: string
  updated_at: string
}

interface TableComponent {
  tableApi: Table<Pajilla>
}

const table = ref<TableComponent | null>(null)
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')

const data = ref<Pajilla[]>([])
const total = ref(0)
const isPending = ref(false)

// Estadísticas generales del servidor
const serverStats = ref({
  totalStock: 0,
  availableStock: 0,
  usedStock: 0,
  withAnimal: 0,
  totalItems: 0
})

const pagination = ref({
  pageIndex: 1,
  pageSize: 10
})

const fetchPajillas = async () => {
  isPending.value = true
  try {
    const params = {
      page: pagination.value.pageIndex,
      pageSize: pagination.value.pageSize
    }
    const response = await $fetch<{ pajillas: Pajilla[]; total: number; stats: any }>(
      '/api/pajillas',
      { params }
    )
    if ('pajillas' in response && 'total' in response) {
      data.value = response.pajillas
      total.value = response.total
      if (response.stats) {
        serverStats.value = response.stats
      }
    } else if (Array.isArray(response)) {
      data.value = response as Pajilla[]
      total.value = (response as Pajilla[]).length
    } else {
      data.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('Error fetching pajillas:', error)
  } finally {
    isPending.value = false
  }
}

watch([() => pagination.value.pageIndex, () => pagination.value.pageSize], fetchPajillas)
fetchPajillas()

const columns: TableColumn<Pajilla>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : '',
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'ID',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    cell: ({ row }) => h('span', { class: 'font-mono text-sm text-muted' }, `#${row.original.id}`)
  },
  {
    accessorKey: 'pajilla',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Código',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    cell: ({ row }) => h('span', { class: 'font-medium text-primary font-mono' }, row.original.pajilla)
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Stock',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    cell: ({ row }) =>
      h(resolveComponent('UBadge'), {
        color: row.original.stock > 0 ? 'success' : 'error',
        variant: row.original.stock > 0 ? 'subtle' : 'solid',
        size: 'sm'
      }, () => row.original.stock.toLocaleString())
  },
  {
    accessorKey: 'animal_id',
    header: 'Animal ID',
    cell: ({ row }) =>
      row.original.animal_id
        ? h('span', { class: 'font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded' }, row.original.animal_id)
        : h('span', { class: 'text-muted italic text-sm' }, '—')
  },
  {
    accessorKey: 'fecha_uso',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Fecha Uso',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    cell: ({ row }) => {
      if (!row.original.fecha_uso) {
        return h('span', { class: 'text-muted italic text-sm' }, '—')
      }
      const date = new Date(row.original.fecha_uso)
      const today = new Date()
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      
      return h('div', { class: 'flex flex-col' }, [
        h('span', { 
          class: `text-sm ${isPast ? 'text-red-600 dark:text-red-400' : isToday ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}` 
        }, date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })),
        h('span', { class: 'text-xs text-muted' }, date.toLocaleDateString('es-ES', { 
          weekday: 'short' 
        }))
      ])
    }
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
    cell: ({ row }) => {
      if (!row.original.descripcion) {
        return h('span', { class: 'text-muted italic text-sm' }, '—')
      }
      const desc = row.original.descripcion
      const truncated = desc.length > 30 ? desc.substring(0, 30) + '...' : desc
      return h('span', { 
        class: 'text-sm',
        title: desc.length > 30 ? desc : undefined
      }, truncated)
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Creado',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    cell: ({ row }) => {
      const date = new Date(row.original.created_at)
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'text-sm' }, date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })),
        h('span', { class: 'text-xs text-muted' }, date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }))
      ])
    }
  }
]

const selectedIds = ref<number[]>([])
const expanded = ref({})

// Configuración de ordenamiento por defecto
const sorting = ref([
  { id: 'created_at', desc: true } // Más recientes primero
])

watch(
  () => table.value?.tableApi?.getSelectedRowModel().rows,
  (rows) => {
    selectedIds.value = rows?.map((row) => row.original.id) || []
  }
)

const handleDelete = async (id: number) => {
  try {
    await $fetch(`/api/pajillas/${id}`, { method: 'DELETE' })
    fetchPajillas()
  } catch (error) {
    console.error('Error deleting pajilla:', error)
  }
}

const emit = defineEmits(['edit', 'add'])

const refresh = () => {
  fetchPajillas()
}

const filteredRowsCount = computed(() => {
  const rows = table.value?.tableApi?.getFilteredRowModel().rows
  return Array.isArray(rows) ? rows.length : 0
})

// Función para refrescar la tabla
const refreshTable = () => {
  table.value?.tableApi?.resetRowSelection()
  fetchPajillas()
}

const filteredData = computed(() => {
  const term = props.search?.toLowerCase() || ''
  if (!term) return data.value
  return data.value.filter(pajilla =>
    pajilla.pajilla.toLowerCase().includes(term) ||
    (pajilla.animal_id ?? '').toLowerCase().includes(term) ||
    (pajilla.descripcion ?? '').toLowerCase().includes(term)
  )
})

defineExpose({
  fetchPajillas,
  refresh,
  refreshTable,
  tableApi: computed(() => table.value?.tableApi)
})
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <!-- Estadísticas -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="text-center">
        <div class="text-2xl font-bold text-primary">{{ serverStats.totalItems }}</div>
        <div class="text-sm text-muted">Total Pajillas</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600">{{ serverStats.totalStock.toLocaleString() }}</div>
        <div class="text-sm text-muted">Stock Total</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600">{{ serverStats.availableStock }}</div>
        <div class="text-sm text-muted">Disponibles</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-red-600">{{ serverStats.usedStock }}</div>
        <div class="text-sm text-muted">Usadas</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-purple-600">{{ serverStats.withAnimal }}</div>
        <div class="text-sm text-muted">Con Animal</div>
      </div>
    </div>

    <!-- Botón de agregar -->
    <div class="flex justify-between items-center px-4 py-3.5 border-b border-accented">
      <div>
        <h3 class="text-lg font-semibold">Lista de Pajillas</h3>
        <p class="text-sm text-muted">Gestiona el inventario de pajillas disponibles</p>
      </div>
      <UButton
        v-if="canCreate"
        icon="i-heroicons-plus-20-solid"
        @click="() => emit('add')"
        title="Agregar nueva pajilla"
      />
    </div>

    <!-- Tabla -->
    <UTable
      v-model:expanded="expanded"
      v-model:sorting="sorting"
      ref="table"
      :data="filteredData"
      :columns="columns"
      :loading="isPending"
      class="flex-1"
    >
      <template #expanded="{ row }">
        <PajillaExpandedCard :pajilla="row.original" @updated="refreshTable" />
      </template>
    </UTable>

    <!-- Información de paginación -->
    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      {{ filteredRowsCount }} de {{ total }} pajillas
    </div>

    <!-- Paginación -->
    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        v-model:page="pagination.pageIndex"
        :items-per-page="pagination.pageSize"
        :total="total"
        @update:page="(newPage: number) => (pagination.pageIndex = newPage)"
      />
    </div>
  </div>
</template> 