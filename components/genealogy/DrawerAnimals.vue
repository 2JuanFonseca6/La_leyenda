<template>
  <UDrawer title="Animales" description="Busca y selecciona un animal de la lista" v-model:open="drawerOpen"
    direction="right" :inset="true">
    <UButton label="Abrir" color="neutral" variant="subtle" trailing-icon="i-lucide-chevron-up"
      @click="drawerOpen = true" />

    <template #body>
      <div class="flex-1 w-full">
        <!-- Filtro -->
        <div class="flex px-4 py-3.5 border-b border-accented">
          <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filtrar..." />
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
            v-model:page="page" 
            v-model:page-size="pageSize" 
            :total="total" 
          />
        </div>

        <!-- Botón de acción -->
        <div class="p-4">
          <UButton 
            v-if="selectedRows.length === 1" 
            label="Seleccionar animal" 
            color="primary" 
            @click="onSelectAnimal" 
            class="w-full"
          />
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { h, resolveComponent, computed, ref, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Database } from '~/types/supabase'

// Props y emits para v-model y evento select
const props = defineProps<{
  modelValue: boolean,
  allowedTypes?: Database['public']['Enums']['tipo_animal'][]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'select', item: Database['public']['Tables']['animals']['Row']): void
}>()

// Control de apertura del drawer
const drawerOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

// Tipo de fila
type Animal = Database['public']['Tables']['animals']['Row']

// Componentes UI
const UCheckbox = resolveComponent('UCheckbox')

// Estado reactivo
const page = ref(1)
const pageSize = ref(10)
const globalFilter = ref('')
const rowSelection = ref<Record<string, boolean>>({})
const animals = ref<Animal[]>([])
const total = ref(0)
const pending = ref(false)

// Función para cargar datos
const fetchAnimals = async () => {
  pending.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      search: globalFilter.value
    }
    const response = await $fetch<{
      animals: Animal[]
      total: number
    }>(`/api/animal/animals`, { params })
    animals.value = response.animals
    total.value = response.total
  } catch (error) {
    console.error('Error fetching animals:', error)
  } finally {
    pending.value = false
  }
}

// Observar cambios en paginación y filtro
watch([page, pageSize, globalFilter], fetchAnimals)

// Cargar datos iniciales
fetchAnimals()

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
  if (!table.value?.tableApi) return []
  
  return table.value.tableApi
    .getFilteredSelectedRowModel()
    .rows
    .map((r: any) => r.original)
    .filter((item: Animal) => item !== null) || []
})

// Al pulsar: emite el objeto completo y cierra
function onSelectAnimal() {
  const item = selectedRows.value[0]
  if (!item) return

  // Si hay restricciones, validar el tipo
  if (props.allowedTypes?.length && item.tipo_animal && !props.allowedTypes.includes(item.tipo_animal)) {
    useToast().add({
      title: "Tipo de animal inválido",
      description: `Este animal (${item.tipo_animal}) no puede ser seleccionado.`,
      color: "warning",
      icon: "i-heroicons-exclamation-circle",
    })
    return
  }

  emit('select', item)
  drawerOpen.value = false
}
</script>