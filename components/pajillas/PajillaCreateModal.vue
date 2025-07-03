<template>
  <UModal
    v-model:open="isOpen"
    title="Registrar Pajilla"
    description="Completa los datos para registrar una nueva pajilla"
    class="max-w-3xl w-full"
  >
    <template #body>
      <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Código de Pajilla -->
        <UFormField name="pajilla">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Código de Pajilla
            </span>
          </template>
          <UInput v-model="formState.pajilla" placeholder="Ej: BRA-001-2024" />
        </UFormField>

        <!-- Stock Inicial -->
        <UFormField name="stock_inicial">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Stock Inicial
            </span>
          </template>
          <UInput v-model.number="formState.stock_inicial" type="number" min="0" />
        </UFormField>

        <!-- Fecha de Ingreso -->
        <UFormField name="fecha_ingreso">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Fecha de Ingreso
            </span>
          </template>
          <UInput v-model="formState.fecha_ingreso" type="date" />
        </UFormField>

        <!-- Descripción/Observaciones -->
        <UFormField name="descripcion">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Descripción / Observaciones
            </span>
          </template>
          <UTextarea v-model="formState.descripcion" placeholder="Observaciones, detalles, etc." />
        </UFormField>

        <!-- Botones -->
        <div class="col-span-2 flex justify-end gap-4 mt-4">
          <UButton type="button" variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" color="primary">Guardar Pajilla</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { useUserRole } from '~/composables/arestricted';

const isOpen = ref(false);
const emit = defineEmits(['close', 'created']);

const { canCreate } = useUserRole();

const schema = z.object({
  pajilla: z.string().min(1, 'El código es requerido'),
  stock_inicial: z.number().min(0, 'Debe ser mayor o igual a 0'),
  fecha_ingreso: z.string(),
  descripcion: z.string().optional(),
});

type FormState = {
  pajilla: string;
  stock_inicial: number;
  fecha_ingreso: string;
  descripcion?: string;
};

const formState = reactive<FormState>({
  pajilla: '',
  stock_inicial: 0,
  fecha_ingreso: new Date().toISOString().split('T')[0],
  descripcion: '',
});

const handleSubmit = async () => {
  try {
    await $fetch('/api/pajillas', {
      method: 'POST',
      body: {
        pajilla: formState.pajilla,
        cantidad_total: formState.stock_inicial,
        fecha_ingreso: formState.fecha_ingreso,
        descripcion: formState.descripcion
      }
    })
    emit('created');
    closeModal();
    useToast().add({
      title: 'Pajilla creada',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    });
  } catch (error) {
    console.error('Error creating pajilla:', error)
    useToast().add({
      title: 'Error',
      description: typeof error === 'object' && error !== null && 'message' in error
        ? String((error as any).message)
        : 'Ocurrió un error inesperado',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    });
  }
};

const openModal = () => {
  if (!canCreate.value) {
    useToast().add({
      title: 'Acceso denegado',
      description: 'No tienes permisos para crear pajillas',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    });
    return;
  }
  isOpen.value = true;
};

const closeModal = () => {
  isOpen.value = false;
  resetForm();
  emit('close');
};

const resetForm = () => {
  Object.assign(formState, {
    pajilla: '',
    stock_inicial: 0,
    fecha_ingreso: new Date().toISOString().split('T')[0],
    descripcion: '',
  });
};

defineExpose({ openModal });
</script>
