<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue', 'search'])

const searchTerm = ref(props.modelValue || '')
let timeoutId: NodeJS.Timeout | null = null

const handleInput = (val: string) => {
  searchTerm.value = val
  emit('update:modelValue', val)
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    emit('search', val.trim())
  }, 300)
}

watch(() => props.modelValue, (val) => {
  if (val !== searchTerm.value) searchTerm.value = val
})

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <div class="flex gap-2 max-w-xl mx-auto p-4">
    <UInput 
      v-model="searchTerm"
      placeholder="Ingrese el ID, raza o tipo de animal..."
      class="flex-1 font-mono" 
      @input="handleInput($event)"
    />
    <UButton 
      icon="i-heroicons-magnifying-glass-solid" 
      @click="emit('search', searchTerm.trim())" 
      :disabled="!searchTerm.trim()"
      title="Buscar animal"
    >
      <span class="hidden md:inline">Buscar</span>
    </UButton>
  </div>
</template>