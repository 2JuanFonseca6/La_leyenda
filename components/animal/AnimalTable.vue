<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import type { Table } from '@tanstack/table-core'
import { useUserRole } from '~/composables/arestricted'

interface TableComponent {
  tableApi: Table<Animal>
}

const { userRole } = useUserRole()
const isAdmin = computed(() => userRole.value === 'admin')
const table = ref<TableComponent | null>(null)

const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')

type Animal = {
  id_animal: string
  fecha_nacimiento: string
  fecha_fallecimiento: string | null
  raza: string
  tipo_animal: 'NOVILLO' | 'TERNERO' | 'TERNERA' | 'VACA' | 'TORO'
  peso_inicial: number
  peso_actual: number
  estado_salud: string
  venta: boolean
  id_reproduccion: string | null
}

const data = ref<Animal[]>([])
const total = ref(0)
const isPending = ref(false)

const pagination = ref({
  pageIndex: 1,
  pageSize: 10
})

const fetchAnimals = async () => {
  isPending.value = true
  try {
    const params = {
      page: pagination.value.pageIndex,
      pageSize: pagination.value.pageSize
    }
    const response = await $fetch<{ animals: Animal[]; total: number }>(
      '/api/animal/animals',
      { params }
    )
    data.value = response.animals
    total.value = response.total
  } catch (error) {
    console.error('Error fetching animals:', error)
  } finally {
    isPending.value = false
  }
}

watch([() => pagination.value.pageIndex, () => pagination.value.pageSize], fetchAnimals)

// Carga inicial
fetchAnimals()

// Columnas se mantienen igual
const columns: TableColumn<Animal>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row'
      })
  },
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
            row.getIsExpanded() ? 'duration-200 rotate-180' : ''
          ]
        },
        onClick: () => row.toggleExpanded()
      })
  },
  {
    accessorKey: 'id_animal',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Codigo Animal',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'fecha_nacimiento',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Fecha de Nacimiento',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => new Date(row.getValue('fecha_nacimiento')).toLocaleDateString()
  },
  { accessorKey: 'raza', header: 'Raza' },
  {
    accessorKey: 'tipo_animal', header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Tipo',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
  }
]

const expanded = ref({})

const selectedIds = ref<string[]>([])

// Watcher para selecciones
watch(
  () => table.value?.tableApi?.getSelectedRowModel().rows,
  (rows) => {
    selectedIds.value = rows?.map((row) => row.original.id_animal) || []
  }
)

// Función para refrescar la tabla
const refreshTable = () => {
  table.value?.tableApi?.resetRowSelection()
  fetchAnimals()
}
const modalRef = ref()

const openAddModal = () => {
  modalRef.value?.openModal()
}

defineExpose({
  fetchAnimals,
  tableApi: computed(() => table.value?.tableApi)
})
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-between items-center px-4 py-3.5 border-b border-accented">
      <AnimalSearch class="w-full" />
      <UButton v-if="isAdmin" icon="i-heroicons-plus-20-solid" @click="openAddModal" title="Agregar nuevo animal" />
      <AnimalAddModal ref="modalRef" @created="refreshTable" />
    </div>

    <DeleteAnimals v-if="isAdmin && selectedIds.length > 0" :selected-ids="selectedIds" @deleted="refreshTable" />

    <UTable v-model:expanded="expanded" ref="table" :data="data" :columns="isAdmin ? columns : columns.slice(2)" :loading="isPending" class="flex-1">
      <template #expanded="{ row }">
        <AnimalExpandedCard :animal="row.original" @deleted="refreshTable" />
      </template>
    </UTable>

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} de
      {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} filas seleccionadas.
    </div>

    <div class="flex justify-center border-t border-default pt-4">
      <UPagination v-model:page="pagination.pageIndex" :items-per-page="pagination.pageSize" :total="total"
        @update:page="(newPage: number) => pagination.pageIndex = newPage" />
    </div>
  </div>
</template>