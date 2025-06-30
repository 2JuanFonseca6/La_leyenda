<template>
  <UModal v-model:open="isOpen" title="Agregar Animal" description="Completa los datos del animal"
    class="max-w-4xl w-full">
    <template #body>
      <UForm :schema="schema" :state="formState" @submit="handleSubmit"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- ID Animal -->
        <UFormField name="id_animal" required class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              ID Animal
            </span>
          </template>
          <UInput v-model="formState.id_animal" />
        </UFormField>

        <!-- Tipo de Animal -->
        <UFormField name="tipo_animal" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Tipo de Animal
            </span>
          </template>
          <USelect v-model="formState.tipo_animal" :items="tipoAnimalOptions" placeholder="Selecciona un tipo" variant="ghost" class="cursor-pointer"/>
        </UFormField>

        <!-- Raza -->
        <UFormField name="raza" required class="col-span-1 sm:col-span-2 lg:col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Raza
            </span>
          </template>
          <UInput v-model="formState.raza" />
        </UFormField>

        <!-- Fecha de Nacimiento -->
        <UFormField name="fecha_nacimiento" required class="col-span-1 sm:col-span-2 lg:col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Fecha de Nacimiento
            </span>
          </template>
          <UInput v-model="formState.fecha_nacimiento" type="date" />
        </UFormField>

        <!-- Peso Inicial -->
        <UFormField name="peso_inicial" required class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Peso Inicial (kg)
            </span>
          </template>
          <UInput v-model.number="formState.peso_inicial" type="number" step="0.1" />
        </UFormField>

        <!-- Peso Actual -->
        <UFormField name="peso_actual" required class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Peso Actual (kg)
            </span>
          </template>
          <UInput v-model.number="formState.peso_actual" type="number" step="0.1" />
        </UFormField>

        <!-- Estado de Salud -->
        <UFormField name="estado_salud" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Estado de Salud
            </span>
          </template>
          <USelect v-model="formState.estado_salud" :items="estadoSaludOptions" placeholder="Selecciona un estado" variant="ghost" class="cursor-pointer"/>
        </UFormField>

        <!-- Fecha de Fallecimiento -->
        <UFormField name="fecha_fallecimiento" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Fecha de Fallecimiento
            </span>
          </template>
          <UInput v-model="formState.fecha_fallecimiento" type="date" />
        </UFormField>

        <!-- ID Reproducción -->
        <UFormField name="id_reproduccion" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              ID Reproducción
            </span>
          </template>
          <div class="flex items-center gap-2">
            <p>{{ formState.id_reproduccion }}</p>
            <p v-if="!formState.id_reproduccion">
              Sin registro seleccionado
            </p>
            <DrawerGenealogy v-model:modelValue="isDrawerOpen"
              @select="formState.id_reproduccion = $event.id_reproduccion" />
          </div>
        </UFormField>
        <UFormField name="image" class="col-span-1 sm:col-span-2">
          <template #label>
            <span>Imagen del Animal</span>
          </template>
          <UInput type="file" @change="handleFileChange" accept="image/*" class="cursor-pointer" />
        </UFormField>

        <!-- Botones de acción ocupan toda la fila -->
        <div class="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-end gap-4 mt-2">
          <UButton type="button" variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" color="primary"> Guardar Animal </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Database } from "~/types/supabase";
import type { TablesInsert } from "~/types/supabase";
import { Constants } from "~/types/supabase";
const isDrawerOpen = ref(false);
const supabase = useSupabaseClient<Database>();
const isOpen = ref(false);
const emit = defineEmits(["close", "created"]);

const tipoAnimalOptions = [
  { label: "TERNERO", value: "TERNERO" },
  { label: "TERNERA", value: "TERNERA" },
  { label: "NOVILLO", value: "NOVILLO" },
  { label: "NOVILLA", value: "NOVILLA" },
  { label: "TORO", value: "TORO" },
  { label: "VACA", value: "VACA" },
];

const estadoSaludOptions = computed(() =>
  Constants.public.Enums.estado_salud.map((value) => ({ label: value, value }))
);

const schema = z.object({
  id_animal: z.string().min(1, "El ID es requerido"),
  raza: z.string().min(1, "La raza es requerida"),
  fecha_nacimiento: z.string().date("Fecha inválida"),
  peso_inicial: z.number().min(0, "El peso no puede ser negativo"),
  peso_actual: z.number().min(0, "El peso no puede ser negativo"),
});

type FormState = Omit<
  TablesInsert<"animals">,
  "tipo_animal" | "estado_salud"
> & {
  tipo_animal?: Database["public"]["Enums"]["tipo_animal"];
  estado_salud?: Database["public"]["Enums"]["estado_salud"];
  imagen_url?: string | null;
};

const formState = reactive<FormState>({
  id_animal: "",
  tipo_animal: undefined,
  raza: "",
  fecha_nacimiento: new Date().toISOString().split("T")[0],
  peso_inicial: 0,
  peso_actual: 0,
  estado_salud: undefined,
  fecha_fallecimiento: undefined,
  id_reproduccion: undefined,
  imagen_url: undefined,
});

const selectedFile = ref<File | null>(null);

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  }
};

const tipoAnimal = computed({
  get: () => formState.tipo_animal,
  set: (
    value: Database["public"]["Enums"]["tipo_animal"] | null | undefined
  ) => {
    formState.tipo_animal = value ?? undefined;
  },
});

const estadoSalud = computed({
  get: () => formState.estado_salud,
  set: (
    value: Database["public"]["Enums"]["estado_salud"] | null | undefined
  ) => {
    formState.estado_salud = value ?? undefined;
  },
});

const openModal = () => {
  isOpen.value = true;
  resetForm();
};

const closeModal = () => {
  isOpen.value = false;
  resetForm();
  emit("close");
};

const resetForm = () => {
  Object.assign(formState, {
    id_animal: "",
    tipo_animal: undefined,
    raza: "",
    fecha_nacimiento: new Date().toISOString().split("T")[0],
    peso_inicial: 0,
    peso_actual: 0,
    estado_salud: undefined,
    fecha_fallecimiento: undefined,
    id_reproduccion: undefined,
    imagen_url: undefined,
  });
  selectedFile.value = null;
};

const handleSubmit = async () => {
  try {
    let imageUrl = undefined;

    if (selectedFile.value) {
      const fileExt = selectedFile.value.name.split('.').pop();
      const fileName = `${Date.now()}-${formState.id_animal}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('animal-images')
        .upload(fileName, selectedFile.value);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('animal-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrl;
    }

    const animalData = {
      ...formState,
      imagen_url: imageUrl,
    };

    const { error } = await supabase.from("animals").insert(animalData).single();

    if (error) throw error;

    emit("created");
    closeModal();
    useToast().add({
      title: "Animal creado!",
      icon: "i-heroicons-check-circle",
      color: "success",
    });
  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    useToast().add({
      title: "Error",
      description: errorMessage,
      icon: "i-heroicons-exclamation-circle",
      color: "error",
    });
  }
};

defineExpose({
  openModal,
});
</script>
