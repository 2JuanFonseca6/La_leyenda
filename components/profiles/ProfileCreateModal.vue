<template>
  <UModal v-model:open="isOpen" title="Agregar Usuario" description="Formulario para registrar un nuevo usuario.">
    <UButton icon="i-heroicons-plus-16-solid" @click="openModal"
      class="bg-[var(--color-custom-500)] dark:bg-[var(--color-custom-50)] text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)] hover:text-[var(--color-custom-50)] hover:dark:text-[var(--color-custom-500)] rounded-full"
      title="Agregar usuario" />

    <template #body>
      <UForm :schema="schema" :state="form" class="space-y-4" @submit="handleSubmit">
        <div class="flex space-x-4">
          <UFormField name="name" required>
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

        <UFormField name="role" required>
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Rol</span>
          </template>
          <USelect v-model="form.role" :items="roles" />
        </UFormField>

        <div>
          <UFormField name="password">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Password</span>
            </template>
            <UInput v-model="form.password" placeholder="Contraseña" :color="color" :type="show ? 'text' : 'password'"
              :ui="{ trailing: 'pe-1' }" :aria-invalid="score < 4" aria-describedby="password-strength" class="w-full">
              <template #trailing>
                <UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="show"
                  aria-controls="password" @click="show = !show" />
              </template>
            </UInput>
          </UFormField>

          <UProgress :color="color" :indicator="text" :model-value="score" :max="4" size="sm" />

          <p id="password-strength" class="text-sm font-medium mb-4">
            {{ text }}. Debe contener:
          </p>

          <ul class="space-y-1" aria-label="Password requirements">
            <li v-for="(req, index) in strength" :key="index" class="flex items-center gap-0.5"
              :class="req.met ? 'text-success' : 'text-muted'">
              <UIcon :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'" class="size-4 shrink-0" />

              <span class="text-xs font-light">
                {{ req.text }}
                <span class="sr-only">
                  {{ req.met ? ' - Requirement met' : ' - Requirement not met' }}
                </span>
              </span>
            </li>
          </ul>
        </div>

        <div class="flex justify-end gap-3 mt-4">
          <UButton type="button" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="isSubmitting">
            Crear Registro
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'user']),
  password: z.string().optional()
})

const emit = defineEmits(['saved', 'close'])

const show = ref(false)
const isSubmitting = ref(false)
const roles = ref(['admin', 'user'])
const isOpen = ref(false)

const form = reactive({
  name: '',
  email: '',
  role: 'user' as 'admin' | 'user',
  password: ''
})

// Resto del código se mantiene igual...
const openModal = () => {
  isOpen.value = true
  resetForm()
}

const closeModal = () => {
  isOpen.value = false
  resetForm()
  emit('close')
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    email: '',
    role: 'user',
    password: ''
  })
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await $fetch('/api/profiles/profile', {
      method: 'POST',
      body: form
    })

    useToast().add({
      title: 'Perfil creado!',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })

    emit('saved')
    closeModal()
  } catch (error) {
    const err = error as { data?: { message?: string } }
    useToast().add({
      title: 'Error',
      description: err.data?.message || 'Error al crear el perfil',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
    console.error('Error creating user:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Actualizar referencias de password a form.password
const checkStrength = (str: string) => {
  const requirements = [
    { regex: /.{8,}/, text: 'Al menos 8 characters' },
    { regex: /\d/, text: 'Al menos 1 numero' },
    { regex: /[a-z]/, text: 'Al menos 1 letra minuscula' },
    { regex: /[A-Z]/, text: 'Al menos 1 letra mayuscula' }
  ]
  return requirements.map(req => ({ met: req.regex.test(str), text: req.text }))
}

const strength = computed(() => checkStrength(form.password))
const score = computed(() => strength.value.filter(req => req.met).length)
const color = computed(() => {
  if (score.value === 0) return 'neutral'
  if (score.value <= 1) return 'error'
  if (score.value <= 2) return 'warning'
  if (score.value === 3) return 'warning'
  return 'success'
})
const text = computed(() => {
  if (score.value === 0) return 'Ingrese una contraseña'
  if (score.value <= 2) return 'Contraseña debil'
  if (score.value === 3) return 'Contraseña media'
  return 'Contraseña fuerte'
})

defineExpose({
  openModal() {
    resetForm()
    isOpen.value = true
  }
})
</script>