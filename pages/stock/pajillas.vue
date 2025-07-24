<template>
  <!-- Encabezado de impresión -->
  <PrintHeader title="Inventario de Pajillas" />
  
  <BreadNav :items="breadcrumbItems" />
  <h1 class="text-3xl font-bold tracking-widest uppercase text-center">Pajillas</h1>
  <PajillasSearch @search="onPajillaSearch" />
  
  <!-- Información del inventario de pajillas -->
  <div class="text-center my-6">
   
    <!-- Información de permisos -->
    <div v-if="!canCreate" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-information-circle" class="text-blue-600 dark:text-blue-400" />
        <p class="text-blue-800 dark:text-blue-200 text-sm">
          <strong>Modo de solo lectura:</strong> Puedes ver el inventario de pajillas pero no realizar modificaciones.
        </p>
      </div>
    </div>
  </div>

  <div class="space-y-6">
    <div class="relative">
      <div class="overflow-x-auto rounded-lg">
        <PajillasTable ref="tableRef" :search="pajillaSearchTerm" @add="openCreateModal" />
      </div>

    </div>
    <!-- Modal de creación -->
    <PajillaCreateModal ref="createModalRef" @created="onCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BreadNav from '~/components/navigation/BreadNav.vue'
import PrintHeader from '~/components/PrintHeader.vue'
import PajillaCreateModal from '~/components/pajillas/PajillaCreateModal.vue'
import PajillasTable from '~/components/pajillas/PajillasTable.vue'
import PajillasSearch from '~/components/pajillas/PajillasSearch.vue'
import { useUserRole } from '~/composables/arestricted'
import type { Tables } from '~/types/supabase'
import type { BreadcrumbItem } from '@nuxt/ui'

const { canCreate } = useUserRole()

type Pajilla = Tables<'pajillas'>

const createModalRef = ref<InstanceType<typeof PajillaCreateModal> | null>(null)
const tableRef = ref<InstanceType<typeof PajillasTable> | null>(null)
const pajillaSearchTerm = ref('')

function openCreateModal() {
  createModalRef.value?.openModal()
}

function onCreated() {
  tableRef.value?.refreshTable()
}

function onPajillaSearch(term: string) {
  pajillaSearchTerm.value = term
}

const breadcrumbItems: BreadcrumbItem[] = [
  {
    label: 'Inicio',
    icon: 'i-heroicons-home-solid',
    to: '/'
  },
  {
    label: 'Inventario',
    icon: 'i-healthicons-i-exam-multiple-choice-outline',
    to: '/stock'
  },
  {
    label: 'Pajillas',
    icon: 'i-healthicons-syringe-outline',
    to: '/stock/pajillas'
  }
]

definePageMeta({
  layout: "logged"
})
</script>
