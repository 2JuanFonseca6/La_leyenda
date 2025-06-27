<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import type { Row, Table } from '@tanstack/table-core'
import type { Database } from '~/types/supabase'
import { useUserRole } from '~/composables/arestricted'
import GenealogySearch from './GenealogySearch.vue'

const { canEdit, canDelete } = useUserRole();

interface TableComponent {
  tableApi: Table<Reproduction>
}

const table = ref<TableComponent | null>(null)

const UButton = resolveComponent('UButton')

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
const expanded = ref({})
const genealogySearchTerm = ref<string>('')

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

function onGenealogySearch(searchValue: string) {
  genealogySearchTerm.value = searchValue.trim()
}

const filteredData = computed(() => {
  const term = genealogySearchTerm.value.trim().toLowerCase()
  if (!term) return data.value
  return data.value.filter(rep =>
    rep.id_reproduccion.toString().toLowerCase().includes(term) ||
    rep.madre_id.toLowerCase().includes(term) ||
    (rep.padre_id ?? '').toLowerCase().includes(term) ||
    rep.raza.toLowerCase().includes(term) ||
    (rep.tipo_concepcion ?? '').toLowerCase().includes(term)
  )
})

const columns: TableColumn<Reproduction>[] = [
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

const refreshTable = () => {
  fetchReproducciones()
}

defineExpose({
  fetchReproducciones,
  tableApi: computed(() => table.value?.tableApi)
})
</script>

<template>
  <GenealogySearch @search="onGenealogySearch" />
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-end gap-3">
      <ReproductionCreateModal v-if="canEdit" @saved="refreshTable" />
    </div>

    <UTable 
      ref="table" 
      v-model:expanded="expanded"
      :data="filteredData" 
      :columns="columns" 
      :loading="isPending" 
      class="flex-1" 
    >
      <template #expanded="{ row }">
        <GenealogyExpandedCard 
          :reproduction="row.original" 
          @updated="refreshTable" 
          @close="row.toggleExpanded()"
        />
      </template>
    </UTable>

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