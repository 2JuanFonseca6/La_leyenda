<template>
  <UModal title="Editar Usuario" description="Formulario para modificar un usuario existente.">
    <UButton icon="i-heroicons-pencil-square" @click="openModal"
      class="bg-[var(--color-custom-500)] dark:bg-[var(--color-custom-50)] text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)] hover:text-[var(--color-custom-50)] hover:dark:text-[var(--color-custom-500)] rounded-full"
      :disabled="!user" title="Editar usuario"/>

    <template #body>
      <UForm :state="form" class="space-y-4" @submit="handleSubmit">
        <div class="flex space-x-4">
          <UFormField name="nombre" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Nombre</span>
            </template>
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField name="email" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Email</span>
            </template>
            <UInput type="email" v-model="form.email" />
          </UFormField>
        </div>

        <UFormField name="rol" required>
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Rol</span>
          </template>
          <USelect v-model="form.role" :items="roles" />
        </UFormField>

        <div class="flex justify-end gap-3 mt-4">
          <UButton type="submit" :loading="isSubmitting">
            Guardar Cambios
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const emit = defineEmits(['saved', 'close'])
const props = defineProps({
  user: {
    type: Object as () => Profile,
    default: null
  }
})

const isSubmitting = ref(false)
const roles = ref(['admin', 'user'])
const isOpen = ref(false)

const form = reactive({
  id: '',
  name: '',
  email: '',
  role: 'user'
})

watch(() => props.user, (newUser) => {
  if (newUser) {
    Object.assign(form, {
      id: newUser.id,
      name: newUser.name || '',
      email: newUser.email,
      role: newUser.role
    })
  }
}, { immediate: true })

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  emit('close')
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await $fetch('/api/profiles/profile', {
      method: 'PUT',
      body: form
    })

    useToast().add({
      title: 'Perfil actualizado!',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
    emit('saved')
    closeModal()
  } catch (error) {
    const err = error as { data?: { message?: string } }
    useToast().add({
      title: 'Error',
      description: err.data?.message || 'Error al actualizar el perfil',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
    console.error('Error updating user:', error)
  } finally {
    isSubmitting.value = false
  }
}

defineExpose({
  openModal() {
    if (props.user) {
      Object.assign(form, {
        id: props.user.id,
        name: props.user.name,
        email: props.user.email,
        role: props.user.role
      })
    }
    isOpen.value = true
  }
})
</script>