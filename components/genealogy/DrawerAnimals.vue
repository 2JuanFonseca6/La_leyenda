<template>
    <UDrawer title="Animales" description="Busca y selecciona un animal de la lista" v-model:open="drawerOpen" direction="right" :inset="true">
      <UButton
        label="Abrir"
        color="neutral"
        variant="subtle"
        trailing-icon="i-lucide-chevron-up"
        @click="drawerOpen = true"
      />
  
      <template #body>
        <div class="flex-1 w-full">
          <!-- Filtro -->
          <div class="flex px-4 py-3.5 border-b border-accented">
            <UInput
              v-model="globalFilter"
              class="max-w-sm"
              placeholder="Filtrar..."
            />
          </div>
  
          <!-- Tabla de animales -->
          <UTable
            ref="table"
            v-model:row-selection="rowSelection"
            v-model:global-filter="globalFilter"
            :data="animals"
            :columns="columns"
            :loading="pending"
          />
  
          <!-- Pie: contador y paginación -->
          <div class="px-4 py-3.5 border-t border-accented text-sm text-muted flex justify-between items-center">
            <div>
              {{ selectedRows.length }} de {{ total }} animal(es) seleccionada(s)
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
          <UButton
            v-if="selectedRows.length === 1"
            label="Seleccionar animal"
            color="primary"
            @click="onSelectAnimal"
          />
        </div>
      </template>
    </UDrawer>
  </template>
  
  <script setup lang="ts">
  import { h, resolveComponent, computed, ref } from 'vue'
  import { useFetch } from '#app'
  import type { TableColumn } from '@nuxt/ui'
  import type { Database } from '~/types/supabase'
  
  // Props y emits para v-model y evento select
  const props = defineProps<{ modelValue: boolean }>()
  const emit  = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
    (e: 'select', item: Database['public']['Tables']['animals']['Row']): void
  }>()
  
  // Control de apertura del drawer
  const drawerOpen = computed({
    get: () => props.modelValue,
    set: v   => emit('update:modelValue', v)
  })
  
  // Tipo de fila
  type Animal = Database['public']['Tables']['animals']['Row']
  
  // Componentes UI
  const UCheckbox   = resolveComponent('UCheckbox')
  const UPagination = resolveComponent('UPagination')
  
  // Estado reactivo
  const page         = ref(1)
  const pageSize     = ref(10)
  const globalFilter = ref('')
  const rowSelection = ref<Record<string, boolean>>({})
  
  // Fetch datos de animales
  const { data, pending } = useFetch<{
    animals: Animal[]
    total: number
  }>(() => `/api/animal/animals?page=${page.value}&pageSize=${pageSize.value}`)
  
  const animals = computed(() => data.value?.animals || [])
  const total   = computed(() => data.value?.total || 0)
  
  // Columnas de la tabla
  const columns: TableColumn<Animal>[] = [
    {
      id: 'select',
      header: ({ table }) =>
        h(UCheckbox, {
          modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
          'onUpdate:modelValue': (v: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!v),
          'aria-label': 'Select all'
        }),
      cell: ({ row }) =>
        h(UCheckbox, {
          modelValue: row.getIsSelected(),
          'onUpdate:modelValue': (v: boolean | 'indeterminate') => row.toggleSelected(!!v),
          'aria-label': 'Select row'
        })
    },
    { accessorKey: 'id_animal', header: 'ID' },
    { accessorKey: 'tipo_animal', header: 'Tipo' },
    { accessorKey: 'raza', header: 'Raza' }
  ]
  
  // Ref a la tabla para API interno
  const table = ref<any>(null)
  
  // Filas seleccionadas completas
  const selectedRows = computed<Animal[]>(() => {
    return table.value?.tableApi
      .getFilteredSelectedRowModel()
      .rows
      .map((r: any) => r.original) || []
  })
  
  // Paginación
  function onPageChange(newPage: number) {
    page.value = newPage
  }
  function onPageSizeChange(newSize: number) {
    pageSize.value = newSize
    page.value = 1
  }
  
  // Al pulsar: emite el objeto completo y cierra
  function onSelectAnimal() {
    const item = selectedRows.value[0]
    if (item) {
      emit('select', item)
      drawerOpen.value = false
    }
  }
  </script>
  