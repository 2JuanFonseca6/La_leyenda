<script setup lang="ts">
import AnimalSearch from '~/components/animal/AnimalSearch.vue'
import BreadNav from '~/components/navigation/BreadNav.vue';
import SaleInfoCard from '~/components/animal/SaleInfoCard.vue'
import HealthHistoryCard from '~/components/animal/HealthHistoryCard.vue'
import type { BreadcrumbItem } from '@nuxt/ui'
import type { GenealogyResponse, Venta, Animal, HistorialSalud } from '~/types/animal'
import { useUserRole } from '~/composables/arestricted'

const { userRole } = useUserRole();

const route = useRoute()
const id = route.params.id

const { data: animal, pending, refresh, error } = await useLazyFetch<{ animal: Animal, venta: Venta | null, historialSalud: HistorialSalud[] }>(
  `/api/animal/specific/${id}`,
  {
    server: false
  }
)

useHead({
  title: `Animal ${id}`
})

definePageMeta({
  layout: "logged"
})

// Toast
const toast = useToast()

watch(
  () => error.value,
  (err) => {
    if (err) {
      toast.add({
        title: err?.data?.message ?? 'Error al cargar el animal',
        description: err?.data?.message ?? 'Ocurrió un error inesperado.',
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
    }
  }
)

const breadcrumbItems = ref<BreadcrumbItem[]>([
  {
    label: 'Inicio',
    icon: 'i-heroicons-home-solid',
    to: '/'
  },
  {
    label: 'Animales',
    icon: 'i-healthicons-animal-cow',
    to: '/animals',
  },
  {
    label: 'Búsqueda específica',
    icon: 'i-heroicons-magnifying-glass',
  }
])

watch(
  () => animal.value,
  (val) => {
    if (val?.animal) {
      toast.add({
        title: 'Animal encontrado',
        description: `Se cargó correctamente el animal con ID ${val.animal.id_animal}`,
        color: 'success',
        icon: 'i-heroicons-check-circle',
        ui: {
          root: "print:hidden"
        }
      })

      const alreadyExists = breadcrumbItems.value.some(
        item => item.label === `ID: ${val.animal.id_animal}`
      )

      if (!alreadyExists) {
        breadcrumbItems.value.push({
          label: `ID: ${val.animal.id_animal}`,
          icon: 'i-heroicons-identification',
        })
      }
    }
  }
)

const { data: genealogy, pending: genealogyPending } = await useLazyFetch<GenealogyResponse>(
  `/api/genealogy/id/${id}`,
  {
    server: false,
    transform: (res: any) => transformGenealogyData(res)
  }
)

// Función para transformar la respuesta de la API
const transformGenealogyData = (apiData: any): GenealogyResponse => {
  if (!apiData?.reproduccion) {
    return {
      id: apiData.animal.id_animal,
      raza: apiData.animal.raza,
      tipo_animal: apiData.animal.tipo_animal,
      madre: undefined,
      padre: undefined
    }
  }

  const transformAnimalToNode = (animalItem: Animal): TreeNode => ({
    id: animalItem.id_animal,
    raza: animalItem.raza,
    tipo_animal: animalItem.tipo_animal,
    madre: undefined,
    padre: undefined
  });

  return {
    id: apiData.animal.id_animal,
    raza: apiData.animal.raza,
    tipo_animal: apiData.animal.tipo_animal,
    madre: apiData.reproduccion.madre ? transformAnimalToNode(apiData.reproduccion.madre) : undefined,
    padre: apiData.reproduccion.padre ? transformAnimalToNode(apiData.reproduccion.padre) : undefined
  };
};


const showPrintOptions = ref(false)
const printSections = reactive({
  genealogy: true,
  venta: true,
  detalles: true,
  salud: true
})

const printReport = () => {
  if (typeof window !== 'undefined') {
    window.print();
  }
};

const handleAnimalUpdated = (updatedAnimal: Animal) => {
  if (animal.value) {
    // Actualizar la referencia reactiva
    animal.value.animal = { ...animal.value.animal, ...updatedAnimal }
    // Forzar actualización de datos
    refresh()
  }
}

const handleVentaCreated = () => {
  refresh()
  useToast().add({
    title: 'Venta registrada!',
    color: 'success',
    icon: 'i-heroicons-check-circle',
  })
}

const handleVentaUpdated = () => {
  refresh() // Recargar los datos del animal
  toast.add({
    title: 'Venta actualizada',
    description: 'La información de venta se ha actualizado correctamente',
    color: 'success',
    icon: 'i-heroicons-check-circle'
  })
}

// En la sección de métodos del componente padre
const handleHealthUpdated = () => {
  refresh()
  toast.add({
    title: 'Historial actualizado',
    description: 'El historial de salud se ha actualizado correctamente',
    color: 'success',
    icon: 'i-heroicons-check-circle'
  })
}
</script>

<template>
  <div class="space-y-8">

    <BreadNav :items="breadcrumbItems" class="print:hidden" />

    <AnimalSearch class="print:hidden" />


    <div v-if="pending" class="text-center p-8">
      <p class="mt-4 text-[var(--color-custom-300)]">Cargando información del animal...</p>
    </div>

    <!-- <UAlert v-else-if="error" :title="'error.data?.statusMessage" -->
    <UAlert v-else-if="error" title="Error al cargar el animal" icon="i-heroicons-exclamation-circle" color="error" />

    <div v-else-if="animal?.animal" class="max-w-4xl mx-auto p-6 print:max-w-full print:px-0">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <UButton icon="i-heroicons-arrow-left" label="Volver" @click="$router.back()" />
        <div class="space-x-2">
          <UButton icon="i-heroicons-adjustments-horizontal"
            :label="showPrintOptions ? 'Ocultar opciones' : 'Seleccionar para imprimir'"
            @click="showPrintOptions = !showPrintOptions" color="primary" />
          <UButton icon="i-heroicons-printer" label="Imprimir" @click="printReport" />
        </div>
      </div>
      <div v-if="showPrintOptions" class="flex flex-col md:flex-row gap-4 mb-6 print:hidden">
        <UCheckbox v-model="printSections.detalles" label="Detalle del animal" />
        <UCheckbox v-model="printSections.venta" label="Información de venta" />
        <UCheckbox v-model="printSections.salud" label="Historial de salud" />
      </div>

      <!-- Sección Detalles -->
      <AnimalDetailsCard :animal="animal.animal" :venta="animal.venta" :show="printSections.detalles"
        @updated="handleAnimalUpdated" @venta-created="handleVentaCreated" />

      <!-- Sección Venta -->
      <template v-if="animal?.venta">
        <SaleInfoCard :venta="animal.venta" :show="printSections.venta" @updated="handleVentaUpdated" />
        <UButton v-if="showPrintOptions && userRole === 'admin'" icon="i-heroicons-pencil-square" label="Editar Venta"
          @click="$router.push(`/sales/edit/${animal.venta.id_venta}`)" class="mt-4 print:hidden" />
      </template>
      <UAlert v-else title="Sin información de venta" description="Este animal no tiene datos de venta registrados."
        icon="i-heroicons-exclamation-circle" color="warning" class="mt-8" />

      <!-- Sección Historial de Salud -->
      <HealthHistoryCard :historial-salud="animal.historialSalud" :animal-id="animal.animal.id_animal.toString()"
        :show="printSections.salud" @updated="handleHealthUpdated" />

      <!-- Sección Árbol Genealógico -->
      <div v-if="genealogyPending" class="mt-8 text-center p-4 print:hidden">
        <p class="text-[var(--color-custom-300)]">Cargando árbol genealógico...</p>
      </div>

      <template v-else>
        <div class="print:hidden">
          <h2 v-if="genealogy" class="text-2xl font-semibold mt-8"> Árbol Genealógico </h2>
          <GenealogyTree v-if="genealogy" :tree-data="genealogy" class="mt-8" />
          <UAlert v-else title="Sin registro genealógico"
            description="No se encontraron datos de parentesco para este animal." icon="i-heroicons-information-circle"
            color="warning" class="mt-8" />
        </div>
      </template>

      <DeleteAnimalCard v-if="animal?.animal && userRole === 'admin'" :animal-id="animal.animal.id_animal.toString()"
        class="mt-8 print:hidden" />
    </div>

    <!-- Animal no encontrado -->
    <UAlert v-else title="Animal no encontrado" description="No existe un animal con el ID proporcionado"
      icon="i-heroicons-magnifying-glass" color="error" class="max-w-4xl mx-auto" />
  </div>
</template>