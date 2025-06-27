<template>
  <UCard
    class="shadow-lg print:shadow-none print:w-full print:mt-[-55px] print:border print:border-gray-300"
    :class="{ 'print:hidden': !show }"
  >
    <div class="w-full flex justify-center relative group print:flex-col print:items-center">
      <div
        class="rounded border border-gray-300 overflow-hidden max-h-64 w-fit print:max-h-32 print:border-0"
        :class="{ 'cursor-pointer': isEditing }"
        @click="isEditing ? fileInput?.click() : null"
      >
        <img
          :src="animal.imagen_url || undefined"
          alt="Imagen del animal"
          class="transition-transform duration-300 ease-in-out object-contain max-h-64 group-hover:scale-110 print:max-h-32 print:scale-100"
        />
      </div>

      <UButton
        v-if="userRole === 'admin' && isEditing"
        icon="i-heroicons-trash"
        color="error"
        @click.stop="deleteImage"
        :loading="isDeletingImage"
        class="absolute top-2 right-2 print:hidden"
      />
    </div>
    
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      class="hidden"
      @change="handleImageUpload"
    />
    <div class="my-4 print:my-2">
      <UButton
        v-if="userRole === 'admin' && !isEditing"
        @click="fileInput?.click()"
        :loading="isUploadingImage"
        icon="i-heroicons-photo"
        color="primary"
        label="Cambiar imagen"
        class="print:hidden"
      />
    </div>
    <div class="mt-8 border-t pt-6 print:mt-4 print:pt-2"></div>
    <template #header>
      <div class="flex justify-between items-center print:flex-col print:items-start print:gap-2">
        <h1 class="text-2xl print:text-xl">
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
    <div v-if="!isEditing" class="print:space-y-2">
      <div class="grid md:grid-cols-2 gap-6 print:grid print:grid-cols-2 print:gap-4">
        <!-- Columna Izquierda -->
        <div class="space-y-4 print:space-y-2">
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Fecha de Nacimiento</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{ new Date(animal.fecha_nacimiento).toLocaleDateString() }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Raza</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{ animal.raza }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Tipo</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{ animal.tipo_animal }}
            </p>
          </div>
        </div>

        <!-- Columna Derecha -->
        <div class="space-y-4 print:space-y-2">
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Peso Actual</label
            >
            <p class="text-2xl font-semibold print:text-lg">{{ animal.peso_actual }} kg</p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Estado de Salud</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{ animal.estado_salud }}
            </p>
          </div>

          <div v-if="userRole === 'admin'">
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >En Venta</label
            >
            <p class="text-lg font-semibold print:text-sm">
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
      <div class="mt-8 border-t pt-6 print:mt-4 print:pt-2">
        <div class="grid grid-cols-3 gap-4 text-center print:gap-2">
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Peso Inicial</label
            >
            <p class="text-lg font-semibold print:text-sm">{{ animal.peso_inicial }} kg</p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >ID Reproducción</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{ animal.id_reproduccion || "N/A" }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Fecha Fallecimiento</label
            >
            <p class="text-lg font-semibold print:text-sm">
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

          <UFormField v-if="userRole === 'admin'" label="En Venta" name="venta">
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
const isPreviewOpen = ref(false);

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
const isUploadingImage = ref(false);
const fileInput = ref<HTMLInputElement>();

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  isUploadingImage.value = true;
  try {
    // 1. Subir imagen a Supabase Storage
    const formData = new FormData();
    formData.append("file", file);

    interface UploadResponse {
      url: string;
    }

    const uploadResponse = await $fetch<UploadResponse>("/api/storage/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse?.url) {
      throw new Error("No se pudo subir la imagen");
    }

    // 2. Actualizar el animal con la nueva URL de imagen
    const updateResponse = await $fetch(
      `/api/animal/specific/${props.animal.id_animal}`,
      {
        method: "PUT",
        body: {
          ...props.animal,
          imagen_url: uploadResponse.url,
        },
      }
    );

    // 3. Actualizar estado local
    emit("updated", {
      ...props.animal,
      imagen_url: uploadResponse.url,
    });

    toast.add({
      title: "Imagen actualizada",
      description: "La imagen del animal se ha actualizado correctamente",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error) {
    // Manejo de errores
  } finally {
    isUploadingImage.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
};

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
        method: "DELETE",
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
      icon: "i-heroicons-check-circle",
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
      icon: "i-heroicons-exclamation-circle",
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
