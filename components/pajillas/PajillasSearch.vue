<script setup lang="ts">
import { ref, watch } from 'vue'

const searchTerm = ref('')
const emit = defineEmits(['search'])

// Debounce para evitar demasiadas llamadas
let timeoutId: NodeJS.Timeout | null = null

const handleSearch = () => {
  if (timeoutId) clearTimeout(timeoutId)
  
  timeoutId = setTimeout(() => {
    emit('search', searchTerm.value.trim())
  }, 300)
}

watch(searchTerm, handleSearch)

// Limpiar timeout al desmontar
onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <div class="flex gap-2 max-w-xl mx-auto p-4">
    <UInput
      v-model="searchTerm"
      placeholder="Buscar por código, animal, descripción..."
      class="flex-1 font-mono"
      @keyup.enter="handleSearch"
    />
    <UButton
      icon="i-heroicons-magnifying-glass-solid"
      @click="handleSearch"
      :disabled="!searchTerm"
      title="Buscar pajilla"
    >
      <span class="hidden md:inline">Buscar</span>
    </UButton>
  </div>
</template> 