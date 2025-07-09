<script setup lang="ts">
const props = defineProps<{
  item: {
    id_proveedor: number
    nombre_empresa: string
    telefono: string
    correo_empresa: string | null
    direccion: string | null
  }
}>()

const emit = defineEmits(['updated'])
const toast = useToast()
const isEditing = ref(false)
const isLoading = ref(false)
const error = ref('')

import { useUserRole } from '~/composables/arestricted'
const { userRole } = useUserRole()

type FormState = {
  id_proveedor: number
  original_id: number
  nombre_empresa: string
  telefono: string
  correo_empresa: string | null
  direccion: string | null
}

const formState = reactive<FormState>({
  id_proveedor: props.item.id_proveedor,
  original_id: props.item.id_proveedor,
  nombre_empresa: props.item.nombre_empresa,
  telefono: props.item.telefono,
  correo_empresa: props.item.correo_empresa,
  direccion: props.item.direccion
})

const handleUpdate = async () => {
  error.value = ''
  isLoading.value = true

  try {
    // Validar campos requeridos
    if (!formState.id_proveedor || !formState.nombre_empresa || !formState.telefono) {
      error.value = 'Todos los campos marcados son obligatorios'
      isLoading.value = false
      return
    }

    // Enviar actualización
    await $fetch('/api/providers/providers', {
      method: 'PUT',
      body: formState
    })

    toast.add({
      title: 'Actualización exitosa',
      description: 'El proveedor se actualizó correctamente',
      icon: 'i-heroicons-check-badge',
      color: 'success'
    })

    emit('updated')
    isEditing.value = false
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Error al actualizar el proveedor'
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('¿Seguro que deseas eliminar este proveedor? Esta acción no se puede deshacer.')) return
  isLoading.value = true
  try {
    const res = await $fetch('/api/providers/providers', { method: 'DELETE', body: { ids: [props.item.id_proveedor] } })
    toast.add({
      title: 'Proveedor eliminado',
      description: res?.message || 'El proveedor fue eliminado correctamente.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
    emit('updated')
  } catch (e: any) {
    toast.add({
      title: 'Error al eliminar proveedor',
      description: e.data?.message || e.message || 'No se pudo eliminar el proveedor. Intenta de nuevo.',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Detalles del Proveedor</h3>
        <div class="flex gap-2">
          <UButton v-if="userRole === 'admin'" icon="i-heroicons-trash" color="error" @click="handleDelete" :loading="isLoading" title="Eliminar proveedor" />
          <UButton 
            v-if="!isEditing" 
            icon="i-heroicons-pencil-square" 
            color="primary" 
            @click="isEditing = true" 
          />
          <template v-else>
            <UButton 
              icon="i-heroicons-x-mark" 
              color="error" 
              @click="isEditing = false" 
            />
            <UButton 
              icon="i-heroicons-check" 
              color="success" 
              :loading="isLoading" 
              @click="handleUpdate" 
            />
          </template>
        </div>
      </div>
    </template>

    <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Campo ID Proveedor -->
      <UFormField label="ID Proveedor" required>
        <template v-if="isEditing">
          <UInput 
            v-model.number="formState.id_proveedor" 
            type="number" 
          />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.id_proveedor }}</p>
        </template>
      </UFormField>

      <!-- Campo Nombre Empresa -->
      <UFormField label="Nombre de Empresa" required>
        <template v-if="isEditing">
          <UInput v-model="formState.nombre_empresa" />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.nombre_empresa }}</p>
        </template>
      </UFormField>

      <!-- Campo Teléfono -->
      <UFormField label="Teléfono" required>
        <template v-if="isEditing">
          <UInput v-model="formState.telefono" />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.telefono }}</p>
        </template>
      </UFormField>

      <!-- Campo Correo -->
      <UFormField label="Correo Electrónico">
        <template v-if="isEditing">
          <UInput 
            v-model="formState.correo_empresa" 
            type="email" 
          />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.correo_empresa || 'No especificado' }}</p>
        </template>
      </UFormField>

      <!-- Campo Dirección -->
      <UFormField label="Dirección">
        <template v-if="isEditing">
          <UTextarea v-model="formState.direccion" />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.direccion || 'No especificada' }}</p>
        </template>
      </UFormField>
    </div>
  </UCard>
</template>