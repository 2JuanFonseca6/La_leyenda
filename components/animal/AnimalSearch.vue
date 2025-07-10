<script setup lang="ts">
const animalId = ref('')
const router = useRouter()

const searchAnimal = () => {
  if (!animalId.value) return
  router.push(`/animals/specific/${animalId.value}`)
}
</script>

<template>
  <div class="flex gap-2 max-w-xl mx-auto p-4">
    <UInput v-model="animalId" placeholder="Ingrese el ID del animal (Recuerde las mayúsculas y minúsculas)"
      class="flex-1 font-mono" @keyup.enter="searchAnimal" />
    <UButton icon="i-heroicons-magnifying-glass-solid" @click="searchAnimal" :disabled="!animalId"
      title="Buscar animal, recuerde las mayúsculas y minúsculas">
      <span class="hidden md:inline">Buscar</span>
    </UButton>
  </div>
</template>