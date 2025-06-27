<template>
  <UModal
    v-model:open="isOpen"
    title="Agregar Nueva Pajilla"
    description="Completa la información de la pajilla"
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

        <!-- Stock -->
        <UFormField name="stock">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Cantidad en Stock
            </span>
          </template>
          <UInput v-model.number="formState.stock" type="number" min="0" />
        </UFormField>

        <!-- Fecha de uso -->
        <UFormField name="fecha_uso">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Fecha de uso
            </span>
          </template>
          <UInput v-model="formState.fecha_uso" type="date" />
        </UFormField>

        <!-- Descripción -->
        <UFormField name="descripcion">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Descripción
            </span>
          </template>
          <UTextarea v-model="formState.descripcion" placeholder="Observaciones, detalles del uso, etc." />
        </UFormField>

        <!-- Selección de Animal -->
        <UFormField name="animal_id">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Animal Asociado
            </span>
          </template>
          <div class="flex items-center gap-2">
            <p v-if="formState.animal_id">{{ formState.animal_id }}</p>
            <p v-else class="text-gray-500 italic">Sin animal seleccionado</p>
            <SelectVacaDrawer v-model:modelValue="isDrawerOpen" @select="formState.animal_id = $event.id_animal" />
          </div>
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
import type { TablesInsert } from '~/types/supabase';
import type { Database } from '~/types/supabase';

const isOpen = ref(false);
const isDrawerOpen = ref(false);
const supabase = useSupabaseClient<Database>();
const emit = defineEmits(['close', 'created']);

const schema = z.object({
  pajilla: z.string().min(1, 'El código es requerido'),
  stock: z.number().min(0, 'Debe ser mayor o igual a 0'),
  fecha_uso: z.string(),
  animal_id: z.string().nullable().optional(),
  descripcion: z.string().optional(),
});

type FormState = {
  pajilla: string;
  stock: number;
  fecha_uso?: string;
  animal_id: string | null;
  descripcion?: string;
};

const formState = reactive<FormState>({
  pajilla: '',
  stock: 0,
  fecha_uso: new Date().toISOString().split('T')[0],
  animal_id: null,
  descripcion: '',
});

const handleSubmit = async () => {
  try {
    await $fetch('/api/pajillas', {
      method: 'POST',
      body: {
        pajilla: formState.pajilla,
        cantidad_total: formState.stock,
        fecha_uso: formState.fecha_uso,
        animal_id: formState.animal_id,
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
    stock: 0,
    fecha_uso: new Date().toISOString().split('T')[0],
    animal_id: null,
    descripcion: '',
  });
};

defineExpose({ openModal });
</script>
