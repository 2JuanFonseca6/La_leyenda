<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
const searchTerm = ref('')
const emit = defineEmits(['search'])
let timeoutId: ReturnType<typeof setTimeout> | null = null

const handleSearch = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    emit('search', searchTerm.value.trim())
  }, 300)
}

watch(searchTerm, handleSearch)
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
    <UButton
      icon="i-heroicons-magnifying-glass-solid"
      @click="handleSearch"
      :disabled="!searchTerm"
      title="Buscar producto"
    >
      <span class="hidden md:inline">Buscar</span>
    </UButton>
  </div>
</template> 