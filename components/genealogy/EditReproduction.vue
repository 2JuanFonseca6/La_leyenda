<template>
  <UModal
    v-model:open="isOpen"
    title="Editar Registro de Reproducción"
    description="Formulario para editar un evento reproductivo"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="form"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormField name="fecha_evento" required>
          <template #label>
            <span
              class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]"
              >Fecha del Eventos</span
            >
          </template>
          <UInput v-model="form.fecha_evento" type="date" />
        </UFormField>

        <div class="flex gap-4">
          <UFormField name="madre_id" required>
            <template #label>
              <span
                class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]"
                >ID Madre</span
              ></template
            >
            <DrawerAnimals
              v-model:modelValue="isMadreDrawerOpen"
              @select="form.madre_id = $event.id_animal"
            />
            <UInput v-model="form.madre_id" />
          </UFormField>

          <UFormField name="padre_id">
            <template #label
              ><span
                class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]"
                >ID Padre</span
              ></template
            >
            <DrawerAnimals
              v-model:modelValue="isPadreDrawerOpen"
              @select="form.padre_id = $event.id_animal"
            />
            <UInput v-model="form.padre_id" />
          </UFormField>
        </div>

        <UFormField name="raza" required>
          <template #label
            ><span
              class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]"
              >Raza</span
            ></template
          >
          <UInput v-model="form.raza" />
        </UFormField>

        <UFormField name="tipo_concepcion" required>
          <template #label
            ><span
              class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]"
              >Tipo de Concepción</span
            ></template
          >
          <USelect v-model="form.tipo_concepcion" :items="tiposConcepcion" />
        </UFormField>

        <div class="flex justify-end gap-3 mt-4">
          <UButton type="button" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="isSubmitting">
            Guardar Cambios
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Database } from "~/types/supabase";
import DrawerAnimals from "~/components/genealogy/DrawerAnimals.vue";
const isMadreDrawerOpen = ref(false);
const isPadreDrawerOpen = ref(false);
const props = defineProps<{
  reproduction: Database["public"]["Tables"]["reproduccion"]["Row"];
}>();

const emit = defineEmits(["saved", "close"]);

const schema = z.object({
  fecha_evento: z.string().min(1),
  madre_id: z.string().min(1),
  padre_id: z.string().optional(),
  raza: z.string().min(1),
  tipo_concepcion: z.enum(["NATURAL", "INSEMINACION"]),
});

const isOpen = ref(false);
const isSubmitting = ref(false);
const tiposConcepcion = ref(["NATURAL", "INSEMINACION"]);

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
    fecha_evento: props.reproduction.fecha_evento.split("T")[0],
    madre_id: props.reproduction.madre_id,
    padre_id: props.reproduction.padre_id || "",
    raza: props.reproduction.raza,
    tipo_concepcion: props.reproduction.tipo_concepcion || "NATURAL",
  });
};

const closeModal = () => {
  isOpen.value = false;
  emit("close");
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    await $fetch(
      `/api/reproduction/specific/${props.reproduction.id_reproduccion}`,
      {
        method: "PUT",
        body: {
          ...form,
          fecha_evento: new Date(form.fecha_evento).toISOString(),
        },
      }
    );

    useToast().add({
      title: "Registro actualizado!",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    emit("saved");
    closeModal();
  } catch (error: any) {
    useToast().add({
      title: "Error",
      description: error.data?.message || "Error al actualizar",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
    console.error("Error updating reproduction:", error);
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => props.reproduction,
  (newVal) => {
    if (newVal) {
      Object.assign(form, {
        fecha_evento: newVal.fecha_evento.split("T")[0],
        madre_id: newVal.madre_id,
        padre_id: newVal.padre_id || "",
        raza: newVal.raza,
        tipo_concepcion: newVal.tipo_concepcion || "NATURAL",
      });
    }
  },
  { immediate: true }
);

defineExpose({ openModal });
</script>
