<template>
  <UModal v-model:open="isOpen" title="Editar Pajilla" description="Modifica los datos de la pajilla seleccionada" class="max-w-lg p-0">
    <template #body>
      <UForm :state="form" class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6" @submit.prevent="handleSubmit">
        <UFormField name="id">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">ID</span></template>
          <UInput v-model="form.id" readonly />
        </UFormField>
        <UFormField name="pajilla">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Código</span></template>
          <UInput v-model="form.pajilla" />
        </UFormField>
        <UFormField name="fecha_ingreso">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Fecha de Ingreso</span></template>
          <UInput v-model="form.fecha_ingreso" type="date" />
        </UFormField>
        <UFormField name="stock_inicial">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Stock Inicial</span></template>
          <UInput v-model.number="form.stock_inicial" type="number" min="0" />
        </UFormField>
        <UFormField name="inventario_final">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Stock Final</span></template>
          <UInput :model-value="form.inventario_final" readonly />
        </UFormField>
        <UFormField name="descripcion" class="sm:col-span-2">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Descripción / Observaciones</span></template>
          <UTextarea v-model="form.descripcion" />
        </UFormField>
        <div class="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 w-full">
          <UButton type="button" variant="ghost" @click="close" class="w-full sm:w-auto">Cancelar</UButton>
          <UButton type="submit" color="primary" :loading="isLoading" class="w-full sm:w-auto">Guardar</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import type { InventarioPajilla } from '~/types/pajillas'
import { useToast } from '#imports'

const props = defineProps<{
  pajilla: (InventarioPajilla & { salida_hoy?: number }) | null
  open: boolean
}>()
const emit = defineEmits(['updated', 'close'])

const isOpen = ref(props.open)
watch(() => props.open, v => isOpen.value = v)
watch(isOpen, v => { if (!v) emit('close') })

const isLoading = ref(false)
const form = reactive({
  id: '',
  pajilla: '',
  fecha_ingreso: '',
  stock_inicial: 0,
  salida_hoy: 0,
  inventario_final: 0,
  descripcion: ''
})

watch(() => props.pajilla, pajilla => {
  if (pajilla) {
    form.id = pajilla.id?.toString() || ''
    form.pajilla = pajilla.pajilla || ''
    form.fecha_ingreso = pajilla.fecha_ingreso?.split('T')[0] || ''
    form.stock_inicial = pajilla.stock_inicial || 0
    form.salida_hoy = pajilla.salida_hoy || 0
    form.inventario_final = pajilla.inventario_final || 0
    form.descripcion = pajilla.descripcion || ''
  }
}, { immediate: true })

function close() {
  isOpen.value = false
}

async function handleSubmit() {
  isLoading.value = true
  const toast = useToast()
  try {
    await $fetch(`/api/pajillas/${form.id}`, {
      method: 'PUT',
      body: {
        pajilla: form.pajilla,
        stock: form.stock_inicial,
        fecha_ingreso: form.fecha_ingreso,
        descripcion: form.descripcion
      }
    })
    toast.add({ title: 'Pajilla actualizada', color: 'success' })
    emit('updated')
    close()
  } catch (error) {
    toast.add({ title: 'Error al actualizar pajilla', color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script> 