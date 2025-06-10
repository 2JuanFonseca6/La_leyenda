<script setup lang="ts">
import { useUserRole } from '~/composables/arestricted'

const { userRole } = useUserRole()

const props = defineProps<{
  item: InventoryItem
}>()

const emit = defineEmits(['updated'])
const toast = useToast()
const isEditing = ref(false)
const isLoading = ref(false)

type FormState = {
  tipo: string
  descripcion: string
  cantidad: number
  precio: number
  proveedor_id: string
}

const formState = reactive<FormState>({
  tipo: props.item.tipo,
  descripcion: props.item.descripcion,
  cantidad: props.item.cantidad,
  precio: props.item.precio,
  proveedor_id: props.item.proveedor_id
})

// Tipos de artículos disponibles
const tiposArticulos = ['SALUD', 'ALIMENTOS', 'ELEMENTOS']

const validations: {
  [K in keyof FormState]: Array<(value: FormState[K]) => true | string>
} = {
  tipo: [(value: string) => !!value || 'Campo obligatorio'],
  descripcion: [(value: string) => !!value || 'Campo obligatorio'],
  cantidad: [
    (value: number) => !!value || 'Campo obligatorio',
    (value: number) => value >= 0 || 'No puede ser negativo'
  ],
  precio: [
    (value: number) => !!value || 'Campo obligatorio',
    (value: number) => value >= 0 || 'No puede ser negativo'
  ],
  proveedor_id: [(value: string) => !!value || 'Campo obligatorio']
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
    const { data } = await $fetch(`/api/stock/specific/${props.item.id_inventario}`, {
      method: 'PUT',
      body: formState
    })

    toast.add({
      title: 'Actualización exitosa',
      description: 'El registro se actualizó correctamente',
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
</script>

<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Detalles del Inventario</h3>
        <div class="flex gap-2">
          <UButton v-if="!isEditing && userRole === 'admin'" icon="i-heroicons-pencil-square" color="primary" @click="isEditing = true" />
          <template v-else-if="userRole === 'admin'">
            <UButton icon="i-heroicons-x-mark" color="error" @click="isEditing = false" />
            <UButton icon="i-heroicons-check" color="success" :loading="isLoading" @click="handleUpdate" />
          </template>
        </div>
      </div>
    </template>

    <!-- Responsive grid with more columns -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Campo Tipo -->
      <UFormField label="Tipo" :required="true"
        :error="validations.tipo.find(v => typeof v(formState.tipo) === 'string')?.(formState.tipo)">
        <template v-if="isEditing">
          <USelect v-model="formState.tipo" :items="tiposArticulos.map(t => ({
            label: t === 'SALUD' ? 'Salud' : t === 'ALIMENTOS' ? 'Alimentos' : 'Elementos',
            value: t,
          }))" placeholder="Selecciona un tipo" variant="ghost"
            class="border border-[var(--color-custom-300)] cursor-pointer bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)]" />
        </template>
        <template v-else>
          <p class="py-2 px-3">
            {{
              formState.tipo === 'SALUD'
                ? 'Salud'
                : formState.tipo === 'ALIMENTOS'
                  ? 'Alimentos'
                  : 'Elementos'
            }}
          </p>
        </template>
      </UFormField>

      <!-- Campo Descripción -->
      <UFormField label="Descripción" :required="true"
        :error="validations.descripcion.find(v => typeof v(formState.descripcion) === 'string')?.(formState.descripcion)">
        <template v-if="isEditing">
          <UTextarea v-model="formState.descripcion" />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.descripcion }}</p>
        </template>
      </UFormField>

      <!-- Campo Cantidad -->
      <UFormField label="Cantidad" :required="true"
        :error="validations.cantidad.find(v => typeof v(formState.cantidad) === 'string')?.(formState.cantidad)">
        <template v-if="isEditing">
          <UInput v-model.number="formState.cantidad" type="number" />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.cantidad }}</p>
        </template>
      </UFormField>

      <!-- Campo Precio -->
      <UFormField label="Precio (COP)" :required="true"
        :error="validations.precio.find(v => typeof v(formState.precio) === 'string')?.(formState.precio)">
        <template v-if="isEditing">
          <UInput v-model.number="formState.precio" type="number" />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.precio }}</p>
        </template>
      </UFormField>

      <!-- Campo Proveedor ID -->
      <UFormField label="Proveedor ID" :required="true"
        :error="validations.proveedor_id.find(v => typeof v(formState.proveedor_id) === 'string')?.(formState.proveedor_id)">
        <template v-if="isEditing">
          <UInput v-model="formState.proveedor_id" />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.proveedor_id }}</p>
        </template>
      </UFormField>
    </div>
  </UCard>
</template>
