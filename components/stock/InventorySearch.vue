<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
const searchTerm = ref('')
const searchDate = ref('')
const emit = defineEmits(['search'])
let timeoutId: ReturnType<typeof setTimeout> | null = null

const handleSearch = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    // Convertir fecha dd/mm/yyyy a yyyy-mm-dd para el backend
    let formattedDate = ''
    if (searchDate.value) {
      const parts = searchDate.value.split('/')
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0')
        const month = parts[1].padStart(2, '0')
        const year = parts[2]
        formattedDate = `${year}-${month}-${day}`
      }
    }
    emit('search', { term: searchTerm.value.trim(), date: formattedDate })
  }, 300)
}

const handleDateInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '') // Solo números
  
  // Aplicar máscara dd/mm/yyyy
  if (value.length > 0) {
    if (value.length <= 2) {
      value = value
    } else if (value.length <= 4) {
      value = value.slice(0, 2) + '/' + value.slice(2)
    } else {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8)
    }
  }
  
  searchDate.value = value
}

watch([searchTerm, searchDate], handleSearch)
onUnmounted(() => { if (timeoutId) clearTimeout(timeoutId) })
</script>
<template>
  <div class="flex gap-2 max-w-xl mx-auto p-4">
    <UInput
      v-model="searchTerm"
      placeholder="Buscar por descripción, ID, tipo..."
      class="flex-1 font-mono"
      @keyup.enter="handleSearch"
    />
    <UInput
      v-model="searchDate"
      placeholder="dd/mm/yyyy"
      class="w-32 font-mono"
      maxlength="10"
      @input="handleDateInput"
      @change="handleSearch"
    />
    <UButton
      icon="i-heroicons-magnifying-glass-solid"
      @click="handleSearch"
      :disabled="!searchTerm && !searchDate"
      title="Buscar producto"
    >
      <span class="hidden md:inline">Buscar</span>
    </UButton>
  </div>
</template> 