<script setup lang="ts">
import { h, resolveComponent, ref, onMounted } from 'vue'
import type { TableColumn, TableRow } from '@nuxt/ui'

const UBadge = resolveComponent('UBadge')
const UCheckbox = resolveComponent('UCheckbox')

// Definimos el tipo Corral basado en la estructura de Supabase
type Corral = {
  id_corral: string
  nombre: string
  tipo_corral: string
  capacidad_maxima: number
  descripcion: string
  fecha_creacion: string
  animal_count: number
}

const data = ref<Corral[]>([])
const isLoading = ref(true)
const isDeleting = ref(false)
const deleteErrors = ref<Record<string, string>>({})
const toast = useToast()

// Función para cargar los corrales desde la API
const fetchCorrales = async () => {
  try {
    isLoading.value = true
    const response = await $fetch<{ corrales: Corral[] }>('/api/corrales/corrales', {
      query: {
        page: 1,
        pageSize: 100, // Ajusta según necesidad
        includeAnimals: 'true' // Incluye el conteo de animales 
      }
    })
    data.value = response.corrales
  } catch (error) {
    console.error('Error cargando corrales:', error)
    toast.add({
      title: 'Error',
      description: 'No se pudieron cargar los corrales',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchCorrales)

const columns: TableColumn<Corral>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Seleccionar todos',
        disabled: isLoading.value
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Seleccionar fila',
        disabled: isLoading.value
      })
  },
  {
    accessorKey: 'id_corral',
    header: 'ID',
    cell: ({ row }) => h('span', { class: 'truncate max-w-[200px] inline-block align-middle' }, `${row.getValue('id_corral')}`)
  },
  {
    accessorKey: 'nombre',
    header: 'Nombre'
  },
  {
    accessorKey: 'tipo_corral',
    header: 'Tipo',
    cell: ({ row }) => {
      const tipo = row.getValue('tipo_corral')
      return h(UBadge, { class: 'capitalize', variant: 'subtle', color: 'primary' }, () => tipo)
    }
  },
  {
    accessorKey: 'capacidad_maxima',
    header: 'Capacidad',
    cell: ({ row }) => h('span', row.getValue('capacidad_maxima'))
  },
  {
    accessorKey: 'animal_count',
    header: 'Animales',
    cell: ({ row }) => {
      const count = Number(row.getValue('animal_count'))
      const color = count > 0 ? 'red' : 'green'
      const variant = count > 0 ? 'solid' : 'subtle'
      return h(UBadge, { color, variant }, () => `${count} animal${count !== 1 ? 'es' : ''}`)
    }
  }
]

const table = useTemplateRef('table')
const rowSelection = ref<Record<string, boolean>>({})

const getSelectedIds = () => {
  // If your table ref exposes tableApi, use it to get selected rows
  return table.value?.tableApi?.getSelectedRowModel().rows.map(row => row.original.id_corral) || []
}

// Función para eliminar corrales seleccionados
const deleteSelectedCorrales = async () => {
  const selectedIds = getSelectedIds()

  if (selectedIds.length === 0) {
    toast.add({
      title: 'Selección requerida',
      description: 'Por favor seleccione al menos un corral',
      color: 'warning'
    })
    return
  }

  deleteErrors.value = {}
  isDeleting.value = true
  let successCount = 0
  let errorCount = 0

  // Eliminar cada corral seleccionado individualmente
  for (const id of selectedIds) {
    try {
      await $fetch(`/api/corrales/specific/${id}`, {
        method: 'DELETE'
      })
      successCount++

      // Actualizar lista localmente
      data.value = data.value.filter(corral => corral.id_corral !== id)
    } catch (error: any) {
      console.error(`Error eliminando corral ${id}:`, error)
      errorCount++
      deleteErrors.value[id] = error.data?.statusMessage || error.message || 'Error desconocido'
    }
  }

  // Mostrar resultados
  if (successCount > 0) {
    toast.add({
      title: 'Éxito',
      description: `${successCount} corral${successCount > 1 ? 'es' : ''} eliminado${successCount > 1 ? 's' : ''} correctamente`,
      color: 'success'
    })
    emit('corral-deleted')
  }

  if (errorCount > 0) {
    toast.add({
      title: 'Errores',
      description: `${errorCount} corral${errorCount > 1 ? 'es' : ''} no pudieron ser eliminados`,
      color: 'error'
    })
  }

  // Limpiar selección
  rowSelection.value = {}
  isDeleting.value = false
}
const open = ref(false)

watch(open, (newValue) => {
  if (newValue) {
    fetchCorrales()
  }
})

const emit = defineEmits<{
  (e: 'corral-deleted'): void
  (e: 'refresh'): void
}>()

</script>

<template>
  <UModal v-model:open="open" title="Eliminar Corrales" description="Seleccione los corrales que desea eliminar">

    <UButton color="primary" variant="subtle" icon="i-heroicons-trash" />
    <template #body>
      <div v-if="isLoading" class="flex justify-center py-8">
        <USkeleton class="h-8 w-full mb-2" v-for="i in 5" :key="i" />
      </div>

      <div v-else>
        <UTable ref="table" v-model:row-selection="rowSelection" :data="data" :columns="columns" :loading="isLoading"
          class="w-full" row-key="id_corral">
          <template #empty-state>
            <div class="flex flex-col items-center justify-center py-6 gap-1">
              <UIcon name="i-heroicons-inbox" class="text-gray-500 w-8 h-8" />
              <p class="text-gray-500">No se encontraron corrales</p>
            </div>
          </template>
        </UTable>

        <div class="px-4 py-3.5 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
          {{Object.keys(rowSelection).filter(id => rowSelection[id]).length}} de
          {{ data.length }} corral{{ data.length !== 1 ? 'es' : '' }} seleccionado{{Object.keys(rowSelection).filter(id => rowSelection[id]).length !== 1 ? 's' : '' }}
        </div>

        <div v-if="Object.keys(deleteErrors).length > 0" class="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <h3 class="font-medium text-red-700 dark:text-red-300">Errores de eliminación:</h3>
          <ul class="mt-2 space-y-1">
            <li v-for="(error, id) in deleteErrors" :key="id" class="text-sm text-red-600 dark:text-red-400">
              Corral <span class="truncate inline-block align-middle" style="max-width: 73px;">{{ id }}</span>: {{ error
              }}
            </li>
          </ul>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center gap-4">
        <div class="text-sm text-gray-500">
          <span v-if="Object.keys(deleteErrors).length > 0">
            {{ Object.keys(deleteErrors).length }} error{{ Object.keys(deleteErrors).length > 1 ? 'es' : '' }}
          </span>
        </div>
        <div class="flex gap-3">
          <UButton label="Cancelar" color="primary" :disabled="isDeleting" @click="open = false" />
          <UButton label="Eliminar seleccionados" color="error" :loading="isDeleting"
            :disabled="isLoading || Object.keys(rowSelection).filter(id => rowSelection[id]).length === 0"
            @click="deleteSelectedCorrales" />
        </div>
      </div>
    </template>
  </UModal>
</template>