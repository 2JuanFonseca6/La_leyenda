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
        <UFormField name="fecha_nacimiento" class="col-span-1 sm:col-span-2 lg:col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Fecha de Nacimiento
            </span>
          </template>
          <UInput v-model="formState.fecha_nacimiento" type="date" />
        </UFormField>

        <!-- Peso Inicial -->
        <UFormField name="peso_inicial" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Peso Inicial (kg)
            </span>
          </template>
          <UInput v-model.number="formState.peso_inicial" type="number" step="0.1" />
        </UFormField>

        <!-- Peso Actual -->
        <UFormField name="peso_actual" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Peso Actual (kg)
            </span>
          </template>
          <UInput v-model.number="formState.peso_actual" type="number" step="0.1" />
        </UFormField>

        <!-- Peso al Destete (opcional) -->
        <UFormField name="peso_destete" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Peso al Destete (kg, opcional)</span>
          </template>
          <UInput v-model.number="formState.peso_destete" type="number" step="0.1" placeholder="Ej: 80" />
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

        <!-- Dueño -->
        <UFormField name="dueño" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Dueño
            </span>
          </template>
          <UInput v-model="formState.dueño" placeholder="Nombre del dueño" />
        </UFormField>

        <!-- Tipo de Ganado -->
        <UFormField name="tipo_ganado" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Tipo de Ganado
            </span>
          </template>
          <USelect v-model="formState.tipo_ganado" :items="tipoGanadoOptions" placeholder="Selecciona un tipo" variant="ghost" class="cursor-pointer"/>
        </UFormField>

        <!-- Cantidad de Hijos (solo para VACA) -->
        <UFormField v-if="formState.tipo_animal === 'VACA'" name="cantidad_hijos" class="col-span-1">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
              Cantidad de Hijos
            </span>
          </template>
          <UInput v-model.number="formState.cantidad_hijos" type="number" min="0" step="1" placeholder="0" />
        </UFormField>

        <!-- Descripción -->
        <UFormField name="descripcion" class="col-span-1 sm:col-span-2 lg:col-span-3">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Descripción</span>
          </template>
          <UTextarea v-model="formState.descripcion" placeholder="Descripción del animal (opcional)" :maxlength="500" />
        </UFormField>

        <!-- Imagen del Animal -->
        <UFormField name="image" class="col-span-1 sm:col-span-2">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Imagen del Animal</span>
          </template>
          <UInput type="file" @change="handleFileChange" accept="image/*" class="cursor-pointer" />
        </UFormField>

        <!-- Imagen Andrológica -->
        <UFormField name="andrologico_image" class="col-span-1 sm:col-span-2">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Imagen Andrológica</span>
          </template>
          <UInput type="file" @change="handleAndrologicoFileChange" accept="image/*" class="cursor-pointer" />
        </UFormField>

        <!-- Imagen Genomatológica -->
        <UFormField name="genomatologico_image" class="col-span-1 sm:col-span-2">
          <template #label>
            <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Imagen Genomatológica</span>
          </template>
          <UInput type="file" @change="handleGenomatologicoFileChange" accept="image/*" class="cursor-pointer" />
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

const tipoGanadoOptions = [
  { label: "PURO", value: "PURO" },
  { label: "COMERCIO", value: "COMERCIO" },
];

const estadoSaludOptions = computed(() =>
  Constants.public.Enums.estado_salud.map((value) => ({ label: value, value }))
);

const schema = z.object({
  id_animal: z.string().min(1, "El ID es requerido"),
  raza: z.string().min(1, "La raza es requerida"),
  fecha_nacimiento: z.string().optional().or(z.literal("")).or(z.null()),
  peso_inicial: z.number().min(0, "El peso no puede ser negativo").optional().or(z.nan()),
  peso_actual: z.number().min(0, "El peso no puede ser negativo").optional().or(z.nan()),
  peso_destete: z.number().optional().nullable(),
});

type FormState = Omit<
  TablesInsert<"animals">,
  "tipo_animal" | "estado_salud"
> & {
  tipo_animal?: Database["public"]["Enums"]["tipo_animal"];
  estado_salud?: Database["public"]["Enums"]["estado_salud"];
  imagen_url?: string | null;
  // NUEVOS CAMPOS
  dueño?: string | null;
  tipo_ganado?: Database["public"]["Enums"]["tipo_ganado"];
  andrologico_image_url?: string | null;
  genomatologico_image_url?: string | null;
  cantidad_hijos?: number | null;
  peso_destete?: number | null;
};

const formState = reactive<FormState>({
  id_animal: "",
  tipo_animal: undefined,
  raza: "",
  fecha_nacimiento: "",
  peso_inicial: 0,
  peso_actual: 0,
  estado_salud: undefined,
  fecha_fallecimiento: undefined,
  id_reproduccion: undefined,
  imagen_url: undefined,
  // NUEVOS CAMPOS
  dueño: undefined,
  tipo_ganado: undefined,
  andrologico_image_url: undefined,
  genomatologico_image_url: undefined,
  cantidad_hijos: undefined,
  peso_destete: undefined,
});

const selectedFile = ref<File | null>(null);
const selectedAndrologicoFile = ref<File | null>(null);
const selectedGenomatologicoFile = ref<File | null>(null);

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  }
};

const handleAndrologicoFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedAndrologicoFile.value = input.files[0];
  }
};

const handleGenomatologicoFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedGenomatologicoFile.value = input.files[0];
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
    fecha_nacimiento: "",
    peso_inicial: 0,
    peso_actual: 0,
    estado_salud: undefined,
    fecha_fallecimiento: undefined,
    id_reproduccion: undefined,
    imagen_url: undefined,
    // NUEVOS CAMPOS
    dueño: undefined,
    tipo_ganado: undefined,
    andrologico_image_url: undefined,
    genomatologico_image_url: undefined,
    cantidad_hijos: undefined,
    peso_destete: undefined,
  });
  selectedFile.value = null;
  selectedAndrologicoFile.value = null;
  selectedGenomatologicoFile.value = null;
};

const uploadImage = async (file: File, fileName: string, bucket: string) => {
  const fileExt = file.name.split('.').pop();
  const finalFileName = `${Date.now()}-${fileName}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(finalFileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(finalFileName);

  return publicUrl;
};

const handleSubmit = async () => {
  try {
    let imageUrl = undefined;
    let andrologicoImageUrl = undefined;
    let genomatologicoImageUrl = undefined;

    // Subir imagen principal
    if (selectedFile.value) {
      imageUrl = await uploadImage(selectedFile.value, formState.id_animal, 'animal-images');
    }

    // Subir imagen andrológica
    if (selectedAndrologicoFile.value) {
      andrologicoImageUrl = await uploadImage(selectedAndrologicoFile.value, `${formState.id_animal}-andrologico`, 'animal-images');
    }

    // Subir imagen genomatológica
    if (selectedGenomatologicoFile.value) {
      genomatologicoImageUrl = await uploadImage(selectedGenomatologicoFile.value, `${formState.id_animal}-genomatologico`, 'animal-images');
    }

    let animalDataFiltrado: any = {
      id_animal: formState.id_animal || "",
      raza: formState.raza || "",
      peso_inicial: formState.peso_inicial ?? 0,
      peso_actual: formState.peso_actual ?? 0,
      fecha_nacimiento: formState.fecha_nacimiento,
      imagen_url: imageUrl,
      andrologico_image_url: andrologicoImageUrl,
      genomatologico_image_url: genomatologicoImageUrl,
      descripcion: formState.descripcion,
      estado_salud: formState.estado_salud,
      fecha_fallecimiento: formState.fecha_fallecimiento,
      id_corral: formState.id_corral,
      id_reproduccion: formState.id_reproduccion,
      dueño: formState.dueño,
      tipo_ganado: formState.tipo_ganado,
      cantidad_hijos: formState.cantidad_hijos,
      peso_destete: formState.peso_destete,
    };
    // Crea un nuevo objeto sin fecha_nacimiento si es string vacía
    let animalDataFiltradoFinal = Object.fromEntries(
      Object.entries(animalDataFiltrado).filter(
        ([key, value]) => key !== 'fecha_nacimiento' || value !== ""
      )
    );
    // Si no existe fecha_nacimiento, asígnala como null (para cumplir con el tipado)
    if (!('fecha_nacimiento' in animalDataFiltradoFinal)) {
      animalDataFiltradoFinal.fecha_nacimiento = null;
    }
    // Asegura que los campos requeridos estén presentes
    if (!('id_animal' in animalDataFiltradoFinal)) animalDataFiltradoFinal.id_animal = formState.id_animal || "";
    if (!('raza' in animalDataFiltradoFinal)) animalDataFiltradoFinal.raza = formState.raza || "";
    if (!('peso_inicial' in animalDataFiltradoFinal)) animalDataFiltradoFinal.peso_inicial = formState.peso_inicial ?? 0;
    if (!('peso_actual' in animalDataFiltradoFinal)) animalDataFiltradoFinal.peso_actual = formState.peso_actual ?? 0;

    // Validación mínima antes de enviar a Supabase
    if (!animalDataFiltradoFinal.id_animal || !animalDataFiltradoFinal.raza) {
      useToast().add({
        title: 'Error',
        description: 'ID Animal y Raza son obligatorios.',
        color: 'error',
      });
      return;
    }

    const { error } = await supabase.from("animals").insert(animalDataFiltradoFinal as any).single();

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
