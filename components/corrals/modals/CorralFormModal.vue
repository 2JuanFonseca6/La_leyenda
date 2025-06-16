<template>
  <UModal v-model="open" :transition="true" :overlay="true" :persistent="true" prevent-close title="Corral Form" description="Complete los detalles del corral">
    <UButton label="Open" variant="subtle" />
    <template #body>
      <UForm :state="form" @submit="onSubmit">
        <div class="space-y-6 pt-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold leading-6">
              {{ isEditMode ? 'Editar Corral' : 'Nuevo Corral' }}
            </h3>
            <UButton variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeModal" />
          </div>

          <div class="space-y-4">
            <UFormField label="Nombre" name="nombre" required>
              <UInput v-model="form.nombre" />
            </UFormField>

            <UFormField label="Tipo de Corral" name="tipo_corral" required>
              <USelect v-model="form.tipo_corral" :items="tiposCorralOptions" />
            </UFormField>

            <UFormField label="Capacidad Máxima" name="capacidad_maxima" required>
              <UInput v-model.number="form.capacidad_maxima" type="number" min="1" />
            </UFormField>

            <UFormField label="Descripción (Opcional)" name="descripcion">
              <UTextarea v-model="form.descripcion" />
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <UButton label="Cancelar" @click="closeModal" />
            <UButton :label="isEditMode ? 'Actualizar' : 'Crear'" type="submit" :loading="loading" />
          </div>s
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
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
  'success': [corral: CorralAPI]
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
const isEditMode = computed(() => !!props.corral)

const form = reactive({
  nombre: '',
  tipo_corral: 'ENGORDE',
  capacidad_maxima: 10,
  descripcion: ''
})

const tiposCorral = ['ENGORDE', 'CUARENTENA', 'REPRODUCCION', 'MATERNIDAD', 'DESTETE', 'OTROS']

// Convertir array a opciones para USelect
const tiposCorralOptions = tiposCorral.map(tipo => ({
  label: tipo,
  value: tipo
}))

// Watch para actualizar el formulario cuando cambia el corral
watch(() => props.corral, (newCorral) => {
  if (newCorral) {
    form.nombre = newCorral.nombre
    form.tipo_corral = newCorral.tipo_corral
    form.capacidad_maxima = newCorral.capacidad_maxima
    form.descripcion = newCorral.descripcion || ''
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch para resetear el formulario cuando se abre el modal
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !props.corral) {
    resetForm()
  }
})

function resetForm() {
  form.nombre = ''
  form.tipo_corral = 'ENGORDE'
  form.capacidad_maxima = 10
  form.descripcion = ''
}

function closeModal() {
  open.value = false
  resetForm()
}

const onSubmit = async () => {
  loading.value = true
  try {
    const url = isEditMode.value
      ? `/api/corrales/specific/corrales${props.corral?.id_corral}`
      : '/api/corrales/corrales'

    const method = isEditMode.value ? 'PUT' : 'POST'

    const { data, error } = await useFetch(url, {
      method,
      body: form
    })

    if (error.value) {
      throw new Error(error.value.message || 'Error al guardar el corral')
    }

    if (data.value) {
      toast.add({
        title: 'Éxito',
        description: `Corral ${isEditMode.value ? 'actualizado' : 'creado'} correctamente`,
        color: 'green'
      })

      emit('success', data.value)
      closeModal()
    }
  } catch (error: any) {
    console.error('Error saving corral:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'Error al guardar el corral',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>