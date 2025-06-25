<template>
  <UCard
       class="shadow-lg print:shadow-none print:w-full print:mt-[-55px]"
    :class="{ 'print:hidden': !show }"
  >
    <div v-if="animal.imagen_url" class="mt-4 flex items-center gap-4">
      <img
        :src="animal.imagen_url"
        alt="Imagen del animal"
        class="max-w-xs rounded"
      />
      <UButton
        v-if="userRole === 'admin'"
        icon="i-heroicons-trash"
        color="error"
        @click="deleteImage"
        :loading="isDeletingImage"
        class="print:hidden"
      />
    </div>
    <template #header>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl">
          Animal:
          <span class="font-bold font-mono">{{ animal.id_animal }}</span>
        </h1>
        <UButton
          v-if="!isEditing && userRole === 'admin'"
          icon="i-heroicons-pencil-square"
          @click="enableEditing"
          class="print:hidden bg-[var(--color-custom-50)] text-[var(--color-custom-500)] dark:bg-[var(--color-custom-500)] dark:text-[var(--color-custom-50)] hover:text-[var(--color-custom-50)] dark:hover:text-[var(--color-custom-500)] rounded-full p-2"
        />
      </div>
    </template>

    <!-- Modo Visualización -->
    <div v-if="!isEditing">
      <div class="grid md:grid-cols-2 gap-6 print:grid print:grid-cols-2">
        <!-- Columna Izquierda -->
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)]"
              >Fecha de Nacimiento</label
            >
            <p class="text-lg font-semibold">
              {{ new Date(animal.fecha_nacimiento).toLocaleDateString() }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)]"
              >Raza</label
            >
            <p class="text-lg font-semibold">
              {{ animal.raza }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)]"
              >Tipo</label
            >
            <p class="text-lg font-semibold">
              {{ animal.tipo_animal }}
            </p>
          </div>
        </div>

        <!-- Columna Derecha -->
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)]"
              >Peso Actual</label
            >
            <p class="text-2xl font-semibold">{{ animal.peso_actual }} kg</p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)]"
              >Estado de Salud</label
            >
            <p class="text-lg font-semibold">
              {{ animal.estado_salud }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)]"
              >En Venta</label
            >
            <p class="text-lg font-semibold">
              {{
                hasSaleRecord
                  ? "Con información de venta"
                  : "Sin información de venta disponible"
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Sección Adicional -->
      <div class="mt-8 border-t pt-6">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)]"
              >Peso Inicial</label
            >
            <p class="text-lg font-semibold">{{ animal.peso_inicial }} kg</p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)]"
              >ID Reproducción</label
            >
            <p class="text-lg font-semibold">
              {{ animal.id_reproduccion || "N/A" }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)]"
              >Fecha Fallecimiento</label
            >
            <p class="text-lg font-semibold">
              {{
                animal.fecha_fallecimiento
                  ? new Date(animal.fecha_fallecimiento).toLocaleDateString()
                  : "N/A"
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modo Edición -->
    <UForm
      v-else="userRole === 'admin'"
      :schema="schema"
      :state="formData"
      :model-value="formData"
      @update:model-value="(value: Record<string, any>) => Object.assign(formData, value)"
      @submit="handleSubmit"
      class="space-y-6"
    >
    
      <div class="grid md:grid-cols-2 gap-6">
        
        <!-- Columna Izquierda -->
        <div class="space-y-4">
          <UFormField
            label="Fecha de Nacimiento"
            name="fecha_nacimiento"
            required
          >
            <UInput type="date" v-model="formData.fecha_nacimiento" />
            <UFormMessage />
          </UFormField>

          <UFormField label="Raza" name="raza" required>
            <UInput v-model="formData.raza" />
            <UFormMessage />
          </UFormField>

          <UFormField label="Tipo de Animal" name="tipo_animal" required>
            <USelect
              v-model="formData.tipo_animal"
              :items="['NOVILLO', 'TERNERO', 'TERNERA', 'VACA', 'TORO']"
              class="w-3xs"
            />
            <UFormMessage />
          </UFormField>
        </div>

        <!-- Columna Derecha -->
        <div class="space-y-4">
          <UFormField label="Peso Actual (kg)" name="peso_actual" required>
            <UInput type="number" step="0.1" v-model="formData.peso_actual" />
            <UFormMessage />
          </UFormField>

          <UFormField label="Estado de Salud" name="estado_salud" required>
            <USelect
              v-model="formData.estado_salud"
              :items="[
                'EXCELENTE',
                'BUENO',
                'REGULAR',
                'MALO',
                'CRITICO',
                'RECUPERACION',
                'OBSERVACION',
              ]"
              class="w-3xs"
            />
            <UFormMessage />
          </UFormField>

          <UFormField label="En Venta" name="venta">
            <div>
              <template v-if="hasSaleRecord">
                <p class="font-semibold">
                  Este registro ya posee información de venta
                </p>
              </template>

              <template v-else>
                <SaleModal
                  :animal-id="animal.id_animal"
                  v-slot="{ open }"
                  @created="handleSaleCreated"
                >
                  <UButton
                    @click="open"
                    class="bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)] hover:text-[var(--color-custom-50)] dark:hover:text-[var(--color-custom-500)]"
                  >
                    Agregar Información de Venta
                  </UButton>
                </SaleModal>
              </template>
            </div>
          </UFormField>
        </div>
      </div>

      <!-- Sección Adicional -->
      <div
        class="mt-8 border-t pt-6 block space-y-4 md:grid md:grid-cols-3 md:gap-4"
      >
        <UFormField label="Peso Inicial (kg)" name="peso_inicial">
          <UInput type="number" step="0.1" v-model="formData.peso_inicial" />
          <UFormMessage />
        </UFormField>

        <UFormField label="ID Reproducción" name="id_reproduccion">
          <UInput v-model="formData.id_reproduccion" />
          <UFormMessage />
          <DrawerGenealogy
            v-model:modelValue="isDrawerOpen"
            @select="formData.id_reproduccion = $event.id_reproduccion"
          />
        </UFormField>

        <UFormField label="Fecha Fallecimiento" name="fecha_fallecimiento">
          <UInput type="date" v-model="formData.fecha_fallecimiento" />
          <UFormMessage />
        </UFormField>
      </div>

      <div class="flex justify-end gap-3 mt-8">
        <UButton
          type="button"
          color="primary"
          @click="cancelEditing"
          :disabled="isSubmitting"
        >
          Cancelar
        </UButton>
        <UButton type="submit" :loading="isSubmitting" :disabled="isSubmitting">
          Guardar Cambios
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { useUserRole } from "~/composables/arestricted";
import type { Animal } from "~/types/animal";
import type { Venta } from "~/types/animal";
import { z } from "zod";
const isDrawerOpen = ref(false);

const schema = z.object({
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  raza: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(30, "Máximo 50 caracteres"),
  tipo_animal: z.enum(["NOVILLO", "TERNERO", "TERNERA", "VACA", "TORO"]),
  peso_actual: z.coerce
    .number()
    .positive("Debe ser positivo")
    .min(1, "Mínimo 1 kg")
    .max(2000, "Máximo 2000 kg"),
  estado_salud: z.enum([
    "EXCELENTE",
    "BUENO",
    "REGULAR",
    "MALO",
    "CRITICO",
    "RECUPERACION",
    "OBSERVACION",
  ]),
  peso_inicial: z.coerce
    .number()
    .min(0, "Mínimo 0 kg")
    .max(2000, "Máximo 2000 kg")
    .optional(),
  id_reproduccion: z.coerce.number().max(500, "Máximo 500").optional(),
  fecha_fallecimiento: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
      z.literal(""),
    ])
    .optional(),
});

const { userRole } = useUserRole();
const toast = useToast();

const props = defineProps({
  animal: {
    type: Object as () => Animal,
    required: true,
  },
  venta: {
    type: Object as () => Venta | null,
    default: null,
  },
  show: {
    type: Boolean,
    default: true,
  },
});

const hasSaleRecord = computed(() => props.venta !== null);

const emit = defineEmits<{
  (e: "updated", updatedAnimal: Animal): void;
  (e: "venta-created"): void;
}>();

const handleSaleCreated = () => {
  emit("venta-created");
};

// Reactive variables
const isEditing = ref(false);
const isSubmitting = ref(false);
const isDeletingImage = ref(false);

const formData = reactive<{
  id_animal: string;
  fecha_nacimiento: string;
  raza: string;
  tipo_animal: "NOVILLO" | "TERNERO" | "TERNERA" | "VACA" | "TORO";
  peso_actual: number;
  estado_salud:
    | "EXCELENTE"
    | "BUENO"
    | "REGULAR"
    | "MALO"
    | "CRITICO"
    | "RECUPERACION"
    | "OBSERVACION";
  venta: boolean;
  peso_inicial?: number;
  id_reproduccion?: number;
  fecha_fallecimiento?: string;
}>({
  id_animal: props.animal.id_animal,
  fecha_nacimiento: props.animal.fecha_nacimiento.split("T")[0],
  raza: props.animal.raza,
  tipo_animal: props.animal.tipo_animal as
    | "NOVILLO"
    | "TERNERO"
    | "TERNERA"
    | "VACA"
    | "TORO",
  peso_actual: props.animal.peso_actual,
  estado_salud: props.animal.estado_salud as
    | "EXCELENTE"
    | "BUENO"
    | "REGULAR"
    | "MALO"
    | "CRITICO"
    | "RECUPERACION"
    | "OBSERVACION",
  venta: props.animal.venta,
  peso_inicial: props.animal.peso_inicial,
  id_reproduccion:
    props.animal.id_reproduccion !== undefined &&
    props.animal.id_reproduccion !== null
      ? Number(props.animal.id_reproduccion)
      : undefined,
  fecha_fallecimiento: props.animal.fecha_fallecimiento?.split("T")[0] || "",
});

const enableEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  Object.assign(formData, {
    id_animal: props.animal.id_animal,
    fecha_nacimiento: props.animal.fecha_nacimiento.split("T")[0],
    raza: props.animal.raza,
    tipo_animal: props.animal.tipo_animal,
    peso_actual: props.animal.peso_actual,
    estado_salud: props.animal.estado_salud,
    venta: props.animal.venta,
    peso_inicial: props.animal.peso_inicial,
    id_reproduccion:
      props.animal.id_reproduccion !== undefined &&
      props.animal.id_reproduccion !== null
        ? Number(props.animal.id_reproduccion)
        : undefined,
    fecha_fallecimiento: props.animal.fecha_fallecimiento?.split("T")[0] || "",
  });
};

const deleteImage = async () => {
  isDeletingImage.value = true;
  try {
    const response = await $fetch(
      `/api/animal/specific/${props.animal.id_animal}/image`,
      {
        method: "DELETE"
      }
    );

    if (!response?.success) {
      throw new Error("Error al eliminar la imagen");
    }

    props.animal.imagen_url = null;
    
    toast.add({
      title: "Imagen eliminada",
      description: "La imagen del animal se ha eliminado correctamente",
      color: "success",
      icon: "i-heroicons-check-circle"
    });
  } catch (error: unknown) {
    console.error("Error al eliminar imagen:", error);
    let message = "Error desconocido al eliminar la imagen";
    
    if (error instanceof Error) {
      message = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof (error as any).data?.message === "string"
    ) {
      message = (error as any).data.message;
    }

    toast.add({
      title: "Error al eliminar imagen",
      description: message,
      color: "error",
      icon: "i-heroicons-exclamation-circle"
    });
  } finally {
    isDeletingImage.value = false;
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const response = await $fetch(
      `/api/animal/specific/${props.animal.id_animal}`,
      {
        method: "PUT",
        body: {
          fecha_nacimiento: formData.fecha_nacimiento,
          raza: formData.raza,
          tipo_animal: formData.tipo_animal,
          peso_actual: formData.peso_actual,
          estado_salud: formData.estado_salud,
          peso_inicial: formData.peso_inicial,
          id_reproduccion: formData.id_reproduccion,
          fecha_fallecimiento: formData.fecha_fallecimiento || null,
        },
      }
    );

    if (!response?.animal) {
      throw new Error("La respuesta del servidor es inválida");
    }

    Object.assign(props.animal, response.animal);

    toast.add({
      title: "Actualización exitosa",
      description: "Los datos del animal se han actualizado correctamente",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    isEditing.value = false;
    emit("updated", {
      id_animal: formData.id_animal,
      fecha_nacimiento: formData.fecha_nacimiento,
      raza: formData.raza,
      tipo_animal: formData.tipo_animal!,
      peso_actual: formData.peso_actual,
      estado_salud: formData.estado_salud,
      id_reproduccion:
        formData.id_reproduccion !== undefined
          ? String(formData.id_reproduccion)
          : null,
      fecha_fallecimiento: formData.fecha_fallecimiento || null,
      venta: false,
      peso_inicial: 0,
    });
  } catch (error: unknown) {
    console.error("Error en actualización:", error);
    let message = "Error desconocido";
    if (error instanceof Error) {
      message = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof (error as any).data?.message === "string"
    ) {
      message = (error as any).data.message;
    }

    toast.add({
      title: "Error al actualizar",
      description: message,
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
