<template>
  <div class="flex flex-col h-full">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <UIcon name="i-svg-spinners-270-ring" class="w-12 h-12 text-primary" />
    </div>

    <UTable v-else v-model:expanded="expanded" :data="corrales" :columns="columns"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }" class="flex-1">
      <template #expanded="{ row }">
        <div class="space-y-4">
          <!-- Drop zone -->
          <div @dragover.prevent="onDragOver($event, row.original.id_corral)"
            @drop.prevent="onDrop($event, row.original.id_corral)"
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ease"
            :class="[
              isDragOver === row.original.id_corral
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 scale-[1.02]'
                : 'border-gray-300 bg-gray-50 dark:bg-gray-700'
            ]">
            <div class="flex flex-col items-center justify-center py-4">
              <UIcon name="i-healthicons-animal-cow-outline" class="mb-2 w-8 h-8 text-gray-400 dark:text-gray-500" />
              <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Arrastre y suelte un animal aquí</p>
              <p class="text-xs text-gray-400">
                {{ row.original.animal_count }}/{{ row.original.capacidad_maxima }} animales
              </p>
              <div v-if="dropError && dropError.corralId === row.original.id_corral" class="text-red-500 text-xs mt-2">
                {{ dropError.message }}
              </div>
            </div>
          </div>

          <!-- Lista de animales en el corral -->
          <div v-if="row.original.animals && row.original.animals.length > 0">
            <h3 class="font-semibold mb-2">Animales en este corral:</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div v-for="animal in row.original.animals" :key="animal.id_animal"
                class="bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center">
                <UIcon name="i-healthicons-animal-cow-outline" class="mr-2 text-primary" />
                <div>
                  <p class="font-medium">{{ animal.id_animal }}</p>
                  <p class="text-xs">{{ animal.raza }} ({{ animal.peso_actual }} kg)</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-4">
            No hay animales en este corral
          </div>
        </div>
      </template>
    </UTable>

    <UPagination v-model="page" :page-count="pageSize" :total="totalCorrales" class="mt-4 self-end" />
  </div>
</template>

<script lang="ts" setup>
import { h, resolveComponent, ref, onMounted, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type AnimalInCorral = {
  id_animal: string;
  raza: string;
  peso_actual: number;
  tipo_animal: string;
  estado_salud: string;
};


type Corral = {
  id_corral: string;
  nombre: string;
  tipo_corral: "ENGORDE" | "CUARENTENA" | "REPRODUCCION" | "MATERNIDAD" | "DESTETE" | "OTROS";
  capacidad_maxima: number;
  animal_count: number;
  animals: AnimalInCorral[];
}

const UButton = resolveComponent('UButton')
const expanded = ref<Record<number, boolean>>({})
const loading = ref(true)
const error = ref<string | null>(null)
const isDragOver = ref<string | null>(null)  // CAMBIADO A STRING
const dropError = ref<{ corralId: string; message: string } | null>(null)  // CAMBIADO A STRING

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

// Manejar drag over
const onDragOver = (event: DragEvent, corralId: string) => {  // CAMBIADO A STRING
  event.preventDefault();
  isDragOver.value = corralId;
  dropError.value = null;
}

// Manejar drop
const onDrop = async (event: DragEvent, corralId: string) => {  // CAMBIADO A STRING
  event.preventDefault();
  isDragOver.value = null;

  const animalId = event.dataTransfer?.getData('animalId');
  if (!animalId) return;

  try {
    // Asignar animal al corral
    const response = await $fetch<{ success: boolean }>('/api/corrales/assign', {
      method: 'PUT',
      body: {
        animalId,
        corralId
      }
    });

    if (response.success) {
      // Actualizar datos
      await fetchCorrales();
      // Emitir evento para actualizar AnimalDrag
      emit('animalAssigned', animalId);
    }
  } catch (err: any) {
    console.error('Error asignando animal:', err);
    dropError.value = {
      corralId,
      message: err.data?.statusMessage || 'Error asignando animal al corral'
    };

    // Auto-ocultar el error después de 5 segundos
    setTimeout(() => {
      if (dropError.value?.corralId === corralId) {
        dropError.value = null;
      }
    }, 5000);
  }
}

// Exponer función de actualización
defineExpose({
  refresh: fetchCorrales
})

// Cargar datos iniciales
onMounted(fetchCorrales)
watch(page, fetchCorrales)

// Emitir eventos
const emit = defineEmits<{
  animalAssigned: [animalId: string]
}>()
</script>