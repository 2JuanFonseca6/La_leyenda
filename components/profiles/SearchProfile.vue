<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const searchTerm = ref('')
const results = ref<any[]>([])
const isSearching = ref(false)
const selectedProfile = ref<any>(null)
const showDeleteModal = ref(false)
const toast = useToast()

const emit = defineEmits(['deleted'])

let timeoutId: NodeJS.Timeout | null = null

const handleSearch = async (term: string) => {
  if (term.length < 2) {
    results.value = []
    return
  }

  try {
    isSearching.value = true
    const data = await $fetch('/api/profiles/search', {
      params: { q: term }
    })
    results.value = data
  } catch (error: any) {
    toast.add({
      title: 'Error en búsqueda',
      description: error.data?.message || 'Error al realizar la búsqueda',
      color: 'error',
      icon: 'i-heroicons-x-circle'
    })
  } finally {
    isSearching.value = false
  }
}

const handleInput = (event: Event) => {
  const term = (event.target as HTMLInputElement).value.trim()
  searchTerm.value = term

  if (timeoutId) clearTimeout(timeoutId)

  timeoutId = setTimeout(() => {
    handleSearch(term)
  }, 300)
}

const selectProfile = (profile: any) => {
  selectedProfile.value = profile
  results.value = [] // Limpiar resultados de búsqueda
}

const clearSelection = () => {
  selectedProfile.value = null
}

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})

const deleteProfile = async () => {
  if (!selectedProfile.value) return

  const confirmDelete = window.confirm(`¿Estás seguro que deseas eliminar a ${selectedProfile.value.name}?`)
  if (!confirmDelete) return

  try {
    const res = await $fetch('/api/profiles/delete', {
      method: 'DELETE',
      body: { ids: [selectedProfile.value.id] }
    })

    toast.add({
      title: 'Perfil eliminado',
      description: res.message || 'El perfil fue eliminado correctamente',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })

    emit('deleted')
    clearSelection()
  } catch (error: any) {
    toast.add({
      title: 'Error al eliminar',
      description: error.data?.message || 'No se pudo eliminar el perfil',
      color: 'error',
      icon: 'i-heroicons-x-circle'
    })
  } finally {
    showDeleteModal.value = false
  }
}
</script>

<template>
  <div class="relative w-full max-w-md space-y-4">
    <!-- Buscador -->
    <UInput 
      v-model="searchTerm"
      placeholder="Buscar por nombre o email..." 
      icon="i-heroicons-magnifying-glass" 
      :loading="isSearching"
      @input="handleInput" 
      class="w-full"
    />

    <!-- Resultados de búsqueda -->
    <Transition name="fade">
      <div v-if="results.length > 0"
        class="absolute z-10 w-full mt-2 bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] rounded-lg shadow-lg border border-[var(--color-custom-50)] dark:border-[var(--color-custom-500)]">
        <div class="p-2 space-y-2 max-h-96 overflow-y-auto">
          <div v-for="profile in results" :key="profile.id"
            class="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
            @click="selectProfile(profile)">
            <div class="flex items-center justify-between">
              <div>
                <p
                  class="font-medium text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)] truncate max-w-[200px]">
                  {{ profile.name || 'Sin nombre' }}
                </p>
                <p class="text-sm text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                  {{ profile.email }}
                </p>
              </div>
              <UBadge :label="profile.role" size="sm" :color="profile.role === 'admin' ? 'primary' : 'neutral'" />
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Estado sin resultados -->
    <Transition name="fade">
      <div v-if="results.length === 0 && searchTerm.length >= 2 && !isSearching"
        class="absolute z-10 w-full mt-2 bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] rounded-lg shadow-lg border border-[var(--color-custom-50)] dark:border-[var(--color-custom-500)] p-4 text-center text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)]">
        No se encontraron resultados
      </div>
    </Transition>

    <!-- Tarjeta de perfil seleccionado -->
    <Transition name="fade">
      <UCard v-if="selectedProfile" class="mt-4">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold truncate max-w-[200px]"
              :title="selectedProfile.name || 'Usuario sin nombre'">
              {{ selectedProfile.name || 'Usuario sin nombre' }}
            </h3>
            <div class="flex space-x-4">
              <UBadge :label="selectedProfile.role"
                :class="selectedProfile.role === 'admin' ? 'bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)]' : 'bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)]'" />
              <UButton variant="ghost" icon="i-heroicons-trash" @click="deleteProfile"
                class="bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] hover:text-[var(--color-custom-50)] hover:dark:text-[var(--color-custom-500)] rounded-full" />
              <UButton variant="ghost" icon="i-heroicons-x-mark" @click="clearSelection"
                class="bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] hover:text-[var(--color-custom-50)] hover:dark:text-[var(--color-custom-500)] rounded-full" />
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <div>
            <label
              class="text-sm font-medium text-[var(--color-custom-200)] dark:text-[var(--color-custom-400)]">Email</label>
            <p class="mt-1 text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)]">
              {{ selectedProfile.email }}
            </p>
          </div>

          <div>
            <label
              class="text-sm font-medium text-[var(--color-custom-200)] dark:text-[var(--color-custom-400)]">ID</label>
            <p class="mt-1 text-[var(--color-custom-50)] dark:text-[var(--color-custom-500)] text-sm">
              {{ selectedProfile.id }}
            </p>
          </div>
        </div>
      </UCard>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>