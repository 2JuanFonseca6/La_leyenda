<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import type { Row, Table } from '@tanstack/table-core'
import type { Database } from '~/types/supabase'
import { useUserRole } from '~/composables/arestricted'

const { userRole } = useUserRole();

interface TableComponent {
  tableApi: Table<Reproduction>
}

const table = ref<TableComponent | null>(null)

const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')

type Reproduction = {
  id_reproduccion: number
  fecha_evento: string
  madre_id: string
  padre_id: string | null
  raza: string
  tipo_concepcion: Database["public"]["Enums"]["tipo_concepcion"] | null
}

const data = ref<Reproduction[]>([])
const total = ref(0)
const isPending = ref(false)

const isSingleSelected = computed(() => selectedIds.value.length === 1)
const selectedReproduction = computed(() => {
  if (selectedIds.value.length === 0) return null
  return data.value.find(rep => rep.id_reproduccion === selectedIds.value[0]) || null
})
const editModal = ref<{ openModal: () => void } | null>(null)

const pagination = ref({
  pageIndex: 1,
  pageSize: 10
})

const fetchReproducciones = async () => {
  isPending.value = true
  try {
    const params = {
      page: pagination.value.pageIndex,
      pageSize: pagination.value.pageSize
    }
    const response = await $fetch<{ reproducciones: Reproduction[]; total: number }>('/api/reproduction/reproductions', { params })
    data.value = response.reproducciones
    total.value = response.total
  } catch (error) {
    console.error('Error fetching reproducciones:', error)
  } finally {
    isPending.value = false
  }
}

watch([() => pagination.value.pageIndex, () => pagination.value.pageSize], fetchReproducciones)

fetchReproducciones()

const columns: TableColumn<Reproduction>[] = [
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
  // Nueva columna ID
  {
    accessorKey: 'id_reproduccion',
    header: 'ID Reproducción',
    cell: ({ row }) => row.original.id_reproduccion
  },
  {
    accessorKey: 'fecha_evento',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Fecha Evento',
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
    accessorKey: 'madre_id',
    header: 'ID Madre'
  },
  {
    accessorKey: 'padre_id',
    header: 'ID Padre',
    cell: ({ row }) => row.original.padre_id || 'N/A'
  },
  {
    accessorKey: 'raza',
    header: 'Raza'
  },
  {
    accessorKey: 'tipo_concepcion',
    header: 'Tipo',
    cell: ({ row }) => row.original.tipo_concepcion?.toUpperCase() || 'N/A'
  }
]

const displayColumns = computed(() => {
  if (userRole.value === 'admin') return columns
  return columns.filter(col => col.id !== 'select')
})

// Eliminamos la referencia a expanded
const selectedIds = ref<number[]>([])

watch(
  () => table.value?.tableApi?.getSelectedRowModel().rows,
  (rows) => {
    selectedIds.value = rows?.map((row) => row.original.id_reproduccion) || []
  }
)

const refreshTable = () => {
  table.value?.tableApi?.resetRowSelection()
  fetchReproducciones()
}

defineExpose({
  fetchReproducciones,
  tableApi: computed(() => table.value?.tableApi)
})
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-end gap-3">
      <ReproductionCreateModal v-if="userRole === 'admin'" @saved="refreshTable" />

      <UButton v-if="selectedReproduction && userRole === 'admin'" color="primary" icon="i-heroicons-pencil-square"
        @click="editModal?.openModal?.()" class="rounded-full">
      </UButton>

      <EditReproduction v-if="selectedReproduction && userRole === 'admin'" ref="editModal" :reproduction="selectedReproduction"
        @saved="refreshTable" />
    </div>

    <DeleteReproductions v-if="selectedIds.length > 0 && userRole === 'admin'" :selected-ids="selectedIds" @deleted="refreshTable" />

    <UTable ref="table" :data="data" :columns="displayColumns" :loading="isPending" class="flex-1" />

    <div v-if="userRole === 'admin'" class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} de
      {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} filas seleccionadas.
    </div>

    <div class="flex justify-center border-t border-default pt-4">
      <UPagination v-model:page="pagination.pageIndex" :items-per-page="pagination.pageSize" :total="total"
        @update:page="(newPage: number) => pagination.pageIndex = newPage" />
    </div>
  </div>
</template>