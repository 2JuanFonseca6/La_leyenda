<script setup lang="ts">
const searchTerm = ref('')
const emit = defineEmits(['search'])

const handleSearch = () => {
  emit('search', searchTerm.value.trim())
}

watch(searchTerm, () => {
  emit('search', searchTerm.value.trim())
})
</script>

<template>
  <div class="flex gap-2 max-w-xl mx-auto p-4">
    <UInput
      v-model="searchTerm"
      placeholder="Buscar por ID de reproducción, madre o padre"
      class="flex-1 font-mono"
      @keyup.enter="handleSearch"
    />
    <UButton
      icon="i-heroicons-magnifying-glass-solid"
      @click="handleSearch"
      :disabled="!searchTerm"
      title="Buscar reproducción"
    >
      <span class="hidden md:inline">Buscar</span>
    </UButton>
  </div>
</template> 