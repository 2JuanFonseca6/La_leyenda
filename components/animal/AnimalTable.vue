<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserRole } from '~/composables/arestricted'
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import type { Table } from '@tanstack/table-core'

const { userRole } = useUserRole()

interface TableComponent {
  tableApi: Table<Animal>
}

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
fetchAnimals()

const adminColumns: TableColumn<Animal>[] = [
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
  }
]

const baseColumns: TableColumn<Animal>[] = [
  {
    id: 'expand',
    cell: ({ row }) => {
      if (userRole.value !== 'admin') return null // ❌ Oculta botón expandir para usuarios
      return h(UButton, {
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
    }
  },
  {
    accessorKey: 'id_animal',
    header: 'Código Animal'
  },
  {
    accessorKey: 'fecha_nacimiento',
    header: 'Fecha de Nacimiento',
    cell: ({ row }) =>
      new Date(row.getValue('fecha_nacimiento')).toLocaleDateString()
  },
  {
    accessorKey: 'raza',
    header: 'Raza'
  },
  {
    accessorKey: 'tipo_animal',
    header: 'Tipo'
  }
]

// columnas dinámicas
const columns = computed(() => {
  return userRole.value === 'admin'
    ? [...adminColumns, ...baseColumns]
    : baseColumns
})

const expanded = ref({})
const selectedIds = ref<string[]>([])

watch(
  () => table.value?.tableApi?.getSelectedRowModel().rows,
  (rows) => {
    selectedIds.value = rows?.map((row) => row.original.id_animal) || []
  }
)

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

const props = defineProps<{ search?: string }>()

const filteredData = computed(() => {
  const term = (props.search || '').trim().toLowerCase()
  if (!term) return data.value
  return data.value.filter(animal =>
    animal.id_animal.toLowerCase().includes(term) ||
    animal.raza.toLowerCase().includes(term) ||
    animal.tipo_animal.toLowerCase().includes(term)
  )
})
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-between items-center px-4 py-3.5 border-b border-accented">
      <!-- <AnimalSearch class="w-full" /> -->
      <UButton
        v-if="userRole === 'admin'"
        icon="i-heroicons-plus-20-solid"
        @click="openAddModal"
        title="Agregar nuevo animal"
      />
      <AnimalAddModal ref="modalRef" @created="refreshTable" />
    </div>

    <DeleteAnimals
      v-if="userRole === 'admin' && selectedIds.length > 0"
      :selected-ids="selectedIds"
      @deleted="refreshTable"
    />

    <UTable
      v-model:expanded="expanded"
      ref="table"
      :data="filteredData"
      :columns="columns"
      :loading="isPending"
      class="flex-1"
    >
      <template #expanded="{ row }">
        <AnimalExpandedCard
          :animal="row.original"
          @deleted="refreshTable"
          :can-edit="userRole === 'admin'"
        />
      </template>
    </UTable>

    <div
      v-if="userRole === 'admin'"
      class="px-4 py-3.5 border-t border-accented text-sm text-muted"
    >
      {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} de
      {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} filas seleccionadas.
    </div>

    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        v-model:page="pagination.pageIndex"
        :items-per-page="pagination.pageSize"
        :total="total"
        @update:page="(newPage: number) => pagination.pageIndex = newPage"
      />
    </div>
  </div>
</template>
