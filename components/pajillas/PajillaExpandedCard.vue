<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'
import { useUserRole } from '~/composables/arestricted'
import type { InventarioPajilla, MovimientoPajilla } from '~/types/pajillas'
import SelectVacaDrawer from './SelectVacaDrawer.vue'

const { canEdit } = useUserRole()

const props = defineProps<{
  pajilla: InventarioPajilla
}>()

const emit = defineEmits(['updated'])
const toast = useToast()
const isLoading = ref(false)
const movimientos = ref<(MovimientoPajilla & { tipo?: string, raza?: string })[]>([])
const showDrawer = ref(false)
const showSelectAnimalDrawer = ref(false)
const selectedAnimals = ref<{ id_animal: string, tipo_animal: string, raza: string }[]>([])

// Estados para modales
const showEditPajillaModal = ref(false)
const showEditUsoModal = ref(false)
const usoSeleccionado = ref<any>({})
const showDeleteConfirm = ref(false)
const usoAEliminar = ref<{ id: number } | null>(null)

// Formulario para editar pajilla
const editPajillaForm = ref({
  pajilla: '',
  fecha_ingreso: '',
  stock: 0,
  descripcion: ''
})

const pajillaLocal: Ref<InventarioPajilla> = ref({ ...props.pajilla })

// Type guard para evitar errores de acceso nulo
function isAnimal(obj: unknown): obj is { id_animal: string, tipo_animal: string, raza: string } {
  return !!obj && typeof obj === 'object' && 'id_animal' in obj && 'tipo_animal' in obj && 'raza' in obj
}

const selectedAnimalSafe = computed(() => isAnimal(selectedAnimals.value[0]) ? selectedAnimals.value[0] : null)

const fetchMovimientos = async () => {
  try {
    const res = await $fetch<{ movimientos: MovimientoPajilla[] }>(`/api/pajillas/${props.pajilla.id}/movimientos`)
    // Solo mostrar movimientos de salida
    const salidas = res.movimientos.filter(m => m.tipo_movimiento === 'SALIDA')
    const animalesIds = salidas.map(m => m.animal_id).filter(Boolean)
    let animales: Record<string, { tipo_animal: string, raza: string }> = {}
    if (animalesIds.length > 0) {
      const animalesRes = await $fetch<{ animals: any[] }>(`/api/animals/batch`, {
        method: 'POST',
        body: { ids: animalesIds }
      })
      animalesRes.animals.forEach(a => {
        animales[a.id_animal] = { tipo_animal: a.tipo_animal, raza: a.raza }
      })
    }
    movimientos.value = salidas.map(m => ({
      ...m,
      tipo: m.animal_id ? animales[m.animal_id]?.tipo_animal : undefined,
      raza: m.animal_id ? animales[m.animal_id]?.raza : undefined
    }))
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'No se pudo cargar el historial de movimientos',
      color: 'error',
    })
  }
}

onMounted(fetchMovimientos)

// Formulario para registrar salida
const salidaForm = ref({
  cantidad: 1,
  fecha: new Date().toISOString().split('T')[0],
  animal_id: '',
  observaciones: ''
})

const registrarSalida = async () => {
  if (!salidaForm.value.animal_id || salidaForm.value.cantidad <= 0) {
    toast.add({ title: 'Datos incompletos', color: 'error' })
    return
  }
  isLoading.value = true
  try {
    await $fetch('/api/pajillas/movimiento', {
      method: 'POST',
      body: {
        pajilla_id: props.pajilla.id,
        tipo_movimiento: 'SALIDA',
        cantidad: salidaForm.value.cantidad,
        fecha: salidaForm.value.fecha,
        animal_id: salidaForm.value.animal_id,
        observaciones: salidaForm.value.observaciones
      }
    })
    toast.add({ title: 'Salida registrada', color: 'success' })
    showDrawer.value = false
    fetchMovimientos()
    emit('updated')
    selectedAnimals.value = []
    salidaForm.value.animal_id = ''
  } catch (error) {
    toast.add({ title: 'Error al registrar salida', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

// Añadir función para manejar la selección de animal en edición de uso
function handleSelectAnimalEdit(animals: { id_animal: string, tipo_animal?: string, raza?: string }[]) {
  if (animals && animals.length > 0) {
    usoSeleccionado.value.animal_id = animals[0].id_animal
  }
  showSelectAnimalDrawer.value = false
}

// Corregir handleSelectAnimals para asignar el id al formulario de salida
function handleSelectAnimals(animals: { id_animal: string, tipo_animal: string, raza: string }[]) {
  selectedAnimals.value = animals
  salidaForm.value.animal_id = animals.length > 0 ? animals[0].id_animal : ''
  showSelectAnimalDrawer.value = false
}

function openEditPajillaModal() {
  editPajillaForm.value = {
    pajilla: pajillaLocal.value.pajilla,
    fecha_ingreso: pajillaLocal.value.fecha_ingreso.split('T')[0],
    stock: pajillaLocal.value.stock_inicial ?? pajillaLocal.value.stock,
    descripcion: pajillaLocal.value.descripcion || ''
  }
  showEditPajillaModal.value = true
}

function openEditUsoModal(uso: any) {
  usoSeleccionado.value = { ...uso }
  showEditUsoModal.value = true
}

// Métodos para editar/eliminar (implementación real después)
async function fetchPajilla() {
  const data = await $fetch<InventarioPajilla>(`/api/pajillas/${props.pajilla.id}`)
  pajillaLocal.value = data
}

async function editarPajilla() {
  isLoading.value = true
  try {
    await $fetch(`/api/pajillas/${props.pajilla.id}`, {
      method: 'PUT',
      body: {
        pajilla: editPajillaForm.value.pajilla,
        stock: editPajillaForm.value.stock,
        fecha_ingreso: editPajillaForm.value.fecha_ingreso,
        descripcion: editPajillaForm.value.descripcion
      }
    })
    toast.add({ title: 'Pajilla actualizada', color: 'success' })
    showEditPajillaModal.value = false
    await fetchPajilla()
    emit('updated')
  } catch (error) {
    toast.add({ title: 'Error al actualizar pajilla', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

// Implementar editarUso para guardar cambios
async function editarUso() {
  if (!usoSeleccionado.value.animal_id || usoSeleccionado.value.cantidad <= 0) {
    toast.add({ title: 'Datos incompletos', color: 'error' })
    return
  }
  isLoading.value = true
  try {
    await $fetch(`/api/pajillas/movimiento/${usoSeleccionado.value.id}`, {
      method: 'PUT',
      body: {
        cantidad: usoSeleccionado.value.cantidad,
        fecha: usoSeleccionado.value.fecha,
        animal_id: usoSeleccionado.value.animal_id,
        observaciones: usoSeleccionado.value.observaciones
      }
    })
    toast.add({ title: 'Uso actualizado', color: 'success' })
    showEditUsoModal.value = false
    fetchMovimientos()
    emit('updated')
  } catch (error) {
    toast.add({ title: 'Error al actualizar uso', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

async function eliminarUso(uso: { id: number }) {
  if (!uso || !uso.id) return
  usoAEliminar.value = uso
  showDeleteConfirm.value = true
}

async function confirmarEliminarUso() {
  if (!usoAEliminar.value) return
  isLoading.value = true
  try {
    await $fetch(`/api/pajillas/movimiento/${usoAEliminar.value.id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Uso eliminado', color: 'success' })
    fetchMovimientos()
    emit('updated')
  } catch (error) {
    toast.add({ title: 'Error al eliminar uso', color: 'error' })
  } finally {
    isLoading.value = false
    usoAEliminar.value = null
    showDeleteConfirm.value = false
  }
}

const columns = [
  { label: 'ID', value: (row: MovimientoPajilla) => row.animal_id },
  { label: 'Tipo', value: (row: any) => row.tipo || '—' },
  { label: 'Raza', value: (row: any) => row.raza || '—' },
  { label: 'Fecha de Uso', value: (row: MovimientoPajilla) => new Date(row.fecha).toLocaleDateString() },
  { label: 'Cantidad Usada', value: (row: MovimientoPajilla) => row.cantidad },
  { label: 'Observaciones', value: (row: MovimientoPajilla) => row.observaciones || '—' },
  { label: 'Acciones', value: (row: any) => row } // Para los botones
]
</script>

<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Detalles de la Pajilla</h3>
        <div class="flex gap-2">
          <UButton icon="i-heroicons-pencil-square" color="neutral" variant="soft" class="!text-gray-800 dark:!text-gray-100" @click="openEditPajillaModal" size="sm" title="Editar pajilla" />
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <div><b>Código:</b> {{ pajillaLocal.pajilla }}</div>
      <div><b>Fecha Ingreso:</b> {{ new Date(pajillaLocal.fecha_ingreso).toLocaleDateString() }}</div>
      <div><b>Stock Inicial:</b> {{ pajillaLocal.stock_inicial ?? pajillaLocal.stock }}</div>
      <div><b>Salidas:</b> {{ pajillaLocal.total_salidas }}</div>
      <div><b>Stock Final:</b> <span :class="pajillaLocal.inventario_final > 0 ? 'text-green-600' : 'text-red-600'">{{ pajillaLocal.inventario_final }}</span></div>
      <div class="col-span-3"><b>Descripción:</b> {{ pajillaLocal.descripcion || 'Sin descripción' }}</div>
    </div>

    <!-- Botón para abrir el modal de asignación -->
    <div class="flex justify-end mb-6">
      <UButton color="primary" @click="showDrawer = true">Asignar</UButton>
    </div>
    <!-- Modal de asignación de animal(es) -->
    <UModal v-model:open="showDrawer" title="Asignar Animal(es) a esta Pajilla" description="Registra la salida de pajilla para uno o más animales" class="max-w-3xl w-full">
      <template #body>
        <UForm :state="salidaForm" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="registrarSalida">
          <UFormField name="cantidad">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Cantidad</span>
            </template>
            <UInput v-model.number="salidaForm.cantidad" type="number" min="1" :max="props.pajilla.inventario_final" />
          </UFormField>
          <UFormField name="fecha">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Fecha</span>
            </template>
            <UInput v-model="salidaForm.fecha" type="date" />
          </UFormField>
          <UFormField name="animal">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Animal(es)</span>
            </template>
            <UButton color="primary" variant="soft" @click.prevent="showSelectAnimalDrawer = true">Seleccionar Animal(es)</UButton>
            <div v-if="selectedAnimals.length > 0" class="mt-2">
              <div v-for="animal in selectedAnimals" :key="animal.id_animal" class="mb-1">
                <b>ID:</b> {{ animal.id_animal }} | <b>Tipo:</b> {{ animal.tipo_animal }} | <b>Raza:</b> {{ animal.raza }}
              </div>
            </div>
            <div v-else class="mt-2 text-muted italic">Ningún animal seleccionado</div>
            <SelectVacaDrawer
              v-model="showSelectAnimalDrawer"
              @select="handleSelectAnimals"
            />
          </UFormField>
          <UFormField name="observaciones" class="sm:col-span-2">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Observaciones</span>
            </template>
            <UTextarea v-model="salidaForm.observaciones" placeholder="Observaciones (opcional)" />
          </UFormField>
          <div class="col-span-2 flex justify-end gap-4 mt-4">
            <UButton type="button" variant="ghost" @click="showDrawer = false">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="isLoading">Asignar</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <h4 class="font-semibold mb-2">Usos de esta Pajilla</h4>
    <table class="w-full text-sm mb-4">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.label" class="text-left p-2">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mov in movimientos" :key="mov.id">
          <td v-for="col in columns" :key="col.label" class="p-2">
            <template v-if="col.label !== 'Acciones'">
              {{ col.value(mov) }}
            </template>
            <template v-else>
              <div class="flex gap-2">
                <UButton color="neutral" variant="soft" size="xs" class="!inline-block !opacity-100 !visible !text-gray-800 dark:!text-gray-100" @click="openEditUsoModal(mov)" title="Editar uso">Editar</UButton>
                <UButton icon="i-heroicons-trash" color="error" variant="soft" size="xs" @click="eliminarUso(mov)" title="Eliminar uso" />
              </div>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modales -->
    <UModal v-model:open="showEditPajillaModal" title="Editar Detalles de la Pajilla" description="Modifica la información de la pajilla" class="max-w-3xl w-full">
      <template #body>
        <UForm :state="editPajillaForm" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="editarPajilla">
          <UFormField name="pajilla">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Código de Pajilla</span>
            </template>
            <UInput v-model="editPajillaForm.pajilla" placeholder="Ej: BRA-001-2024" />
          </UFormField>
          <UFormField name="stock">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Stock Inicial</span>
            </template>
            <UInput v-model.number="editPajillaForm.stock" type="number" min="0" />
          </UFormField>
          <UFormField name="fecha_ingreso">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Fecha de Ingreso</span>
            </template>
            <UInput v-model="editPajillaForm.fecha_ingreso" type="date" />
          </UFormField>
          <UFormField name="descripcion">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Descripción / Observaciones</span>
            </template>
            <UTextarea v-model="editPajillaForm.descripcion" placeholder="Observaciones, detalles, etc." />
          </UFormField>
          <div class="col-span-2 flex justify-end gap-4 mt-4">
            <UButton type="button" variant="ghost" @click="showEditPajillaModal = false">Cancelar</UButton>
            <UButton type="submit" color="primary">Guardar</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
    <UModal v-model:open="showEditUsoModal" title="Editar Uso de Pajilla" description="Modifica la información del uso de la pajilla" class="max-w-3xl w-full">
      <template #body>
        <UForm :state="usoSeleccionado" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="editarUso" v-if="usoSeleccionado">
          <UFormField name="cantidad">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Cantidad</span>
            </template>
            <UInput v-model.number="usoSeleccionado.cantidad" type="number" min="1" />
          </UFormField>
          <UFormField name="fecha">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Fecha</span>
            </template>
            <UInput v-model="usoSeleccionado.fecha" type="date" />
          </UFormField>
          <UFormField name="animal">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Animal</span>
            </template>
            <UButton color="primary" variant="soft" @click.prevent="showSelectAnimalDrawer = true">Seleccionar Animal</UButton>
            <div v-if="usoSeleccionado.animal_id" class="mt-2">
              <b>ID:</b> {{ usoSeleccionado.animal_id }}
            </div>
            <SelectVacaDrawer
              v-model="showSelectAnimalDrawer"
              @select="handleSelectAnimalEdit"
            />
          </UFormField>
          <UFormField name="observaciones" class="sm:col-span-2">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Observaciones</span>
            </template>
            <UTextarea v-model="usoSeleccionado.observaciones" placeholder="Observaciones (opcional)" />
          </UFormField>
          <div class="col-span-2 flex justify-end gap-4 mt-4">
            <UButton type="button" variant="ghost" @click="showEditUsoModal = false">Cancelar</UButton>
            <UButton type="submit" color="primary">Guardar</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
    <UModal v-model:open="showDeleteConfirm" title="Confirmar eliminación" description="¿Estás seguro de que deseas eliminar este uso de pajilla?" class="max-w-md w-full">
      <template #body>
        <div class="mb-4">¿Estás seguro de que deseas eliminar este uso de pajilla?</div>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showDeleteConfirm = false">Cancelar</UButton>
          <UButton color="error" @click="confirmarEliminarUso" :loading="isLoading">Eliminar</UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template> 