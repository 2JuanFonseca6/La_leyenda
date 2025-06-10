<template>
    <UModal v-model:open="isOpen" title="Nuevo Proveedor"
      description="Agrega un nuevo proveedor al sistema">
      <UButton icon="i-heroicons-plus-16-solid" @click="openModal"
        class="bg-[var(--color-custom-500)] dark:bg-[var(--color-custom-50)] text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)] hover:text-[var(--color-custom-50)] hover:dark:text-[var(--color-custom-500)] rounded-full"
        title="Agregar proveedor" />
  
      <template #body>
        <UForm :schema="schema" :state="form" class="space-y-4" @submit="handleSubmit">
          <UFormField name="id_proveedor" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">ID Proveedor</span>
            </template>
            <UInput v-model="form.id_proveedor" type="number" />
          </UFormField>
  
          <UFormField name="nombre_empresa" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Empresa</span>
            </template>
            <UInput v-model="form.nombre_empresa" type="text" />
          </UFormField>
  
          <div class="flex gap-4">
            <UFormField name="telefono" required>
              <template #label>
                <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Teléfono</span>
              </template>
              <UInput v-model="form.telefono" type="tel" />
            </UFormField>
  
            <UFormField name="correo_empresa">
              <template #label>
                <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Email</span>
              </template>
              <UInput v-model="form.correo_empresa" type="email" />
            </UFormField>
          </div>
  
          <UFormField name="direccion">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Dirección</span>
            </template>
            <UInput v-model="form.direccion" type="text" />
          </UFormField>
  
          <div class="flex justify-end gap-3 mt-4">
            <UButton type="button" @click="closeModal">Cancelar</UButton>
            <UButton type="submit" :loading="isSubmitting">
              Crear Proveedor
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from "vue";
  import { z } from "zod";
  
  const emit = defineEmits(["saved", "close"]);
  const isOpen = ref(false);
  const isSubmitting = ref(false);
  
  const schema = z.object({
    id_proveedor: z.number().min(1, "El ID del proveedor es requerido"),
    nombre_empresa: z.string().min(1, "El nombre de la empresa es requerido"),
    telefono: z.string().min(1, "El teléfono es requerido"),
    correo_empresa: z.string().email("Debe ser un email válido").optional().or(z.literal("")),
    direccion: z.string().optional().or(z.literal(""))
  });
  
  const form = reactive({
    id_proveedor: 0,
    nombre_empresa: "",
    telefono: "",
    correo_empresa: "",
    direccion: ""
  });
  
  const openModal = () => {
    isOpen.value = true;
    Object.assign(form, {
      id_proveedor: 0,
      nombre_empresa: "",
      telefono: "",
      correo_empresa: "",
      direccion: ""
    });
  };
  
  const closeModal = () => {
    isOpen.value = false;
    emit("close");
  };
  
  const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
      await $fetch("/api/providers/providers", {
        method: "POST",
        body: {
          id_proveedor: form.id_proveedor,
          nombre_empresa: form.nombre_empresa,
          telefono: form.telefono,
          correo_empresa: form.correo_empresa || "",
          direccion: form.direccion || ""
        }
      });
      useToast().add({ title: "Proveedor agregado!", color: "success", icon: "i-heroicons-check-circle" });
      emit("saved");
      closeModal();
    } catch (error: any) {
      useToast().add({
        title: "Error al agregar proveedor",
        description: error.message,
        color: "error"
      });
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>