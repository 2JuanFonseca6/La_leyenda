<template>
  <!-- Encabezado de impresión -->
  <PrintHeader title="Inventario de Pajillas" />
  
  <BreadNav :items="breadcrumbItems" />
  <h1 class="text-3xl font-bold tracking-widest uppercase text-center">Inventario de Pajillas</h1>
  
  <!-- Información del inventario de pajillas -->
  <div class="text-center my-6">
    <p class="text-gray-600 mb-4">Registra y gestiona las pajillas usadas en tu ganadería</p>
  </div>

  <div class="space-y-6">
    <div class="flex justify-between items-center">
 
    </div>

    <PajillasTable ref="tableRef" @add="openCreateModal" />

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
import type { Tables } from '~/types/supabase'
import type { BreadcrumbItem } from '@nuxt/ui'

type Pajilla = Tables<'pajillas'>

const createModalRef = ref<InstanceType<typeof PajillaCreateModal> | null>(null)
const tableRef = ref<InstanceType<typeof PajillasTable> | null>(null)

function openCreateModal() {
  createModalRef.value?.openModal()
}

function onCreated() {
  tableRef.value?.refreshTable()
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
