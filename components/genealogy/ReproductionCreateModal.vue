<template>
  <UModal v-model:open="isOpen" title="Nuevo Registro de Reproducción"
    description="Registra un nuevo evento reproductivo">
    <UButton icon="i-heroicons-plus-16-solid" @click="openModal"
      class="bg-[var(--color-custom-500)] dark:bg-[var(--color-custom-50)] text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)] hover:text-[var(--color-custom-50)] hover:dark:text-[var(--color-custom-500)] rounded-full"
      title="Agregar reproducción" />

    <template #body>
      <UForm :schema="schema" :state="form" class="space-y-6" @submit="handleSubmit">
        <!-- Fecha -->
        <UFormField name="fecha_evento" required>
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Fecha del Evento
            </span>
          </template>
          <UInput v-model="form.fecha_evento" type="date" />
        </UFormField>

        <!-- IDs Madre / Padre -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField name="madre_id" required>
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Madre
              </span>
            </template>
            <div @click="isMadreDrawerOpen = true"
              class="border rounded p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <p v-if="form.madre_id">{{ form.madre_id }}</p>
              <p v-else class="text-gray-400 italic">Seleccionar madre</p>
            </div>
            <DrawerAnimals v-model:modelValue="isMadreDrawerOpen" @select="form.madre_id = $event.id_animal" />
          </UFormField>

          <UFormField name="padre_id">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Padre
              </span>
            </template>
            <div @click="isPadreDrawerOpen = true"
              class="border rounded p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <p v-if="form.padre_id">{{ form.padre_id }}</p>
              <p v-else class="text-gray-400 italic">Seleccionar padre (opcional)</p>
            </div>
            <DrawerAnimals v-model:modelValue="isPadreDrawerOpen" @select="form.padre_id = $event.id_animal" />
          </UFormField>
        </div>

        <!-- Raza -->
        <UFormField name="raza" required>
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Raza
            </span>
          </template>
          <UInput v-model="form.raza" />
        </UFormField>

        <!-- Tipo de concepción -->
        <UFormField name="tipo_concepcion" required>
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Tipo de Concepción
            </span>
          </template>
          <USelect v-model="form.tipo_concepcion" :items="tiposConcepcion" placeholder="Selecciona un tipo" />
        </UFormField>

        <!-- Botones -->
        <div class="flex justify-end gap-3 mt-6">
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
import type { Database } from "~/types/supabase";
import DrawerAnimals from "~/components/genealogy/DrawerAnimals.vue";

const emit = defineEmits(["saved", "close"]);
const isOpen = ref(false);
const isSubmitting = ref(false);

// Flags independientes para cada drawer
const isMadreDrawerOpen = ref(false);
const isPadreDrawerOpen = ref(false);

const tiposConcepcion = ref(["NATURAL", "INSEMINACION"]);

const schema = z.object({
  fecha_evento: z.string().min(1, "La fecha es requerida"),
  madre_id: z.string().min(1, "ID Madre es requerido"),
  padre_id: z.string().optional(),
  raza: z.string().min(1, "La raza es requerida"),
  tipo_concepcion: z.enum(["NATURAL", "INSEMINACION"]),
});

const form = reactive({
  fecha_evento: "",
  madre_id: "",
  padre_id: "",
  raza: "",
  tipo_concepcion: "NATURAL" as Database["public"]["Enums"]["tipo_concepcion"],
});

const openModal = () => {
  isOpen.value = true;
  Object.assign(form, {
    fecha_evento: "",
    madre_id: "",
    padre_id: "",
    raza: "",
    tipo_concepcion: "NATURAL",
  });
};

const closeModal = () => {
  isOpen.value = false;
  emit("close");
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    await $fetch("/api/reproduction/reproductions", {
      method: "POST",
      body: {
        ...form,
        fecha_evento: new Date(form.fecha_evento).toISOString(),
      },
    });
    useToast().add({ title: "Registro creado!", color: "success", icon: "i-heroicons-check-circle", });
    emit("saved");
    closeModal();
  } catch (error: any) {
    useToast().add({
      title: "Error",
      description: error.data?.message || "Error al crear el registro",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

defineExpose({ openModal });
</script>
