<template>
  <div class="flex flex-col h-full">
    <!-- Agrega un loader para mejor UX -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <UIcon name="i-svg-spinners-270-ring" class="w-12 h-12 text-primary" />
    </div>

    <UTable v-else v-model:expanded="expanded" :data="corrales" :columns="columns"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }" class="flex-1">
      <template #expanded="{ row }">
        <label for="dropzone-file"
          class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <UIcon name="i-healthicons-animal-cow-outline" class="mb-3 w-10 h-10 text-gray-400 dark:text-gray-500" />
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">Arraste y suelte un animal</p>
          </div>
          <input id="dropzone-file" type="file" class="hidden" />
        </label>
      </template>
    </UTable>
    <!-- Paginación -->
    <UPagination v-model="page" :page-count="pageSize" :total="totalCorrales" class="mt-4 self-end" />
  </div>
</template>


<script lang="ts" setup>
import { h, resolveComponent, ref, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'

// Tipos actualizados para incluir datos de la API
type Corral = {
  id_corral: number
  nombre: string
  tipo_corral: "ENGORDE" | "CUARENTENA" | "REPRODUCCION" | "MATERNIDAD" | "DESTETE" | "OTROS"
  capacidad_maxima: number
  animal_count: number
}

const UButton = resolveComponent('UButton')
const expanded = ref<Record<number, boolean>>({})
const loading = ref(true)
const error = ref<string | null>(null)

// Datos desde la API
const corrales = ref<Corral[]>([])
const totalCorrales = ref(0)
const page = ref(1)
const pageSize = ref(50)

// Columnas actualizadas
const columns: TableColumn<Corral>[] = [
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
    accessorKey: 'nombre',
    header: 'Corral',
  },
  {
    accessorKey: 'tipo_corral',
    header: 'Tipo Corral',
  },
  {
    accessorKey: 'capacidad_maxima',
    header: 'Capacidad',
  },
  // Nueva columna para mostrar animales en el corral
  {
    accessorKey: 'animal_count',
    header: 'Animales',
    cell: ({ row }) => h('span', `${row.original.animal_count}/${row.original.capacidad_maxima}`)
  }
]

// Función para cargar datos desde la API
async function fetchCorrales() {
  try {
    loading.value = true
    const { corrales: data, total } = await $fetch<{ corrales: Corral[]; total: number }>('/api/corrales/corrales', {
      query: {
        page: page.value,
        pageSize: pageSize.value
      }
    })

    corrales.value = data
    totalCorrales.value = total
  } catch (err: any) {
    error.value = `Error cargando corrales: ${err.message}`
    console.error('API fetch error:', err)
  } finally {
    loading.value = false
  }
}

// Cargar datos iniciales
onMounted(fetchCorrales)

// Recargar cuando cambia la página
watch(page, fetchCorrales)
</script>