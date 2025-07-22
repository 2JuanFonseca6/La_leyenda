<script setup lang="ts">
const props = defineProps<{ search?: string }>()
import { ref, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import type { Table } from '@tanstack/table-core'

type Provider = {
  id_proveedor: number
  nombre_empresa: string
  telefono: string
  correo_empresa: string | null
  direccion: string | null
}

interface TableComponent {
  tableApi: Table<Provider>
}

const table = ref<TableComponent | null>(null)
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')

const data = ref<Provider[]>([])
const total = ref(0)
const isPending = ref(false)

const selectedIds = ref<number[]>([])
const emit = defineEmits(['refreshed'])

const pagination = ref({
  pageIndex: 1,
  pageSize: 10
})

const fetchProviders = async () => {
  isPending.value = true
  try {
    const params = {
      page: pagination.value.pageIndex,
      pageSize: pagination.value.pageSize,
      search: props.search || ''
    }
    const response = await $fetch<{ proveedores: Provider[], total: number }>('/api/providers/providers', { params })
    data.value = response.proveedores
    total.value = response.total
    emit('refreshed')
  } catch (error) {
    console.error('Error fetching providers:', error)
  } finally {
    isPending.value = false
  }
}

watch([() => pagination.value.pageIndex, () => pagination.value.pageSize, () => props.search], fetchProviders)

// Carga inicial
fetchProviders()

const columns: TableColumn<Provider>[] = [
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
    accessorKey: 'id_proveedor',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'ID Proveedor',
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
    accessorKey: 'nombre_empresa',
    header: 'Empresa',
  },
  {
    accessorKey: 'telefono',
    header: 'Teléfono',
  },
  {
    accessorKey: 'correo_empresa',
    header: 'Email',
  },
  {
    accessorKey: 'direccion',
    header: 'Dirección',
  }
]

const expanded = ref({})

defineExpose({
  fetchProviders
})

watch(
  () => table.value?.tableApi?.getSelectedRowModel().rows,
  (rows) => {
    selectedIds.value = rows?.map((row) => row.original.id_proveedor) || []
  }
)

// Función para refrescar la tabla
const refreshTable = () => {
  table.value?.tableApi?.resetRowSelection()
  fetchProviders()
}
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-between items-center px-4">
      <div class="space-x-2">
        <DeleteProvider
          v-if="selectedIds.length > 0"
          :selected-ids="selectedIds"
          @deleted="refreshTable"
        />
      </div>
    </div>

    <UTable v-model:expanded="expanded" ref="table" :data="data" :columns="columns" :loading="isPending" class="flex-1">
      <template #expanded="{ row }">
        <ProviderExpanded :item="row.original" @updated="refreshTable" />
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