<template>
  <slot :open="openModal" />

  <UModal v-model:open="isOpen" title="Agregar Información de Venta" description="Formulario para registrar una venta.">
    <template #body>
      <UForm :state="form" @submit="handleSubmit" class="space-y-4">
        <div class="flex space-x-4">
          <UFormField name="fecha_venta" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Fecha de
                Venta</span>
            </template>
            <UInput type="date" v-model="form.fecha_venta" />
          </UFormField>

          <UFormField name="monto" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Monto</span>
            </template>
            <UInputNumber :step="100" v-model="form.monto" :format-options="{ useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 2 }" placeholder="Ingrese el monto" />
          </UFormField>
        </div>

        <UFormField name="notas">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Notas</span>
          </template>
          <UTextarea v-model="form.notas" :maxlength="2000" class="w-full"/>
        </UFormField>

        <div class="flex justify-end gap-3 mt-4">
          <UButton type="button" @click="isOpen = false">Cancelar</UButton>
          <UButton type="submit" :loading="isSubmitting" @click="handleSubmit">Guardar</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { UInputNumber } from '#components';

const props = defineProps<{ animalId: string }>()

console.log('🎯 SaleModal recibe animalId =', props.animalId)


const isOpen = ref(false)
const isSubmitting = ref(false)
const form = reactive({
  animal_id: props.animalId,
  fecha_venta: '',
  monto: null as number | null,
  notas: ''
})

const openModal = () => {
  isOpen.value = true
  resetForm()
}

const resetForm = () => {
  form.fecha_venta = ''
  form.monto = null
  form.notas = ''
}

const emit = defineEmits<{
  (e: 'created', venta: any): void
}>()

// SaleModal.vue – handleSubmit
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const { venta } = await $fetch<{ venta: any }>('/api/sales/specific/:id', {
      method: 'POST',
      body: {
        ...form,
        animal_id: props.animalId
      }
    })

    isOpen.value = false
    useToast().add({
      title: 'Venta registrada!',
      icon: "i-heroicons-check-circle",
      color: 'success'
    })

    emit('created', venta)
  } catch (error: any) {
    useToast().add({
      title: 'Error',
      description: error.data?.message || error.message,
      color: 'error',
      icon: "i-heroicons-exclamation-circle",
    })
  } finally {
    isSubmitting.value = false
  }
}

</script>