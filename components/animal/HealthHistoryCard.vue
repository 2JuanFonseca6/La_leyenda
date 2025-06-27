<!-- components/animal/HealthHistoryCard.vue -->
<template>
  <UCard class="mt-8 shadow-md print:shadow-none print:mt-4 print:border print:border-gray-300" :class="{ 'print:hidden': !show }">
    <template #header>
      <div class="flex justify-between items-center print:flex-col print:items-start print:gap-2">
        <h2 class="text-xl font-bold print:text-lg">Historial de Salud</h2>
        <UButton v-if="userRole === 'admin'" icon="i-heroicons-plus" @click="openCreateModal"
          class="print:hidden bg-[var(--color-custom-50)] text-[var(--color-custom-500)] dark:bg-[var(--color-custom-500)] dark:text-[var(--color-custom-50)] hover:text-[var(--color-custom-50)] dark:hover:text-[var(--color-custom-500)] rounded-full p-2" />
      </div>
    </template>

    <div v-if="historialSalud?.length" class="max-h-96 overflow-y-auto space-y-4 pr-2 print:max-h-none print:space-y-2 print:pr-0">
      <div v-for="registro in historialSalud" :key="registro.id_historial" class="border-b pb-4 last:border-b-0 print:pb-2 print:border-b-gray-200">
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
                @click="confirmDelete(registro.id_historial)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <UAlert v-if="!historialSalud.length" title="Sin registros de salud"
      description="No se encontró historial de salud para este animal." icon="i-heroicons-information-circle"
      color="warning" class="mb-4 print:text-sm" />

    <!-- Modal de Edición/Creación -->
    <UModal v-model:open="isModalOpen" :title="modalTitle"
      description="Formulario para registrar un registro de salud.">
      <template #body>
        <UForm :state="form" @submit="handleSubmit" class="space-y-4">
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
import type { HistorialSalud } from '~/types/animal'
import { useUserRole } from '~/composables/arestricted'

const { userRole } = useUserRole()
const toast = useToast()
const props = defineProps({
  historialSalud: {
    type: Array as () => HistorialSalud[],
    default: () => []
  },
  animalId: {
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

const modalTitle = computed(() =>
  isEditing.value ? 'Editar Registro de Salud' : 'Nuevo Registro de Salud'
)

const formDefaults = () => ({
  descripcion: '',
  fecha_evento: new Date().toISOString().split('T')[0],
  observaciones: ''
})

const form = reactive({ ...formDefaults() })

// Abrir modal para edición
const openEditModal = (registro: HistorialSalud) => {
  isEditing.value = true
  currentRecordId.value = registro.id_historial
  Object.assign(form, {
    descripcion: registro.descripcion,
    fecha_evento: new Date(registro.fecha_evento).toISOString().split('T')[0],
    observaciones: registro.observaciones || ''
  })
  isModalOpen.value = true
}

// Abrir modal para creación
const openCreateModal = () => {
  isEditing.value = false
  currentRecordId.value = null
  Object.assign(form, formDefaults())
  isModalOpen.value = true
}

// Manejar envío del formulario
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const url = currentRecordId.value
      ? `/api/health/specific/${currentRecordId.value}`
      : '/api/health/health'

    const method = currentRecordId.value ? 'PUT' : 'POST'

    const body = {
      ...form,
      animal_id: props.animalId.toString(),
      fecha_evento: new Date(form.fecha_evento).toISOString()
    }

    const response = await $fetch<any>(url, {
      method,
      body
    }) as { historial: HistorialSalud[] }

    emit('updated', response.historial)
    isModalOpen.value = false

    toast.add({
      title: currentRecordId.value ? 'Registro actualizado' : 'Registro creado',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || error.message,
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
    await $fetch(`/api/health/specific/${id}`, {
      method: 'DELETE'
    })

    emit('updated')
    toast.add({
      title: 'Registro eliminado',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error al eliminar',
      description: error.data?.message || error.message,
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  }
}
</script>