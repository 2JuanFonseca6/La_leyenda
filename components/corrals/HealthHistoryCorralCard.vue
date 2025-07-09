<!-- components/corrals/HealthHistoryCorralCard.vue -->
<template>
  <UCard class="mt-8 shadow-md print:shadow-none print:mt-4 print:border print:border-gray-300" :class="{ 'print:hidden': !show }">
    <template #header>
      <div class="flex justify-between items-center print:flex-col print:items-start print:gap-2">
        <h2 class="text-xl font-bold print:text-lg">Historial de Salud del Corral</h2>
        <UButton v-if="userRole === 'admin'" icon="i-heroicons-plus" @click="openCreateModal"
          class="print:hidden bg-[var(--color-custom-50)] text-[var(--color-custom-500)] dark:bg-[var(--color-custom-500)] dark:text-[var(--color-custom-50)] hover:text-[var(--color-custom-50)] dark:hover:text-[var(--color-custom-500)] rounded-full p-2" />
      </div>
    </template>

    <div v-if="historialSalud?.length" class="max-h-96 overflow-y-auto space-y-4 pr-2 print:max-h-none print:space-y-2 print:pr-0">
      <div v-for="registro in historialSalud" :key="registro.id" class="border-b pb-4 last:border-b-0 print:pb-2 print:border-b-gray-200">
        <div class="flex justify-between items-start print:flex-col print:gap-1">
          <div class="space-y-1 print:space-y-0">
            <p class="font-semibold print:text-sm">{{ registro.descripcion }}</p>
            <p class="text-sm text-gray-500 print:text-xs" v-if="registro.observaciones">
              {{ registro.observaciones }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0 ml-4 print:ml-0 print:gap-1">
            <p class="text-sm text-gray-500 print:text-xs">
              {{ new Date(registro.fecha_evento).toLocaleDateString() }}
            </p>
            <div v-if="userRole === 'admin'" class="flex gap-1 print:hidden">
              <UButton icon="i-heroicons-pencil-square" color="secondary" variant="ghost"
                @click="openEditModal(registro)" />
              <UButton icon="i-heroicons-trash" color="error" variant="ghost"
                @click="confirmDelete(registro.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <UAlert v-if="!historialSalud.length" title="Sin registros de salud"
      description="No se encontró historial de salud para este corral." icon="i-heroicons-information-circle"
      color="warning" class="mb-4 print:text-sm" />

    <!-- Modal de Edición/Creación -->
    <UModal v-model:open="isModalOpen" :title="modalTitle"
      description="Formulario para registrar un evento de salud del corral.">
      <template #body>
        <UForm :state="form" @submit="handleSubmit" class="space-y-4">
          <!-- Información sobre animales afectados (solo para creación) -->
          <div v-if="!isEditing && animalesInfo" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-information-circle" class="text-blue-600 dark:text-blue-400" />
              <span class="font-semibold text-blue-800 dark:text-blue-200">Información del Corral</span>
            </div>
            <p class="text-sm text-blue-700 dark:text-blue-300">
              Este evento se aplicará a <strong>{{ animalesInfo.total_animales }} animales</strong> en el corral "{{ animalesInfo.corral.nombre }}".
            </p>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Se creará automáticamente un evento de salud individual para cada animal del corral.
            </p>
          </div>

          <div class="flex space-x-4">
            <UFormField name="descripcion" required>
              <template #label>
                <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Descripción</span>
              </template>
              <UInput v-model="form.descripcion" />
            </UFormField>

            <UFormField name="fecha_evento" required>
              <template #label>
                <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Fecha del Evento</span>
              </template>
              <UInput type="date" v-model="form.fecha_evento" :max="new Date().toISOString().split('T')[0]" />
            </UFormField>
          </div>

          <UFormField name="observaciones">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Observaciones</span>
            </template>
            <UTextarea v-model="form.observaciones" :maxlength="250" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-3 mt-4">
            <UButton type="button" @click="isModalOpen = false">Cancelar</UButton>
            <UButton type="submit" :loading="isSubmitting">
              {{ isEditing ? 'Guardar Cambios' : 'Crear Registro' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { useUserRole } from '~/composables/arestricted'

const { userRole } = useUserRole()
const toast = useToast()
const props = defineProps({
  historialSalud: {
    type: Array as () => any[],
    default: () => []
  },
  corralId: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['updated'])

// Estados del modal
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const currentRecordId = ref<number | null>(null)
const animalesInfo = ref<any>(null)

const modalTitle = computed(() =>
  isEditing.value ? 'Editar Evento de Salud' : 'Nuevo Evento de Salud'
)

const formDefaults = () => ({
  descripcion: '',
  fecha_evento: new Date().toISOString().split('T')[0],
  observaciones: ''
})

const form = reactive({ ...formDefaults() })

// Cargar información de animales del corral
const cargarAnimalesInfo = async () => {
  try {
    const response = await $fetch(`/api/corrales/${props.corralId}/animales`)
    animalesInfo.value = response
  } catch (error) {
    console.error('Error cargando información de animales:', error)
    animalesInfo.value = null
  }
}

// Abrir modal para edición
const openEditModal = (registro: any) => {
  isEditing.value = true
  currentRecordId.value = registro.id
  Object.assign(form, {
    descripcion: registro.descripcion,
    fecha_evento: new Date(registro.fecha_evento).toISOString().split('T')[0],
    observaciones: registro.observaciones || ''
  })
  isModalOpen.value = true
}

// Abrir modal para creación
const openCreateModal = async () => {
  isEditing.value = false
  currentRecordId.value = null
  Object.assign(form, formDefaults())
  
  // Cargar información de animales antes de abrir el modal
  await cargarAnimalesInfo()
  
  isModalOpen.value = true
}

// Manejar envío del formulario
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const url = currentRecordId.value
      ? `/api/corrales/salud/evento/${currentRecordId.value}`
      : '/api/corrales/salud/health'

    const method = currentRecordId.value ? 'PUT' : 'POST'

    const body = {
      ...form,
      corral_id: props.corralId.toString(),
      fecha_evento: new Date(form.fecha_evento).toISOString()
    }

    const response = await $fetch<any>(url, {
      method,
      body
    }) as { historial: any[], animales_afectados?: number, mensaje?: string }

    emit('updated', response.historial)
    isModalOpen.value = false

    // Mostrar mensaje específico si se creó un evento nuevo
    if (!currentRecordId.value && response.animales_afectados !== undefined) {
      toast.add({
        title: 'Evento creado exitosamente',
        description: response.mensaje || `Evento creado para el corral y ${response.animales_afectados} animales`,
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
    } else {
      toast.add({
        title: currentRecordId.value ? 'Registro actualizado' : 'Registro creado',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
    }
  } catch (error: any) {
    console.error('Error en handleSubmit:', error)
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || error.message || 'Error desconocido',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Manejar eliminación
const confirmDelete = (id: number) => {
  toast.add({
    title: '¿Eliminar registro?',
    description: 'Esta acción no se puede deshacer',
    color: 'error',
    actions: [{
      label: 'Confirmar',
      onClick: () => deleteRecord(id),
      color: 'success'
    }],
    duration: 5000,
    icon: 'i-heroicons-trash'
  })
}

const deleteRecord = async (id: number) => {
  try {
    await $fetch(`/api/corrales/salud/evento/${id}`, {
      method: 'DELETE'
    })

    emit('updated')
    toast.add({
      title: 'Registro eliminado',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error: any) {
    console.error('Error eliminando registro:', error)
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || error.message || 'Error al eliminar',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  }
}
</script> 