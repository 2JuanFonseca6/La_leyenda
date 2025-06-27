<script setup lang="ts">
import { ref, watch } from 'vue'
const searchTerm = ref('')
const emit = defineEmits(['search'])

watch(searchTerm, () => {
  emit('search', searchTerm.value.trim())
})
</script>

<template>
  <div class="flex gap-2 max-w-xl mx-auto p-4">
    <UInput
      v-model="searchTerm"
      placeholder="Buscar por código, animal, descripción..."
      class="flex-1 font-mono"
    />
    <UButton
      icon="i-heroicons-magnifying-glass-solid"
      :disabled="!searchTerm"
      title="Buscar pajilla"
    >
      <span class="hidden md:inline">Buscar</span>
    </UButton>
  </div>
</template> 