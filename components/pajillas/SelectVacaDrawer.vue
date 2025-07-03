<template>
  <UDrawer
    title="Seleccionar Animal"
    description="Busca y selecciona un animal para asociarlo a la pajilla"
    v-model:open="drawerOpen"
    direction="right"
    :inset="true"
  >
    <UButton
      color="neutral"
      variant="ghost"
      trailing-icon="i-heroicons-magnifying-glass"
      @click="drawerOpen = true"
    />

    <template #content>
      <div class="flex-1 w-full">
        <!-- Filtro -->
        <div class="flex px-4 py-3.5 border-b border-accented">
          <UInput
            v-model="globalFilter"
            class="max-w-sm"
            placeholder="Filtrar animales..."
          />
        </div>

        <!-- Tabla de animales -->
        <UTable
          ref="table"
          v-model:row-selection="rowSelection"
          v-model:global-filter="globalFilter"
          :data="animales"
          :columns="columns"
          :loading="pending"
        />

        <!-- Pie: contador y paginación -->
        <div class="px-4 py-3.5 border-t border-accented text-sm text-muted flex justify-between items-center">
          <div>
            {{ selectedRows.length }} de {{ total }} animal(es) seleccionados
          </div>
          <UPagination
            :page="page"
            :page-size="pageSize"
            :total="total"
            @update:page="onPageChange"
            @update:page-size="onPageSizeChange"
          />
        </div>

        <!-- Botón de acción -->
        <div class="flex justify-end gap-2 mt-4">
          <UButton color="neutral" variant="ghost" @click="onCancel">Cancelar</UButton>
          <UButton color="primary" :disabled="selectedRows.length === 0" @click="onAccept">Aceptar</UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { h, resolveComponent, computed, ref, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Database } from '~/types/supabase'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'select', animals: { id_animal: string; raza: string; tipo_animal: string }[]): void
}>()

const drawerOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const page         = ref(1)
const pageSize     = ref(10)
const globalFilter = ref('')
const rowSelection = ref<Record<string, boolean>>({})
const table        = ref<any>(null)

// Fetch reactivo con paginación y búsqueda
const { data, pending, refresh } = await useFetch<{ animals: Animal[]; total: number }>(
  () => `/api/pajillas/animals?page=${page.value}&pageSize=${pageSize.value}&search=${encodeURIComponent(globalFilter.value)}`
)

watch([page, pageSize, globalFilter], () => refresh(), { deep: true })

type Animal = {
  id_animal: string;
  raza: string;
  tipo_animal: string;
}

const animales = computed(() => {
  if (data.value?.animals && data.value.animals.length > 0) {
    return data.value.animals
  }
  // Modo prueba: si no hay datos, muestra animales de ejemplo
  return [
    { id_animal: 'A001', tipo_animal: 'VACA', raza: 'Holando' },
    { id_animal: 'A002', tipo_animal: 'TORO', raza: 'Angus' },
    { id_animal: 'A003', tipo_animal: 'TERNERO', raza: 'Jersey' }
  ]
})
const total    = computed(() => data.value?.total || 0)

const selectedRows = computed<Animal[]>(() => {
  return table.value?.tableApi
    .getFilteredSelectedRowModel()
    .rows
    .map((r: any) => r.original) || []
})

const UCheckbox = resolveComponent('UCheckbox')
const UPagination = resolveComponent('UPagination')

const columns: TableColumn<Animal>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (v: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!v),
        'aria-label': 'Seleccionar todos'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (v: boolean | 'indeterminate') => row.toggleSelected(!!v),
        'aria-label': 'Seleccionar fila'
      })
  },
  { accessorKey: 'id_animal', header: 'ID' },
  { accessorKey: 'tipo_animal', header: 'Tipo' },
  { accessorKey: 'raza', header: 'Raza' },
]

function onAccept() {
  if (selectedRows.value.length > 0) {
    emit('select', selectedRows.value)
    drawerOpen.value = false
  }
}

function onCancel() {
  drawerOpen.value = false
}

function onPageChange(newPage: number) {
  page.value = newPage
}
function onPageSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
}
</script>