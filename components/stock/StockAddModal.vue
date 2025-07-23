<template>
  <UModal v-model:open="isOpen" title="Nuevo Registro de Inventario"
    description="Agrega un nuevo artículo al inventario">
    <UButton icon="i-heroicons-plus-16-solid" @click="openModal"
      class="bg-[var(--color-custom-500)] dark:bg-[var(--color-custom-50)] text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)] hover:text-[var(--color-custom-50)] hover:dark:text-[var(--color-custom-500)] rounded-full"
      title="Agregar al inventario" />

    <template #body>
      <UForm :schema="schema" :state="form" class="space-y-4" @submit="handleSubmit">
        <UFormField name="tipo" required>
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Tipo de artículo</span>
          </template>
          <USelect v-model="form.tipo" :items="tiposArticulos.map(t => ({
            label: t === 'SALUD' ? 'Salud' : t === 'ALIMENTOS' ? 'Alimentos' : 'Elementos',
            value: t,
          }))" placeholder="Selecciona un tipo" variant="ghost" class="border border-[var(--color-custom-300)] cursor-pointer" />
        </UFormField>

        <UFormField name="descripcion" required>
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Descripción</span>
          </template>
          <UInput v-model="form.descripcion" type="text" />
        </UFormField>

        <UFormField name="fecha" required>
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Fecha</span>
          </template>
          <UInput v-model="form.fecha" type="date" />
        </UFormField>

        <div class="flex gap-4">
          <UFormField name="cantidad" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Cantidad</span>
            </template>
            <UInputNumber v-model="form.cantidad" type="number" :step="1" :min="1" variant="ghost" class="border border-[var(--color-custom-300)]" />
          </UFormField>

          <UFormField name="precio" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Valor Total</span>
            </template>
            <UInputNumber v-model="form.precio" :min="1000" :step="100"
                :format-options="{ useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 2 }"
                placeholder="Ingrese el valor total del lote" variant="ghost" class="border border-[var(--color-custom-300)]" />
          </UFormField>
        </div>

        <UFormField name="proveedor_id" required>
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Proveedor</span>
          </template>
          <div class="flex items-center gap-2">
            <p>{{ form.proveedor_id }}</p>
            <p v-if="!form.proveedor_id">Sin proveedor seleccionado</p>
            <DrawerProviders v-model:modelValue="isProveedorDrawerOpen"
              @select="form.proveedor_id = $event.id_proveedor" />
          </div>
        </UFormField>


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
import { ref, reactive } from "vue";
import { z } from "zod";

const emit = defineEmits(["saved", "close"]);
const isOpen = ref(false);
const isSubmitting = ref(false);
const isProveedorDrawerOpen = ref(false);

// Tipos predefinidos para inventario (ajusta según tus necesidades)
const tiposArticulos = ref(["SALUD", "ALIMENTOS", "ELEMENTOS"]);

const schema = z.object({
  tipo: z.enum(["SALUD", "ALIMENTOS", "ELEMENTOS"], {
    errorMap: (issue, ctx) => {
      switch (issue.code) {
        case z.ZodIssueCode.invalid_enum_value:
          return { message: "Debe seleccionar un tipo de artículo válido: SALUD, ALIMENTOS o ELEMENTOS." };
        case z.ZodIssueCode.invalid_type:
          return { message: "El tipo de artículo es obligatorio." };
        default:
          return { message: ctx.defaultError };
      }
    },
  }),
  descripcion: z.string().min(1, "La descripción es requerida"),
  cantidad: z
    .number({
      invalid_type_error: "La cantidad debe ser un número",
      required_error: "La cantidad es obligatoria",
    })
    .min(1, { message: "La cantidad debe ser al menos 1" }),
  precio: z
    .number({
      invalid_type_error: "El precio debe ser un número",
      required_error: "El precio es obligatorio",
    })
    .min(0.01, { message: "El precio debe ser mayor a 0" }),
  proveedor_id: z.string().min(1, "Debe seleccionar un proveedor"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
});

const form = reactive({
  tipo: "SALUD" as "SALUD" | "ALIMENTOS" | "ELEMENTOS",
  descripcion: "",
  cantidad: 0,
  precio: 0,
  proveedor_id: "",
  fecha: "",
});

const openModal = () => {
  isOpen.value = true;
  Object.assign(form, {
    tipo: "",
    descripcion: "",
    cantidad: 0,
    precio: 0,
    proveedor_id: "",
    fecha: "",
  });
};

const closeModal = () => {
  isOpen.value = false;
  emit("close");
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    await $fetch("/api/stock/items", {
      method: "POST",
      body: {
        ...form,
        cantidad: Number(form.cantidad),
        precio: Number(form.precio),
        fecha: form.fecha,
      },
    });
    useToast().add({ title: "Artículo agregado!", color: "success", icon: "i-heroicons-check-circle-20-solid" });
    emit("saved");
    closeModal();
  } catch (error: any) {
    useToast().add({
      title: "Error",
      description: error.data?.message || "Error al crear el registro",
      color: "error",
      icon: "i-heroicons-x-circle-20-solid",
    });
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

defineExpose({ openModal });
</script>