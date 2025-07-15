<script setup lang="ts">
import { useUserRole } from '~/composables/arestricted'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()

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
  factura_url?: string | null
}

const formState = reactive<FormState>({
  tipo: props.item.tipo,
  descripcion: props.item.descripcion,
  cantidad: props.item.cantidad,
  precio: props.item.precio,
  proveedor_id: props.item.proveedor_id,
  factura_url: props.item.factura_url ?? undefined
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

const handleDelete = async () => {
  if (!confirm('¿Seguro que deseas eliminar este producto del inventario? Esta acción no se puede deshacer.')) return
  isLoading.value = true
  try {
    const res = await $fetch('/api/stock/stock', { method: 'DELETE', body: { ids: [props.item.id_inventario] } })
    toast.add({
      title: 'Producto eliminado',
      description: res?.message || 'El producto fue eliminado correctamente del inventario.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
    emit('updated')
  } catch (e: any) {
    toast.add({
      title: 'Error al eliminar producto',
      description: e.data?.message || e.message || 'No se pudo eliminar el producto. Intenta de nuevo.',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
    })
  } finally {
    isLoading.value = false
  }
}

const facturaInput = ref<HTMLInputElement | null>(null)

const handleFacturaFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  isLoading.value = true;
  try {
    console.log('Iniciando subida de factura...');
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-factura-inventario-${props.item.id_inventario}.${fileExt}`;
    console.log('Nombre del archivo:', fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('inventario-image')
      .upload(fileName, file);
    
    if (uploadError) {
      console.error('Error en upload:', uploadError);
      throw uploadError;
    }
    
    console.log('Archivo subido exitosamente:', uploadData);
    
    const { data: { publicUrl } } = supabase.storage
      .from('inventario-image')
      .getPublicUrl(fileName);
    
    if (!publicUrl) throw new Error('No se pudo obtener la URL pública de la factura');
    console.log('URL pública obtenida:', publicUrl);
    
    // Actualizar en la base de datos
    console.log('Actualizando base de datos...');
    await $fetch(`/api/stock/specific/${props.item.id_inventario}`, {
      method: 'PUT',
      body: { factura_url: publicUrl },
    });
    // Refrescar el registro desde el backend para obtener el valor actualizado
    const updated = await $fetch(`/api/stock/specific/${props.item.id_inventario}`);
    formState.factura_url = updated.factura_url ?? undefined;
    emit('updated');
    toast.add({
      title: 'Factura cargada',
      description: 'La factura se ha guardado correctamente.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    });
  } catch (error: any) {
    console.error('Error completo:', error);
    toast.add({
      title: 'Error al subir factura',
      description: error?.message || 'No se pudo subir la factura.',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
    });
  } finally {
    isLoading.value = false;
    if (facturaInput.value) facturaInput.value.value = '';
  }
}

const isFacturaModalOpen = ref(false)
const isDeleteFacturaModalOpen = ref(false) // NUEVO: estado para modal de confirmación de eliminación

function openFacturaModal() {
  isFacturaModalOpen.value = true
}
function closeFacturaModal() {
  isFacturaModalOpen.value = false
}

const handleDeleteFactura = async () => {
  if (!formState.factura_url) return;
  // Eliminar confirm nativo, ahora se usará el modal
  isDeleteFacturaModalOpen.value = true;
};

// Nueva función: ejecutar la eliminación real tras confirmar en el modal
const confirmDeleteFactura = async () => {
  isDeleteFacturaModalOpen.value = false;
  isLoading.value = true;
  try {
    // Eliminar del storage
    const fileName = formState.factura_url?.split('/')?.pop();
    if (fileName) {
      const { error: deleteError } = await supabase.storage
        .from('inventario-image')
        .remove([fileName]);
      if (deleteError) throw deleteError;
    }
    // Actualizar en la base de datos
    await $fetch(`/api/stock/specific/${props.item.id_inventario}`, {
      method: 'PUT',
      body: { factura_url: null },
    });
    formState.factura_url = undefined;
    toast.add({
      title: 'Factura eliminada',
      description: 'La factura fue eliminada correctamente.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    });
    emit('updated');
  } catch (error: any) {
    toast.add({
      title: 'Error al eliminar factura',
      description: error?.message || 'No se pudo eliminar la factura.',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Detalles del Producto</h3>
        <div class="flex gap-2">
          <UButton v-if="userRole === 'admin'" icon="i-heroicons-trash" color="error" @click="handleDelete" :loading="isLoading" title="Eliminar producto" />
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
      <UFormField label="Valor Total (COP)" :required="true"
        :error="validations.precio.find(v => typeof v(formState.precio) === 'string')?.(formState.precio)">
        <template v-if="isEditing">
          <UInput v-model.number="formState.precio" type="number" />
        </template>
        <template v-else>
          <p class="py-2 px-3">{{ formState.precio }}</p>
          <p v-if="formState.cantidad > 0" class="text-xs text-gray-400 mt-1">Precio Unitario: {{ (formState.precio / formState.cantidad).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}</p>
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
    <!-- Factura debajo de toda la información -->
    <div class="mt-6">
      <UFormField label="Factura (imagen o PDF)">
        <input type="file" ref="facturaInput" accept="image/*,application/pdf" @change="handleFacturaFileChange" class="block mt-2" />
        <div v-if="formState.factura_url" class="mt-4 flex flex-col items-center gap-4">
          <template v-if="formState.factura_url.endsWith('.pdf')">
            <NuxtLink
              :to="`/ver-pdf?url=${encodeURIComponent(formState.factura_url)}`"
              target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              <UIcon name="i-heroicons-document" />
              Ver/Descargar PDF
            </NuxtLink>
          </template>
          <template v-else>
            <div class="flex flex-col items-center">
              <div class="flex justify-center items-center bg-white border rounded shadow max-w-xs max-h-60 p-2 cursor-pointer" @click="openFacturaModal">
                <img
                  :src="formState.factura_url"
                  alt="Factura"
                  class="object-contain max-h-56 max-w-xs mx-auto"
                  style="background: #fff;"
                />
              </div>
              <UButton
                class="mt-2"
                color="primary"
                icon="i-heroicons-arrow-down-tray"
                :href="formState.factura_url"
                download
                target="_blank"
              >Descargar Imagen</UButton>
            </div>
            <!-- Modal para ampliar imagen -->
            <UModal v-model:open="isFacturaModalOpen" title="Factura" :dismissible="true" @close="closeFacturaModal">
              <template #body>
                <div class="flex flex-col items-center justify-center">
                  <img :src="formState.factura_url" alt="Factura ampliada" class="max-w-full max-h-[80vh] rounded shadow" />
                  <UButton
                    class="mt-4"
                    color="primary"
                    icon="i-heroicons-arrow-down-tray"
                    :href="formState.factura_url"
                    download
                    target="_blank"
                  >Descargar Imagen</UButton>
                </div>
              </template>
            </UModal>
          </template>
          <UButton color="error" icon="i-heroicons-trash" @click="handleDeleteFactura" :loading="isLoading">Eliminar Factura</UButton>
        </div>
        <div v-else class="text-xs text-gray-400 mt-2">No hay factura adjunta</div>
      </UFormField>
    </div>
    <UModal v-model:open="isDeleteFacturaModalOpen" title="Eliminar Factura" :dismissible="false">
      <template #body>
        <div class="space-y-4">
          <p class="text-red-500 dark:text-red-300">
            ¿Seguro que deseas eliminar la factura adjunta? Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end gap-3 mt-4">
            <UButton color="primary" variant="ghost" :disabled="isLoading" @click="isDeleteFacturaModalOpen = false">
              Cancelar
            </UButton>
            <UButton color="error" :loading="isLoading" @click="confirmDeleteFactura">
              Confirmar Eliminación
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
