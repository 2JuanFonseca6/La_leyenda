<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import type { Table } from '@tanstack/table-core'
import { useUserRole } from '~/composables/arestricted'
import type { InventarioPajilla } from '~/types/pajillas'
import PajillaExpandedCard from './PajillaExpandedCard.vue'
import { useToast } from '#imports'
import PajillaEditModal from './PajillaEditModal.vue'
import PajillaDeleteConfirmModal from './PajillaDeleteConfirmModal.vue'

const props = defineProps<{ search?: string }>()

const { canCreate } = useUserRole()

type Pajilla = InventarioPajilla & { salida_hoy: number }

interface TableComponent {
  tableApi: Table<Pajilla>
}

const table = ref<TableComponent | null>(null)
const UButton = resolveComponent('UButton')

const data = ref<Pajilla[]>([])
const total = ref(0)
const isPending = ref(false)

const pagination = ref({
  pageIndex: 1,
  pageSize: 10
})

const fetchPajillas = async () => {
  console.log('fetchPajillas called')
  isPending.value = true
  try {
    const params = {
      page: pagination.value.pageIndex,
      pageSize: pagination.value.pageSize
    }
    // Fetch inventario y movimientos de hoy
    const [inventarioRes, movimientosRes] = await Promise.all([
      $fetch<{ pajillas: InventarioPajilla[]; total: number }>(
        '/api/pajillas',
        { params }
      ),
      $fetch<{ movimientos: any[] }>(
        '/api/pajillas/movimientos-hoy',
        { params: { fecha: new Date().toISOString().split('T')[0] } }
      )
    ])
    // Mapear salida_hoy
    const movimientosHoy = movimientosRes.movimientos
    data.value = inventarioRes.pajillas.map(p => {
      const salida_hoy = movimientosHoy
        .filter(m => m.pajilla_id === p.id && m.tipo_movimiento === 'SALIDA')
        .reduce((sum, m) => sum + m.cantidad, 0)
      return { ...p, salida_hoy }
    })
    total.value = inventarioRes.total
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
    header: 'ID',
    cell: ({ row }) => h('span', { class: 'font-mono text-sm text-muted' }, `#${row.original.id}`)
  },
  {
    accessorKey: 'pajilla',
    header: 'Código',
    cell: ({ row }) => h('span', { class: 'font-medium text-primary font-mono' }, row.original.pajilla)
  },
  {
    accessorKey: 'fecha_ingreso',
    header: 'Fecha de Ingreso',
    cell: ({ row }) => {
      const date = new Date(row.original.fecha_ingreso)
      return h('span', { class: 'text-sm' }, date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }))
    }
  },
  {
    accessorKey: 'stock_inicial',
    header: 'Stock Inicial',
    cell: ({ row }) => h('span', { class: 'font-mono text-sm' }, row.original.stock_inicial)
  },
  {
    accessorKey: 'salida_hoy',
    header: 'Salida (hoy)',
    cell: ({ row }) => h('span', { class: 'font-mono text-sm text-red-700' }, row.original.salida_hoy)
  },
  {
    accessorKey: 'inventario_final',
    header: 'Stock Final',
    cell: ({ row }) => h('span', { class: 'font-mono text-sm', style: `color: ${row.original.inventario_final > 0 ? '#16a34a' : '#dc2626'}` }, row.original.inventario_final)
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción / Observaciones',
    cell: ({ row }) => {
      if (!row.original.descripcion) {
        return h('span', { class: 'text-muted italic text-sm' }, '—')
      }
      const desc = row.original.descripcion
      const truncated = desc.length > 30 ? desc.substring(0, 30) + '...' : desc
      return h('span', { class: 'text-sm', title: desc.length > 30 ? desc : undefined }, truncated)
    }
  },
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(UButton, {
        icon: 'i-heroicons-trash',
        color: 'error',
        variant: 'soft',
        size: 'sm',
        title: 'Eliminar pajilla',
        onClick: () => eliminarPajilla(row.original)
      })
    ])
  }
]

const selectedIds = ref<number[]>([])
const expanded = ref<Record<string, boolean>>({})

const sorting = ref([
  { id: 'fecha_ingreso', desc: true }
])

const emit = defineEmits(['edit', 'add'])

const refresh = () => {
  fetchPajillas()
}

const filteredRowsCount = computed(() => {
  const rows = table.value?.tableApi?.getFilteredRowModel().rows
  return Array.isArray(rows) ? rows.length : 0
})

const refreshTable = () => {
  table.value?.tableApi?.resetRowSelection()
  fetchPajillas()
}

const filteredData = computed(() => {
  const term = props.search?.toLowerCase() || ''
  if (!term) return data.value
  return data.value.filter(pajilla =>
    pajilla.pajilla.toLowerCase().includes(term) ||
    (pajilla.descripcion ?? '').toLowerCase().includes(term)
  )
})

const showEditModal = ref(false)
const pajillaAEditar = ref<InventarioPajilla | null>(null)
const showDeleteConfirm = ref(false)
const pajillaAEliminar = ref<InventarioPajilla | null>(null)
const isDeleting = ref(false)

function handleEdit(pajilla: InventarioPajilla) {
  pajillaAEditar.value = pajilla
  showEditModal.value = true
}

async function eliminarPajilla(pajilla: InventarioPajilla) {
  pajillaAEliminar.value = pajilla
  showDeleteConfirm.value = true
}

async function confirmarEliminarPajilla() {
  if (!pajillaAEliminar.value) return
  isDeleting.value = true
  const toast = useToast()
  try {
    await $fetch(`/api/pajillas/${pajillaAEliminar.value.id}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    pajillaAEliminar.value = null
    refreshTable()
    toast.add({ title: 'Pajilla eliminada', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Error al eliminar pajilla', color: 'error' })
  } finally {
    isDeleting.value = false
  }
}

function closeDeleteModal() {
  showDeleteConfirm.value = false
}

const resumenGeneral = computed(() => {
  const pajillas = data.value;
  return {
    stockInicial: pajillas.reduce((sum, p) => sum + (p.stock_inicial || 0), 0),
    salidaHoy: pajillas.reduce((sum, p) => sum + (p.salida_hoy || 0), 0),
    stockFinal: pajillas.reduce((sum, p) => sum + (p.inventario_final || 0), 0),
    total: pajillas.length
  }
});

defineExpose({
  fetchPajillas,
  refresh,
  refreshTable,
  tableApi: computed(() => table.value?.tableApi)
})
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <!-- Resumen general -->
    <div class="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="text-center">
        <div class="text-lg font-bold text-primary">{{ resumenGeneral.stockInicial }}</div>
        <div class="text-sm text-muted">Stock Inicial</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-red-600">{{ resumenGeneral.salidaHoy }}</div>
        <div class="text-sm text-muted">Salida (hoy)</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-green-600">{{ resumenGeneral.stockFinal }}</div>
        <div class="text-sm text-muted">Stock Final</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold">{{ resumenGeneral.total }}</div>
        <div class="text-sm text-muted">Total Toros</div>
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

    <!-- Modal de edición de pajilla -->
    <PajillaEditModal
      :open="showEditModal"
      :pajilla="pajillaAEditar"
      @updated="() => { showEditModal = false; refreshTable(); }"
      @close="showEditModal = false"
    />

    <!-- Modal de confirmación de eliminación de pajilla -->
    <PajillaDeleteConfirmModal
      :open="showDeleteConfirm"
      :pajilla="pajillaAEliminar"
      :loading="isDeleting"
      @confirm="confirmarEliminarPajilla"
      @close="closeDeleteModal"
    />
  </div>
</template> 