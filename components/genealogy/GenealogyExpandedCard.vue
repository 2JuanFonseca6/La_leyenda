<script setup lang="ts">
import { useUserRole } from '~/composables/arestricted'
import type { Database } from '~/types/supabase'

const { canEdit, canDelete } = useUserRole()

type Reproduction = {
  id_reproduccion: number
  fecha_evento: string
  madre_id: string
  padre_id: string | null
  raza: string
  tipo_concepcion: Database['public']['Enums']['tipo_concepcion'] | null
}

const props = defineProps<{
  reproduction: Reproduction
}>()

const emit = defineEmits(['updated', 'close'])
const toast = useToast()
const isLoading = ref(false)
const editModal = ref<{ openModal: () => void } | null>(null)

const handleDelete = async () => {
  if (!confirm('¿Estás seguro de que quieres eliminar este registro de reproducción?')) return

  isLoading.value = true
  try {
    await $fetch(`/api/reproduction/specific/${props.reproduction.id_reproduccion}`, { 
      method: 'DELETE' 
    })

    toast.add({
      title: 'Eliminación exitosa',
      description: 'El registro de reproducción se eliminó correctamente',
      icon: 'i-heroicons-check-badge',
      color: 'success'
    })

    emit('updated')
    emit('close')
  } catch (error: any) {
    toast.add({
      title: 'Error de eliminación',
      description: error.data?.message || 'Error al eliminar el registro',
      icon: 'i-heroicons-x-circle',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const handleEditSaved = () => {
  emit('updated')
  emit('close')
}
</script>

<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Detalles de Reproducción #{{ reproduction.id_reproduccion }}</h3>
        <div class="flex gap-2">
          <UButton 
            v-if="canEdit"
            icon="i-heroicons-pencil-square" 
            color="primary" 
            @click="editModal?.openModal?.()" 
          />
          <UButton 
            v-if="canDelete"
            icon="i-heroicons-trash" 
            color="error" 
            @click="handleDelete"
            :loading="isLoading"
          />
        </div>
      </div>
    </template>

    <!-- Detalles de la reproducción -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Fecha del Evento -->
      <UFormField label="Fecha del Evento">
        <p class="py-2 px-3">{{ new Date(reproduction.fecha_evento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</p>
      </UFormField>

      <!-- ID Madre -->
      <UFormField label="ID Madre">
        <p class="py-2 px-3">{{ reproduction.madre_id }}</p>
      </UFormField>

      <!-- ID Padre -->
      <UFormField label="ID Padre">
        <p class="py-2 px-3">{{ reproduction.padre_id || 'No especificado' }}</p>
      </UFormField>

      <!-- Raza -->
      <UFormField label="Raza">
        <p class="py-2 px-3 font-medium">{{ reproduction.raza }}</p>
      </UFormField>

      <!-- Tipo de Concepción -->
      <UFormField label="Tipo de Concepción">
        <span
          :class="[
            'inline-block rounded px-4 py-1 font-semibold text-base',
            reproduction.tipo_concepcion === 'NATURAL'
              ? 'bg-green-600 text-white'
              : 'bg-blue-700 text-white'
          ]"
        >
          {{ reproduction.tipo_concepcion?.toUpperCase() || 'N/A' }}
        </span>
      </UFormField>
    </div>

    <!-- Modal de edición -->
    <EditReproduction 
      v-if="canEdit"
      ref="editModal" 
      :reproduction="reproduction" 
      @saved="handleEditSaved" 
    />
  </UCard>
</template> 