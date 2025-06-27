<template>
  <BreadNav :items="breadcrumbItems" />
  <h1 class="text-3xl font-bold tracking-widest uppercase text-center">Genealogía</h1>
  
  <!-- Información de la genealogía -->
  <div class="text-center my-6">
    <p class="text-gray-600 mb-4">Gestiona los registros de reproducción y genealogía de tus animales</p>
    <!-- Información de permisos -->
    <div v-if="!canCreate" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-information-circle" class="text-blue-600 dark:text-blue-400" />
        <p class="text-blue-800 dark:text-blue-200 text-sm">
          <strong>Modo de solo lectura:</strong> Puedes ver los registros de genealogía pero no realizar modificaciones.
        </p>
      </div>
    </div>
  </div>

  <GenealogyTable />
</template>

<script setup lang="ts">
import BreadNav from '~/components/navigation/BreadNav.vue';
import { useUserRole } from '~/composables/arestricted'
import type { BreadcrumbItem } from '@nuxt/ui'

const { canCreate } = useUserRole()

const breadcrumbItems: BreadcrumbItem[] = [
  {
    label: 'Inicio',
    icon: 'i-heroicons-home-solid',
    to: '/'
  },
  {
    label: 'Animales',
    icon: 'i-healthicons-animal-cow',
    to: '/animals'
  },
  {
    label: 'Genealogía',
    icon: 'i-healthicons-sperm-outline',
    to: '/animals/genealogy'
  }
]

definePageMeta({
  layout: "logged"
})
</script>