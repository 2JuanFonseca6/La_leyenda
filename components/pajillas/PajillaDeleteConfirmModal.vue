<template>
  <UModal v-model:open="isOpen" title="Confirmar eliminación" description="¿Estás seguro de que deseas eliminar esta pajilla?" class="max-w-3xl w-full">
    <template #body>
      <div class="mb-4">¿Estás seguro de que deseas eliminar esta pajilla?</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div><b>ID:</b> {{ pajilla?.id }}</div>
        <div><b>Código:</b> {{ pajilla?.pajilla }}</div>
        <div><b>Fecha de Ingreso:</b> {{ pajilla?.fecha_ingreso ? new Date(pajilla.fecha_ingreso).toLocaleDateString() : '' }}</div>
        <div><b>Stock Inicial:</b> {{ pajilla?.stock_inicial }}</div>
        <div><b>Salida (hoy):</b> {{ pajilla?.salida_hoy }}</div>
        <div><b>Stock Final:</b> {{ pajilla?.inventario_final }}</div>
        <div class="col-span-2"><b>Descripción / Observaciones:</b> {{ pajilla?.descripcion || '—' }}</div>
      </div>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="close">Cancelar</UButton>
        <UButton color="error" @click="confirm" :loading="isLoading">Eliminar</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { InventarioPajilla } from '~/types/pajillas'

const props = defineProps<{
  pajilla: (InventarioPajilla & { salida_hoy?: number }) | null
  open: boolean
  loading?: boolean
}>()
const emit = defineEmits(['confirm', 'close'])

const isOpen = ref(props.open)
const isLoading = ref(props.loading ?? false)

watch(() => props.open, v => isOpen.value = v)
watch(isOpen, v => { if (!v) emit('close') })
watch(() => props.loading, v => isLoading.value = !!v)

function close() {
  isOpen.value = false
}
function confirm() {
  emit('confirm')
}
</script> 