<script setup lang="ts">
import { useUserRole } from '~/composables/arestricted'

const { canEdit, canDelete } = useUserRole()

// Debug log para verificar el rol
console.log('User permissions in PajillaExpandedCard:', { canEdit: canEdit.value, canDelete: canDelete.value })

interface Pajilla {
  id: number
  pajilla: string
  stock: number
  animal_id: string | null
  fecha_uso: string | null
  descripcion: string | null
  created_at: string
  updated_at: string
}

const props = defineProps<{
  pajilla: Pajilla
}>()

const emit = defineEmits(['updated'])
const toast = useToast()
const isEditing = ref(false)
const isLoading = ref(false)

type FormState = {
  pajilla: string
  stock: number
  animal_id: string
  fecha_uso: string
  descripcion: string
}

const formState = reactive<FormState>({
  pajilla: props.pajilla.pajilla,
  stock: props.pajilla.stock,
  animal_id: props.pajilla.animal_id || '',
  fecha_uso: props.pajilla.fecha_uso ? props.pajilla.fecha_uso.split('T')[0] : '',
  descripcion: props.pajilla.descripcion || ''
})

const validations: {
  [K in keyof FormState]: Array<(value: FormState[K]) => true | string>
} = {
  pajilla: [(value: string) => !!value || 'Campo obligatorio'],
  stock: [
    (value: number) => !!value || 'Campo obligatorio',
    (value: number) => value >= 0 || 'No puede ser negativo'
  ],
  animal_id: [(value: string) => true], // Opcional
  fecha_uso: [(value: string) => true], // Opcional
  descripcion: [(value: string) => true] // Opcional
}

const handleUpdate = async () => {
  if (!Object.entries(validations).every(([key, rules]) =>
    (rules as Array<(value: any) => true | string>).every(rule =>
      rule((formState as any)[key]) === true
    )
  )) {
    toast.add({
      title: 'Validación fallida',
      description: 'Verifica los campos requeridos',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error'
    })
    return
  }

  isLoading.value = true
  try {
    const payload = {
      pajilla: formState.pajilla,
      stock: formState.stock,
      animal_id: formState.animal_id || null,
      fecha_uso: formState.fecha_uso || null,
      descripcion: formState.descripcion || null
    }

    await $fetch(`/api/pajillas/${props.pajilla.id}`, {
      method: 'PUT',
      body: payload
    })

    toast.add({
      title: 'Actualización exitosa',
      description: 'La pajilla se actualizó correctamente',
      icon: 'i-heroicons-check-badge',
      color: 'success'
    })

    emit('updated')
    isEditing.value = false
  } catch (error: any) {
    toast.add({
      title: 'Error de actualización',
      description: error.data?.message || 'Error al guardar los cambios',
      icon: 'i-heroicons-x-circle',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta pajilla?')) return

  isLoading.value = true
  try {
    await $fetch(`/api/pajillas/${props.pajilla.id}`, { method: 'DELETE' })

    toast.add({
      title: 'Eliminación exitosa',
      description: 'La pajilla se eliminó correctamente',
      icon: 'i-heroicons-check-badge',
      color: 'success'
    })

    emit('updated')
  } catch (error: any) {
    toast.add({
      title: 'Error de eliminación',
      description: error.data?.message || 'Error al eliminar la pajilla',
      icon: 'i-heroicons-x-circle',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Detalles de la Pajilla</h3>
        <div class="flex gap-2">
          <UButton 
            v-if="!isEditing && canEdit" 
            icon="i-heroicons-pencil-square" 
            color="primary" 
            @click="isEditing = true" 
          />
          <UButton 
            v-if="canDelete"
            icon="i-heroicons-trash" 
            color="error" 
            @click="handleDelete"
            :loading="isLoading"
          />
          <template v-if="isEditing">
            <UButton icon="i-heroicons-x-mark" color="error" @click="isEditing = false" />
            <UButton icon="i-heroicons-check" color="success" :loading="isLoading" @click="handleUpdate" />
          </template>
        </div>
      </div>
    </template>

    <!-- Responsive grid with more columns -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Campo Código de Pajilla -->
      <UFormField label="Código de Pajilla" :required="true"
        :error="validations.pajilla.find(v => typeof v(formState.pajilla) === 'string')?.(formState.pajilla)">
        <template v-if="isEditing">
          <UInput v-model="formState.pajilla" placeholder="Ingrese el código de la pajilla" />
        </template>
        <template v-else>
          <p class="py-2 px-3 font-medium text-primary">{{ formState.pajilla }}</p>
        </template>
      </UFormField>

      <!-- Campo Stock -->
      <UFormField label="Stock" :required="true"
        :error="validations.stock.find(v => typeof v(formState.stock) === 'string')?.(formState.stock)">
        <template v-if="isEditing">
          <UInput v-model.number="formState.stock" type="number" min="0" />
        </template>
        <template v-else>
          <UBadge :color="formState.stock > 0 ? 'success' : 'error'" :variant="formState.stock > 0 ? 'subtle' : 'solid'">
            {{ formState.stock }}
          </UBadge>
        </template>
      </UFormField>

      <!-- Campo Animal ID -->
      <UFormField label="Animal ID"
        :error="validations.animal_id.find(v => typeof v(formState.animal_id) === 'string')?.(formState.animal_id)">
        <template v-if="isEditing">
          <UInput v-model="formState.animal_id" placeholder="ID del animal (opcional)" />
        </template>
        <template v-else>
          <p class="py-2 px-3">
            <span v-if="formState.animal_id" class="font-mono text-sm">{{ formState.animal_id }}</span>
            <span v-else class="text-muted italic">Sin asignar</span>
          </p>
        </template>
      </UFormField>

      <!-- Campo Fecha de Uso -->
      <UFormField label="Fecha de Uso"
        :error="validations.fecha_uso.find(v => typeof v(formState.fecha_uso) === 'string')?.(formState.fecha_uso)">
        <template v-if="isEditing">
          <UInput v-model="formState.fecha_uso" type="date" />
        </template>
        <template v-else>
          <p class="py-2 px-3">
            <span v-if="formState.fecha_uso">{{ new Date(formState.fecha_uso).toLocaleDateString() }}</span>
            <span v-else class="text-muted italic">—</span>
          </p>
        </template>
      </UFormField>

      <!-- Campo Descripción -->
      <UFormField label="Descripción"
        :error="validations.descripcion.find(v => typeof v(formState.descripcion) === 'string')?.(formState.descripcion)">
        <template v-if="isEditing">
          <UTextarea v-model="formState.descripcion" placeholder="Descripción adicional (opcional)" />
        </template>
        <template v-else>
          <p class="py-2 px-3">
            <span v-if="formState.descripcion">{{ formState.descripcion }}</span>
            <span v-else class="text-muted italic">Sin descripción</span>
          </p>
        </template>
      </UFormField>
    </div>
  </UCard>
</template> 