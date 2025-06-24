<template>
  <UModal :model-value="props.modelValue" @update:modelValue="emit('update:modelValue', $event)" title="Corral Form"
    description="Complete los detalles del corral" :overlay="true" :persistent="true">
    <UButton color="primary" variant="subtle" icon="i-heroicons-plus"/>
    <template #body>
      <UForm :state="form" @submit="onSubmit">
        <div class="space-y-4 pt-2">
          <h3 class="text-base font-semibold leading-6">
            {{ isEditMode ? 'Editar Corral' : 'Nuevo Corral' }}
          </h3>

          <UFormField name="nombre" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Nombre del Corral
              </span>
            </template>
            <UInput v-model="form.nombre" />
          </UFormField>

          <UFormField name="tipo_corral" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Tipo de Corral
              </span>
            </template>
            <USelect v-model="form.tipo_corral" :items="tiposCorralOptions" />
          </UFormField>

          <UFormField name="capacidad_maxima" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Capacidad Máxima
              </span>
            </template>
            <UInput v-model.number="form.capacidad_maxima" type="number" min="1" />
          </UFormField>

          <UFormField name="descripcion">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Descripción (opcional)
              </span>
            </template>
            <UTextarea v-model="form.descripcion" />
          </UFormField>
        </div>
<div class="flex justify-end gap-3 pt-4">
          <UButton :label="isEditMode ? 'Actualizar' : 'Crear'" type="submit" :loading="loading" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useToast } from '#imports'
import type { PropType } from 'vue'

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
  modelValue: { type: Boolean, required: true },
  corral: { type: Object as PropType<CorralAPI | null>, default: null }
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': [corral: CorralAPI]
}>()

const toast = useToast()
const loading = ref(false)
const isEditMode = computed(() => !!props.corral)

const form = reactive({
  nombre: '',
  tipo_corral: 'ENGORDE',
  capacidad_maxima: 10,
  descripcion: ''
})

const tiposCorral = ['ENGORDE', 'CUARENTENA', 'REPRODUCCION', 'MATERNIDAD', 'DESTETE', 'OTROS']
const tiposCorralOptions = tiposCorral.map(tipo => ({ label: tipo, value: tipo }))

watch(() => props.corral, (newCorral) => {
  if (newCorral) {
    Object.assign(form, {
      nombre: newCorral.nombre,
      tipo_corral: newCorral.tipo_corral,
      capacidad_maxima: newCorral.capacidad_maxima,
      descripcion: newCorral.descripcion || ''
    })
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  Object.assign(form, {
    nombre: '',
    tipo_corral: 'ENGORDE',
    capacidad_maxima: 10,
    descripcion: ''
  })
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

    if (error.value) throw new Error(error.value.message || 'Error al guardar el corral')

    if (data.value) {
      toast.add({
        title: 'Éxito',
        description: `Corral ${isEditMode.value ? 'actualizado' : 'creado'} correctamente`,
        color: 'success'
      })

      emit('success', data.value as CorralAPI)
    }
  } catch (error: any) {
    console.error('Error saving corral:', error)
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
