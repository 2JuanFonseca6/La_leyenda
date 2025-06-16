<template>
  <UModal v-model="open" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Eliminar Corral
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
        </div>
      </template>

      <div class="p-4">
        <p class="text-gray-700 dark:text-gray-300">
          ¿Estás seguro de que deseas eliminar el corral <strong>{{ corral?.nombre }}</strong>?
          Esta acción no se puede deshacer.
        </p>

        <div v-if="corral?.animal_count && corral.animal_count > 0"
          class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div class="flex">
            <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-yellow-400" />
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                <strong>Atención:</strong> Este corral tiene {{ corral.animal_count }} animal{{ corral.animal_count !==
                  1 ?
                'es' : '' }} asignado{{ corral.animal_count !== 1 ? 's' : '' }}.
                Al eliminarlo, los animales quedarán sin asignar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Cancelar" color="gray" @click="closeModal" />
          <UButton label="Eliminar" color="red" :loading="loading" @click="onConfirm" />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '#imports'
import type { PropType } from 'vue'

// Definir el tipo CorralAPI
interface CorralAPI {
  id_corral: number
  nombre: string
  tipo_corral: string
  capacidad_maxima: number
  descripcion: string
  fecha_creacion: string
  animal_count: number
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  corral: {
    type: Object as PropType<CorralAPI | null>,
    default: null
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'deleted': [corralId: number]
}>()

const toast = useToast()

const open = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const loading = ref(false)

function closeModal() {
  open.value = false
}

const onConfirm = async () => {
  if (!props.corral) return

  loading.value = true
  try {
    const { data, error } = await useFetch(`/api/corrales/specific/${props.corral.id_corral}`, {
      method: 'DELETE'
    })

    if (error.value) {
      throw new Error(error.value.message || 'Error al eliminar el corral')
    }

    toast.add({
      title: 'Éxito',
      description: `Corral ${props.corral.nombre} eliminado correctamente`,
      color: 'green'
    })

    emit('deleted', props.corral.id_corral)
    closeModal()
  } catch (error: any) {
    console.error('Error deleting corral:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'Error al eliminar el corral',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>