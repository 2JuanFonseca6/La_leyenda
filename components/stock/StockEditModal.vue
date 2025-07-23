<template>
  <UModal v-model:open="isOpen" title="Editar Inventario" description="Modifica los datos del inventario seleccionado" class="max-w-3xl w-full">
    <template #body>
      <UForm :state="form" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="handleSubmit">
        <UFormField name="id_inventario">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">ID</span></template>
          <UInput v-model="form.id_inventario" readonly />
        </UFormField>
        <UFormField name="tipo">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Tipo</span></template>
          <USelect v-model="form.tipo" :items="tiposArticulos.map(t => ({ label: t, value: t }))" />
        </UFormField>
        <UFormField name="descripcion">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Descripción</span></template>
          <UInput v-model="form.descripcion" />
        </UFormField>
        <UFormField name="cantidad">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Cantidad</span></template>
          <UInput v-model.number="form.cantidad" type="number" min="0" />
        </UFormField>
        <UFormField name="precio">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Precio</span></template>
          <UInput v-model.number="form.precio" type="number" min="0" />
        </UFormField>
        <UFormField name="proveedor_id">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Proveedor</span></template>
          <UInput v-model="form.proveedor_id" />
        </UFormField>
        <UFormField name="fecha">
          <template #label><span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Fecha</span></template>
          <UInput v-model="form.fecha" type="date" />
        </UFormField>
        <div class="col-span-2 flex justify-end gap-4 mt-4">
          <UButton type="button" variant="ghost" @click="close">Cancelar</UButton>
          <UButton type="submit" color="primary" :loading="isLoading">Guardar</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { useToast } from '#imports'

const props = defineProps<{
  item: any
  open: boolean
}>()
const emit = defineEmits(['updated', 'close'])

const isOpen = ref(props.open)
watch(() => props.open, v => isOpen.value = v)
watch(isOpen, v => { if (!v) emit('close') })

const isLoading = ref(false)
const tiposArticulos = ['SALUD', 'ALIMENTOS', 'ELEMENTOS']
const form = reactive({
  id_inventario: '',
  tipo: '',
  descripcion: '',
  cantidad: 0,
  precio: 0,
  proveedor_id: '',
  fecha: ''
})

watch(() => props.item, item => {
  if (item) {
    form.id_inventario = item.id_inventario?.toString() || ''
    form.tipo = item.tipo || ''
    form.descripcion = item.descripcion || ''
    form.cantidad = item.cantidad || 0
    form.precio = item.precio || 0
    form.proveedor_id = item.proveedor_id || ''
    form.fecha = item.fecha ? item.fecha.split('T')[0] : ''
  }
}, { immediate: true })

function close() {
  isOpen.value = false
}

async function handleSubmit() {
  isLoading.value = true
  const toast = useToast()
  try {
    await $fetch(`/api/stock/specific/${form.id_inventario}`, {
      method: 'PUT',
      body: {
        tipo: form.tipo,
        descripcion: form.descripcion,
        cantidad: form.cantidad,
        precio: form.precio,
        proveedor_id: form.proveedor_id,
        fecha: form.fecha
      }
    })
    toast.add({ title: 'Inventario actualizado', color: 'success' })
    emit('updated')
    close()
  } catch (error) {
    toast.add({ title: 'Error al actualizar inventario', color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script> 