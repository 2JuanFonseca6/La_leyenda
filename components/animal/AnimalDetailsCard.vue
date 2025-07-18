<template>
  <UCard
    class="shadow-lg print:shadow-none print:w-full print:mt-[-55px] print:border print:border-gray-300"
    :class="{ 'print:hidden': !show }"
  >
    <!-- Modal de previsualización de imagen -->
    <UModal v-model:open="isPreviewOpen" title="Previsualización de Imagen" class="max-w-2xl w-full">
      <template #body>
        <div class="flex flex-col items-center">
          <img :src="previewImageUrl" alt="Imagen ampliada" class="max-h-[70vh] rounded shadow mb-4" />
          <UButton
            v-if="previewImageUrl"
            :href="previewImageUrl"
            download
            icon="i-heroicons-arrow-down-tray"
            color="primary"
            target="_blank"
          >Descargar Imagen</UButton>
          <UButton
            v-if="userRole === 'admin' && previewImageUrl"
            color="error"
            icon="i-heroicons-trash"
            class="mt-4"
            @click="handleDeletePreviewImage"
          >Eliminar Imagen</UButton>
        </div>
      </template>
    </UModal>

    <div class="w-full flex justify-center relative group print:flex-col print:items-center">
      <div
        class="rounded border border-gray-300 overflow-hidden max-h-64 w-fit print:max-h-32 print:border-0 cursor-pointer"
        :class="{ 'cursor-pointer': animal.imagen_url }"
        @click="animal.imagen_url ? openPreview(animal.imagen_url, 'main') : null"
      >
        <img
          :src="animal.imagen_url || undefined"
          alt="Imagen del animal"
          class="transition-transform duration-300 ease-in-out object-contain max-h-64 group-hover:scale-110 print:max-h-32 print:scale-100"
        />
      </div>

      <UButton
        v-if="userRole === 'admin' && isEditing"
        icon="i-heroicons-trash"
        color="error"
        @click.stop="deleteImage"
        :loading="isDeletingImage"
        class="absolute top-2 right-2 print:hidden"
      />
    </div>
    
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      class="hidden"
      @change="handleImageUpload"
    />
    <div class="my-4 print:my-2">
      <UButton
        v-if="userRole === 'admin' && !isEditing"
        @click="fileInput?.click()"
        :loading="isUploadingImage"
        icon="i-heroicons-photo"
        color="primary"
        label="Cambiar imagen"
        class="print:hidden"
      />
    </div>
    <div class="mt-8 border-t pt-6 print:mt-4 print:pt-2"></div>
    <template #header>
      <div class="flex justify-between items-center print:flex-col print:items-start print:gap-2">
        <h1 class="text-2xl print:text-xl">
          {{ animal.raza }}
        </h1>
        <UButton
          v-if="userRole === 'admin'"
          icon="i-heroicons-pencil-square"
          @click="enableEditing"
          class="print:hidden bg-[var(--color-custom-50)] text-[var(--color-custom-500)] dark:bg-[var(--color-custom-500)] dark:text-[var(--color-custom-50)] hover:text-[var(--color-custom-50)] dark:hover:text-[var(--color-custom-500)] rounded-full p-2"
        />
      </div>
    </template>

    <!-- Modo Visualización -->
    <div v-if="!isEditing" class="print:space-y-2">
      <div class="grid md:grid-cols-2 gap-6 print:grid print:grid-cols-2 print:gap-4">
        <!-- Columna Izquierda -->
        <div class="space-y-4 print:space-y-2">
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Fecha de Nacimiento</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{ new Date(animal.fecha_nacimiento).toLocaleDateString() }}
            </p>
          </div>

          <!-- Raza y Animal ID juntos -->
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs">Raza</label>
            <p class="text-lg font-semibold print:text-sm">
              {{ animal.raza }}  |  Animal: {{ animal.id_animal }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Tipo</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{ animal.tipo_animal }}
            </p>
          </div>
        </div>

        <!-- Columna Derecha -->
        <div class="space-y-4 print:space-y-2">
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Peso Actual</label
            >
            <p class="text-2xl font-semibold print:text-lg">{{ animal.peso_actual }} kg</p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Estado de Salud</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{ animal.estado_salud }}
            </p>
          </div>

          <div v-if="userRole === 'admin'" class="print:hidden">
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >En Venta</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{
                hasSaleRecord
                  ? "Con información de venta"
                  : "Sin información de venta disponible"
              }}
            </p>
            <div v-if="!hasSaleRecord" class="mt-2">
              <SaleModal
                :animal-id="animal.id_animal"
                v-slot="{ open }"
                @created="handleSaleCreated"
              >
                <UButton
                  @click="open"
                  class="bg-[var(--color-custom-50)] dark:bg-[var(--color-custom-500)] text-[var(--color-custom-500)] dark:text-[var(--color-custom-50)] hover:text-[var(--color-custom-50)] dark:hover:text-[var(--color-custom-500)]"
                >
                  Agregar Información de Venta
                </UButton>
              </SaleModal>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Adicional -->
      <div class="mt-8 border-t pt-6 print:mt-4 print:pt-2">
        <div class="grid grid-cols-3 gap-4 text-center print:gap-2">
          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Peso Inicial</label
            >
            <p class="text-lg font-semibold print:text-sm">{{ animal.peso_inicial }} kg</p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >ID Reproducción</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{ animal.id_reproduccion || "N/A" }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs"
              >Fecha Fallecimiento</label
            >
            <p class="text-lg font-semibold print:text-sm">
              {{
                animal.fecha_fallecimiento
                  ? new Date(animal.fecha_fallecimiento).toLocaleDateString()
                  : "N/A"
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- NUEVA SECCIÓN: Peso al Destete -->
      <div class="mt-8 border-t pt-6 print:mt-4 print:pt-2">
        <div class="flex flex-col items-center justify-center text-center">
          <label class="text-base font-medium text-[var(--color-custom-300)] print:text-sm mb-1">Peso al Destete</label>
          <p class="text-3xl font-extrabold print:text-xl">{{ animal.peso_destete != null ? animal.peso_destete + ' kg' : 'N/A' }}</p>
        </div>
      </div>

      <!-- NUEVA SECCIÓN: Información Adicional -->
      <div class="mt-8 border-t pt-6 print:mt-4 print:pt-2">
        <h4 class="text-lg font-bold mb-4 text-center">Información Adicional</h4>
        <div class="flex flex-col md:flex-row items-center justify-center gap-8 print:flex-row print:gap-12">
          <div class="text-center">
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs">Dueño</label>
            <p class="text-xl font-semibold print:text-base">{{ animal.dueño || 'N/A' }}</p>
          </div>
          <div class="text-center">
            <label class="text-sm font-medium text-[var(--color-custom-300)] print:text-xs">Tipo de Ganado</label>
            <p class="text-xl font-semibold print:text-base uppercase">{{ animal.tipo_ganado || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- GRAFICO DE EVOLUCIÓN DE PESO -->
      <div class="mt-10">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h4 class="text-lg font-bold">Evolución de Peso</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">Las flechas muestran el cambio en kilogramos entre mediciones</p>
          </div>
          <div class="flex gap-2">
            <UButton color="primary" icon="i-heroicons-plus" @click="isModalOpen = true">Nuevo Peso</UButton>
            <UButton
              :icon="showChart ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              @click="showChart = !showChart"
              size="sm"
              color="neutral"
              :title="showChart ? 'Ocultar gráfica' : 'Mostrar gráfica'"
            />
          </div>
        </div>
        <div v-if="showChart" class="bg-white dark:bg-gray-900 rounded-lg shadow p-0 print:p-0 print:shadow-none print:border print:border-gray-300">
          <div ref="chartContainerRef" class="w-full h-[320px] overflow-x-auto overflow-y-hidden scrollbar-hide print:h-[400px] print:overflow-visible">
            <div class="chart-wrapper print:w-full print:min-w-full" :class="{ 'mobile-scroll': isMobile && historialPeso.length > 6 }">
              <canvas ref="chartRef" :style="chartCanvasStyle" class="print:w-full print:min-w-full"></canvas>
            </div>
          </div>
          <div v-if="historialPeso.length === 0" class="text-gray-500 mt-2 p-4 print:p-2">No hay registros de peso para este animal.</div>
        </div>
      </div>

      <!-- Historial de peso tipo card/fila -->
      <div v-if="historialPeso.length" class="mt-4 space-y-2">
        <div class="flex items-center justify-between mb-2">
          <h5 class="font-semibold" style="color: var(--color-custom-300);">Historial de Pesos</h5>
          <UButton
            :icon="showHistorial ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
            @click="showHistorial = !showHistorial"
            size="sm"
            color="neutral"
            :title="showHistorial ? 'Ocultar historial' : 'Mostrar historial'"
          />
        </div>
        <TransitionGroup name="fade" tag="div" v-if="showHistorial">
          <div
            v-for="peso in historialPeso"
            :key="peso.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg shadow p-4 mb-2 transition border"
            style="background: var(--color-custom-500); border-color: var(--color-custom-300);"
          >
            <div class="flex-1 min-w-0">
              <div class="text-lg font-bold" style="color: var(--color-custom-50);">{{ peso.peso }} kg</div>
              <div class="text-sm" style="color: var(--color-custom-200);">{{ new Date(peso.fecha_registro).toLocaleDateString() }}</div>
            </div>
            <div class="flex gap-2 mt-2 sm:mt-0">
              <UButton
                size="xs"
                color="primary"
                icon="i-heroicons-pencil"
                @click="openEditPeso(peso)"
                title="Editar"
                class="rounded-full"
              />
              <UButton
                size="xs"
                color="error"
                icon="i-heroicons-trash"
                @click="confirmDeletePeso(peso)"
                title="Eliminar"
                class="rounded-full"
              />
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- EVALUACIONES REPRODUCTIVAS: ANDROLÓGICO Y GENOMATOLÓGICO -->
      <div class="mt-8 border-t pt-6">
        <template v-if="showEvaluaciones">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-bold mb-0">Evaluaciones Reproductivas</h4>
            <UButton
              :icon="showEvaluaciones ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              @click="showEvaluaciones = !showEvaluaciones"
              size="sm"
              color="neutral"
              :title="showEvaluaciones ? 'Ocultar Evaluaciones' : 'Mostrar Evaluaciones'"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="flex flex-col items-center md:items-start">
              <template v-if="showAndrologico">
                <UButton
                  :icon="showAndrologico ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  @click="showAndrologico = !showAndrologico"
                  size="sm"
                  color="neutral"
                  :title="showAndrologico ? 'Ocultar Andrológico' : 'Mostrar Andrológico'"
                >Andrológico</UButton>
                <label class="text-sm font-medium text-[var(--color-custom-300)] mb-2 print:text-base print:font-bold mt-2">Andrológico</label>
              </template>
              <template v-else>
                <UButton
                  :icon="showAndrologico ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  @click="showAndrologico = !showAndrologico"
                  size="sm"
                  color="neutral"
                  :title="showAndrologico ? 'Ocultar Andrológico' : 'Mostrar Andrológico'"
                >Andrológico</UButton>
              </template>
            </div>
            <div class="flex flex-col items-center md:items-end">
              <template v-if="showGenomatologico">
                <UButton
                  :icon="showGenomatologico ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  @click="showGenomatologico = !showGenomatologico"
                  size="sm"
                  color="neutral"
                  :title="showGenomatologico ? 'Ocultar Genomatológico' : 'Mostrar Genomatológico'"
                >Genomatológico</UButton>
                <label class="text-sm font-medium text-[var(--color-custom-300)] mb-2 print:text-base print:font-bold mt-2">Genomatológico</label>
              </template>
              <template v-else>
                <UButton
                  :icon="showGenomatologico ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  @click="showGenomatologico = !showGenomatologico"
                  size="sm"
                  color="neutral"
                  :title="showGenomatologico ? 'Ocultar Genomatológico' : 'Mostrar Genomatológico'"
                >Genomatológico</UButton>
              </template>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-2">
            <!-- Imagen Andrológica -->
            <div v-if="showAndrologico" class="flex flex-col items-center print:items-start print:mb-4">
              <img
                v-if="animal.andrologico_image_url"
                :src="animal.andrologico_image_url"
                alt="Imagen Andrológica"
                class="rounded border border-gray-300 max-h-64 object-contain mb-2 cursor-pointer transition hover:scale-105 print:max-h-[400px] print:w-full print:object-contain print:mb-2"
                @click="openPreview(animal.andrologico_image_url, 'andrologico')"
              />
              <span v-else class="text-gray-400 mb-2 print:text-gray-700">Sin imagen</span>
            </div>
            <!-- Imagen Genomatológica -->
            <div v-if="showGenomatologico" class="flex flex-col items-center print:items-start print:mb-4">
              <img
                v-if="animal.genomatologico_image_url"
                :src="animal.genomatologico_image_url"
                alt="Imagen Genomatológica"
                class="rounded border border-gray-300 max-h-64 object-contain mb-2 cursor-pointer transition hover:scale-105 print:max-h-[400px] print:w-full print:object-contain print:mb-2"
                @click="openPreview(animal.genomatologico_image_url, 'genomatologico')"
              />
              <span v-else class="text-gray-400 mb-2 print:text-gray-700">Sin imagen</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-4 mb-4">
            <UButton
              :icon="showEvaluaciones ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              @click="showEvaluaciones = !showEvaluaciones"
              size="sm"
              color="neutral"
              :title="showEvaluaciones ? 'Ocultar Evaluaciones' : 'Mostrar Evaluaciones'"
            />
          </div>
        </template>
      </div>

      <!-- HISTORIAL DE SALUD -->
      <div class="mt-8 border-t pt-6">
        <!-- SECCIÓN ELIMINADA: Historial de Salud -->
      </div>

      <!-- MODAL     PESO -->
      <UModal v-model:open="isModalOpen" title="Registrar Nuevo Peso" :dismissible="false">
        <template #body>
          <UForm :state="formPeso" @submit="handleSubmitPeso" class="space-y-4">
            <UFormField label="Peso (kg)" name="peso" required>
              <template #label>
                <span style="color: var(--color-custom-300);">Peso (kg)</span>
              </template>
              <UInput v-model.number="formPeso.peso" type="number" placeholder="Ej: 350.5" />
            </UFormField>
            <UFormField label="Fecha" name="fecha">
              <template #label>
                <span style="color: var(--color-custom-300);">Fecha</span>
              </template>
              <UInput v-model="formPeso.fecha" type="date" />
            </UFormField>
            <div class="flex justify-end gap-3 mt-4">
              <UButton type="button" @click="isModalOpen = false">Cancelar</UButton>
              <UButton type="submit" color="primary" :loading="isSaving">Guardar</UButton>
            </div>
          </UForm>
        </template>
      </UModal>

      <!-- MODAL EDITAR PESO -->
      <UModal v-model:open="isEditModalOpen" title="Editar Peso" :dismissible="false">
        <template #body>
          <UForm :state="editPesoForm" @submit="handleEditPeso" class="space-y-4">
            <UFormField label="Peso (kg)" name="peso" required>
              <template #label>
                <span style="color: var(--color-custom-300);">Peso (kg)</span>
              </template>
              <UInput v-model.number="editPesoForm.peso" type="number" placeholder="Ej: 350.5" />
            </UFormField>
            <UFormField label="Fecha" name="fecha">
              <template #label>
                <span style="color: var(--color-custom-300);">Fecha</span>
              </template>
              <UInput v-model="editPesoForm.fecha" type="date" />
            </UFormField>
            <div class="flex justify-end gap-3 mt-4">
              <UButton type="button" @click="isEditModalOpen = false">Cancelar</UButton>
              <UButton type="submit" color="primary" :loading="isSavingEdit">Guardar</UButton>
            </div>
          </UForm>
        </template>
      </UModal>

      <!-- MODAL CONFIRMAR ELIMINACIÓN -->
      <UModal v-model:open="isDeleteModalOpen" title="Eliminar Peso" :dismissible="false">
        <template #body>
          <p>¿Seguro que deseas eliminar este registro de peso?</p>
          <div class="flex justify-end gap-3 mt-4">
            <UButton type="button" @click="isDeleteModalOpen = false">Cancelar</UButton>
            <UButton color="error" :loading="isDeleting" @click="handleDeletePeso">Eliminar</UButton>
          </div>
        </template>
      </UModal>
    </div>

    <!-- Modo Edición -->
    <UModal v-model:open="isEditing" title="Editar Animal" description="Modifica los datos del animal" class="max-w-4xl w-full">
      <template #body>
        <UForm :schema="schema" :state="formData" @submit="handleSubmit" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- ID Animal (solo lectura) -->
          <UFormField name="id_animal" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                ID Animal
              </span>
            </template>
            <UInput v-model="formData.id_animal" disabled />
          </UFormField>

          <!-- Tipo de Animal -->
          <UFormField name="tipo_animal" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Tipo de Animal
              </span>
            </template>
            <USelect v-model="formData.tipo_animal" :items="tipoAnimalOptions" placeholder="Selecciona un tipo" variant="ghost" class="cursor-pointer"/>
          </UFormField>

          <!-- Raza -->
          <UFormField name="raza" required class="col-span-1 sm:col-span-2 lg:col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Raza
              </span>
            </template>
            <UInput v-model="formData.raza" />
          </UFormField>

          <!-- Fecha de Nacimiento -->
          <UFormField name="fecha_nacimiento" required class="col-span-1 sm:col-span-2 lg:col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Fecha de Nacimiento
              </span>
            </template>
            <UInput v-model="formData.fecha_nacimiento" type="date" />
          </UFormField>

          <!-- Peso Inicial -->
          <UFormField name="peso_inicial" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Peso Inicial (kg)
              </span>
            </template>
            <UInput v-model.number="formData.peso_inicial" type="number" step="0.1" />
          </UFormField>

          <!-- Peso Actual -->
          <UFormField name="peso_actual" required class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Peso Actual (kg)
              </span>
            </template>
            <UInput v-model.number="formData.peso_actual" type="number" step="0.1" />
          </UFormField>

          <!-- Estado de Salud -->
          <UFormField name="estado_salud" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Estado de Salud
              </span>
            </template>
            <USelect v-model="formData.estado_salud" :items="estadoSaludOptions" placeholder="Selecciona un estado" variant="ghost" class="cursor-pointer"/>
          </UFormField>

          <!-- Fecha de Fallecimiento -->
          <UFormField name="fecha_fallecimiento" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Fecha de Fallecimiento
              </span>
            </template>
            <UInput v-model="formData.fecha_fallecimiento" type="date" />
          </UFormField>

          <!-- ID Reproducción -->
          <UFormField name="id_reproduccion" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                ID Reproducción
              </span>
            </template>
            <div class="flex items-center gap-2">
              <p>{{ formData.id_reproduccion }}</p>
              <p v-if="!formData.id_reproduccion">Sin registro seleccionado</p>
              <DrawerGenealogy v-model:modelValue="isDrawerOpen" @select="formData.id_reproduccion = $event.id_reproduccion" />
            </div>
          </UFormField>

          <!-- Dueño -->
          <UFormField name="dueño" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Dueño
              </span>
            </template>
            <UInput v-model="formData.dueño" placeholder="Nombre del dueño" />
          </UFormField>

          <!-- Tipo de Ganado -->
          <UFormField name="tipo_ganado" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Tipo de Ganado
              </span>
            </template>
            <USelect v-model="formData.tipo_ganado" :items="tipoGanadoOptions" placeholder="Selecciona un tipo" variant="ghost" class="cursor-pointer"/>
          </UFormField>

          <!-- Cantidad de Hijos (solo para VACA) -->
          <UFormField v-if="formData.tipo_animal === 'VACA'" name="cantidad_hijos" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">
                Cantidad de Hijos
              </span>
            </template>
            <UInput v-model.number="formData.cantidad_hijos" type="number" min="0" step="1" placeholder="0" />
          </UFormField>

          <!-- Peso al Destete -->
          <UFormField name="peso_destete" label="Peso al Destete (kg)" class="col-span-1">
            <template #label>
              <span class="text-[var(--color-custom-400)] dark:text-[var(--color-custom-100)]">Peso al Destete (kg)</span>
            </template>
            <UInput v-model="formData.peso_destete" type="number" min="0" step="0.01" placeholder="Ej: 180" 
              class="text-[var(--color-custom-900)] dark:text-[var(--color-custom-50)]" />
          </UFormField>

          <!-- Imagen del Animal -->
          <UFormField name="image" label="Imagen del Animal" class="col-span-1 sm:col-span-2">
            <template #label>
              <span class="text-[var(--color-custom-300)] font-semibold">Imagen del Animal</span>
            </template>
            <UInput type="file" @change="handleImageUpload" accept="image/*" class="cursor-pointer" />
          </UFormField>

          <!-- Imagen Andrológica -->
          <UFormField name="andrologico_image" label="Imagen Andrológica" class="col-span-1 sm:col-span-2">
            <template #label>
              <span class="text-[var(--color-custom-300)] font-semibold">Imagen Andrológica</span>
            </template>
            <UInput type="file" @change="handleAndrologicoFileChange" accept="image/*" class="cursor-pointer" />
          </UFormField>

          <!-- Imagen Genomatológica -->
          <UFormField name="genomatologico_image" label="Imagen Genomatológica" class="col-span-1 sm:col-span-2">
            <template #label>
              <span class="text-[var(--color-custom-300)] font-semibold">Imagen Genomatológica</span>
            </template>
            <UInput type="file" @change="handleGenomatologicoFileChange" accept="image/*" class="cursor-pointer" />
          </UFormField>

          <!-- Botones de acción ocupan toda la fila -->
          <div class="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-end gap-4 mt-2">
            <UButton type="button" variant="ghost" @click="cancelEditing">Cancelar</UButton>
            <UButton type="submit" color="primary" :loading="isSubmitting">Guardar Cambios</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { useUserRole } from "~/composables/arestricted";
import type { Animal } from "~/types/animal";
import type { Venta } from "~/types/animal";
import { z } from "zod";
import { ref, reactive, onMounted, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import type { HistorialPeso } from '~/types/animal'
import Chart from 'chart.js/auto'
import { ref as vueRef } from 'vue'
import type { Database } from "~/types/supabase";

const isDrawerOpen = ref(false);
const isPreviewOpen = ref(false);
const previewImageUrl = ref<string | undefined>(undefined);
type PreviewImageType = 'main' | 'andrologico' | 'genomatologico' | undefined;
const previewImageType = ref<PreviewImageType>(undefined);
const supabase = useSupabaseClient<Database>();

function openPreview(url: string, type: PreviewImageType = 'main') {
  previewImageUrl.value = url;
  previewImageType.value = type;
  isPreviewOpen.value = true;
}

const tipoGanadoOptions = [
  { label: "PURO", value: "PURO" },
  { label: "COMERCIO", value: "COMERCIO" },
];

const tipoAnimalOptions = [
  { label: "TERNERO", value: "TERNERO" },
  { label: "TERNERA", value: "TERNERA" },
  { label: "NOVILLO", value: "NOVILLO" },
  { label: "NOVILLA", value: "NOVILLA" },
  { label: "TORO", value: "TORO" },
  { label: "VACA", value: "VACA" },
];

const estadoSaludOptions = [
  { label: "EXCELENTE", value: "EXCELENTE" },
  { label: "BUENO", value: "BUENO" },
  { label: "REGULAR", value: "REGULAR" },
  { label: "MALO", value: "MALO" },
  { label: "CRITICO", value: "CRITICO" },
  { label: "RECUPERACION", value: "RECUPERACION" },
  { label: "OBSERVACION", value: "OBSERVACION" },
];

const schema = z.object({
  id_animal: z.string().optional(), // Solo lectura
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  raza: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(30, "Máximo 50 caracteres"),
  tipo_animal: z.enum(["TERNERO", "TERNERA", "NOVILLO", "NOVILLA", "TORO", "VACA"]),
  peso_actual: z.coerce
    .number()
    .positive("Debe ser positivo")
    .min(1, "Mínimo 1 kg")
    .max(2000, "Máximo 2000 kg"),
  estado_salud: z.enum([
    "EXCELENTE",
    "BUENO",
    "REGULAR",
    "MALO",
    "CRITICO",
    "RECUPERACION",
    "OBSERVACION",
  ]),
  peso_inicial: z.coerce
    .number()
    .min(0, "Mínimo 0 kg")
    .max(2000, "Máximo 2000 kg")
    .optional(),
  id_reproduccion: z.coerce.number().max(500, "Máximo 500").optional(),
  fecha_fallecimiento: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
      z.literal(""),
    ])
    .optional(),
  // NUEVOS CAMPOS
  dueño: z.string().optional(),
  tipo_ganado: z.enum(["PURO", "COMERCIO"]).optional(),
  cantidad_hijos: z.coerce.number().min(0).optional(),
  peso_destete: z.number().nullable().optional(),
});

const { userRole } = useUserRole();
const toast = useToast();

const props = defineProps({
  animal: {
    type: Object as () => Animal,
    required: true,
  },
  venta: {
    type: Object as () => Venta | null,
    default: null,
  },
  show: {
    type: Boolean,
    default: true,
  },
});

const hasSaleRecord = computed(() => props.venta !== null);

const emit = defineEmits<{
  (e: "updated", updatedAnimal: Animal): void;
  (e: "venta-created"): void;
  (e: "historial-updated"): void;
}>();

const handleSaleCreated = () => {
  emit("venta-created");
};

// Reactive variables
const isEditing = ref(false);
const isSubmitting = ref(false);
const isDeletingImage = ref(false);
const isUploadingImage = ref(false);
const fileInput = ref<HTMLInputElement>();
const andrologicoInput = ref<HTMLInputElement | null>(null);
const genomatologicoInput = ref<HTMLInputElement | null>(null);

const showChart = ref(true)
const showHistorial = ref(true)
const showAndrologico = ref(true)
const showGenomatologico = ref(true)
const chartRef = ref<HTMLCanvasElement>()
const historialPeso = ref<HistorialPeso[]>([])

// Modal and form variables for weight management
const isModalOpen = ref(false)
const isSaving = ref(false)
const formPeso = reactive({
  peso: null as number | null,
  fecha: ""
})

// Form data for editing
const formData = reactive<{
  id_animal: string;
  fecha_nacimiento: string;
  raza: string;
  tipo_animal: "NOVILLO" | "TERNERO" | "TERNERA" | "VACA" | "TORO";
  peso_actual: number;
  estado_salud:
    | "EXCELENTE"
    | "BUENO"
    | "REGULAR"
    | "MALO"
    | "CRITICO"
    | "RECUPERACION"
    | "OBSERVACION";
  venta: boolean;
  peso_inicial?: number;
  id_reproduccion?: number;
  fecha_fallecimiento?: string;
  // NUEVOS CAMPOS
  dueño?: string;
  tipo_ganado?: "PURO" | "COMERCIO";
  cantidad_hijos?: number;
  peso_destete?: number | null;
}>({
  id_animal: props.animal.id_animal,
  fecha_nacimiento: props.animal.fecha_nacimiento.split("T")[0],
  raza: props.animal.raza,
  tipo_animal: props.animal.tipo_animal as
    | "NOVILLO"
    | "TERNERO"
    | "TERNERA"
    | "VACA"
    | "TORO",
  peso_actual: props.animal.peso_actual,
  estado_salud: props.animal.estado_salud as
    | "EXCELENTE"
    | "BUENO"
    | "REGULAR"
    | "MALO"
    | "CRITICO"
    | "RECUPERACION"
    | "OBSERVACION",
  venta: props.animal.venta,
  peso_inicial: props.animal.peso_inicial,
  id_reproduccion:
    props.animal.id_reproduccion !== undefined &&
    props.animal.id_reproduccion !== null
      ? Number(props.animal.id_reproduccion)
      : undefined,
  fecha_fallecimiento: props.animal.fecha_fallecimiento?.split("T")[0] || "",
  // NUEVOS CAMPOS
  dueño: props.animal.dueño || "",
  tipo_ganado: props.animal.tipo_ganado as "PURO" | "COMERCIO" | undefined,
  cantidad_hijos: props.animal.cantidad_hijos || undefined,
  peso_destete: props.animal.peso_destete || undefined,
});

let chartInstance: Chart | null = null

const chartContainerRef = ref<HTMLDivElement | null>(null)
let resizeObserver: ResizeObserver | null = null

// Responsive: detectar si es móvil
const isMobile = vueRef(false)
function updateIsMobile() {
  isMobile.value = window.innerWidth < 640
}
if (typeof window !== 'undefined') {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
}

const fetchHistorialPeso = async () => {
  try {
    const { historial_peso } = await $fetch(`/api/animal/specific/${props.animal.id_animal}/peso`)
    historialPeso.value = historial_peso || []
  } catch (error) {
    console.error('Error fetching weight history:', error)
    historialPeso.value = []
  }
}

// Estilo dinámico para el canvas: ancho fijo con scroll horizontal si hay muchos puntos, en cualquier dispositivo
const chartCanvasStyle = computed(() => {
  // Para impresión, siempre usar ancho completo
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches) {
    return 'width: 100% !important; min-width: 100% !important; height: 100%;';
  }
  
  if (historialPeso.value.length > 6) {
    const minWidth = Math.max(historialPeso.value.length * 100, 400); // 100px por punto (reducido de 120px)
    if (chartRef.value) {
      chartRef.value.width = minWidth;
      chartRef.value.style.width = `${minWidth}px`;
      chartRef.value.style.minWidth = `${minWidth}px`;
      chartRef.value.height = chartContainerRef.value?.offsetHeight || 320;
      chartRef.value.style.height = '100%';
    }
    return `min-width: ${minWidth}px; width: ${minWidth}px; height: 100%;`;
  }
  if (chartRef.value && chartContainerRef.value) {
    chartRef.value.height = chartContainerRef.value.offsetHeight;
    chartRef.value.style.height = '100%';
  }
  return 'width: 100%; height: 100%;';
});

// Variables de configuración para Chart.js (deben estar antes de usarse)
const chartPadding = computed(() => isMobile.value ? 20 : 30);
const legendFont = computed(() => isMobile.value ? 10 : 12);
const labelPadding = computed(() => isMobile.value ? 4 : 8);
const axisFont = computed(() => isMobile.value ? 9 : 12);

// Variables de fuente y radio para el plugin y dataset
const fontArrow = isMobile.value ? 12 : 18;
const fontKg = isMobile.value ? 8 : 14;
const fontPercent = isMobile.value ? 7 : 12;
const pointRadius = isMobile.value ? 3 : 6;
const pointHoverRadius = isMobile.value ? 5 : 8;

// Función para mejorar la experiencia de scroll en móvil
const initMobileScroll = () => {
  if (isMobile.value && chartContainerRef.value) {
    const container = chartContainerRef.value;
    
    // Agregar indicador de scroll
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = `
      <div class="scroll-arrow left">‹</div>
      <div class="scroll-arrow right">›</div>
    `;
    container.appendChild(scrollIndicator);
    
    // Mostrar/ocultar flechas según posición
    const updateScrollArrows = () => {
      const leftArrow = scrollIndicator.querySelector('.left') as HTMLElement;
      const rightArrow = scrollIndicator.querySelector('.right') as HTMLElement;
      
      if (leftArrow && rightArrow) {
        leftArrow.style.opacity = container.scrollLeft > 0 ? '1' : '0';
        rightArrow.style.opacity = 
          container.scrollLeft < (container.scrollWidth - container.clientWidth) ? '1' : '0';
      }
    };
    
    container.addEventListener('scroll', updateScrollArrows);
    updateScrollArrows();
  }
};

const renderChart = () => {
  if (!chartRef.value) return;
  if (chartInstance) chartInstance.destroy();
  if (!historialPeso.value.length) return;

  // Detectar si estamos en modo impresión
  const isPrintMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches;

  let chartOptions;
  if (isPrintMode) {
    // Configuración específica para impresión
    chartRef.value.width = chartContainerRef.value?.offsetWidth || 800;
    chartRef.value.style.width = '100%';
    chartRef.value.style.minWidth = '100%';
    chartOptions = {
      responsive: false,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 10,
          right: 10
        }
      },
      plugins: {
        legend: { 
          display: true,
          labels: {
            font: {
              size: 12,
              weight: 'bold' as const
            },
            padding: 10
          }
        },
        title: { display: false }
      },
      scales: {
        x: { 
          title: { 
            display: true, 
            text: 'Fecha',
            font: {
              size: 12,
              weight: 'bold' as const
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 11
            },
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
            maxTicksLimit: undefined
          },
          offset: false,
        },
        y: { 
          title: { 
            display: true, 
            text: 'Peso (kg)',
            font: {
              size: 12,
              weight: 'bold' as const
            }
          }, 
          beginAtZero: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const
      }
    };
  } else if (isMobile.value && historialPeso.value.length > 6) {
    const minWidth = Math.max(historialPeso.value.length * 100, 400);
    chartRef.value.width = minWidth;
    chartRef.value.style.width = `${minWidth}px`;
    chartRef.value.style.minWidth = `${minWidth}px`;
    chartOptions = {
      responsive: false,
      layout: {
        padding: {
          top: 15,
          bottom: 15,
          left: 5,
          right: 5
        }
      },
      plugins: {
        legend: { 
          display: true,
          labels: {
            font: {
              size: 10,
              weight: 'bold' as const
            },
            padding: 8
          }
        },
        title: { display: false }
      },
      scales: {
        x: { 
          title: { 
            display: true, 
            text: 'Fecha',
            font: {
              size: 10,
              weight: 'bold' as const
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 9
            },
            maxRotation: 45,
            minRotation: 30,
            autoSkip: false, // Mostrar todas las fechas
            maxTicksLimit: undefined
          },
          offset: false,
        },
        y: { 
          title: { 
            display: true, 
            text: 'Peso (kg)',
            font: {
              size: 10,
              weight: 'bold' as const
            }
          }, 
          beginAtZero: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 9
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const
      }
    };
  } else {
    const width = chartContainerRef.value?.offsetWidth || 320;
    chartRef.value.width = width;
    chartRef.value.style.width = '100%';
    chartRef.value.style.minWidth = '';
    chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: chartPadding.value,
          bottom: chartPadding.value,
          left: 5,
          right: 5
        }
      },
      plugins: {
        legend: { 
          display: true,
          labels: {
            font: {
              size: legendFont.value,
              weight: 'bold' as const
            },
            padding: labelPadding.value
          }
        },
        title: { display: false }
      },
      scales: {
        x: { 
          title: { 
            display: true, 
            text: 'Fecha',
            font: {
              size: axisFont.value,
              weight: 'bold' as const
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: axisFont.value
            },
            maxRotation: isMobile.value ? 45 : 0,
            minRotation: isMobile.value ? 30 : 0,
            autoSkip: false,
            maxTicksLimit: undefined
          },
          offset: false,
        },
        y: { 
          title: { 
            display: true, 
            text: 'Peso (kg)',
            font: {
              size: axisFont.value,
              weight: 'bold' as const
            }
          }, 
          beginAtZero: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: axisFont.value
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const
      }
    };
  }
  chartRef.value.height = isPrintMode ? 400 : 320;
  chartRef.value.style.height = '100%';

  // Calcular los cambios en kilogramos y porcentajes
  const changes = historialPeso.value.map((h, i, arr) => {
    if (i === 0) return null
    const prev = arr[i - 1].peso
    const curr = h.peso
    const changeKg = curr - prev
    const changePercent = ((curr - prev) / prev) * 100
    return { kg: changeKg, percent: changePercent }
  })

  // Plugin para dibujar flechas y porcentajes
  const arrowPlugin = {
    id: 'arrowPlugin',
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data) return;
      ctx.save();
      meta.data.forEach((point: any, i: number) => {
        if (i === 0) return;
        const change = changes[i];
        if (!change) return;
        const isUp = change.kg > 0;
        const color = isUp ? '#22c55e' : '#ef4444';
        const arrow = isUp ? '⬆️' : '⬇️';
        // Flecha
        ctx.font = `bold ${fontArrow}px Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = color;
        const offsetY = isUp ? -20 : 25;
        ctx.fillText(arrow, point.x, point.y + offsetY);
        // Kg
        ctx.font = `bold ${fontKg}px Arial, sans-serif`;
        ctx.textBaseline = isUp ? 'bottom' : 'top';
        const kgText = `${isUp ? '+' : ''}${change.kg.toFixed(1)} kg`;
        ctx.fillText(kgText, point.x, point.y + offsetY + (isUp ? -15 : 15));
        // Porcentaje
        ctx.font = `${fontPercent}px Arial, sans-serif`;
        ctx.fillStyle = isUp ? '#16a34a' : '#dc2626';
        const percentText = `(${isUp ? '+' : ''}${change.percent.toFixed(1)}%)`;
        ctx.fillText(percentText, point.x, point.y + offsetY + (isUp ? -28 : 28));
      });
      ctx.restore();
    }
  };

  // Plugin específico para impresión que ajusta el tamaño
  const printPlugin = {
    id: 'printPlugin',
    beforeDraw(chart: any) {
      if (isPrintMode) {
        const canvas = chart.canvas;
        const container = chartContainerRef.value;
        if (container) {
          canvas.width = container.offsetWidth;
          canvas.style.width = '100%';
          canvas.style.minWidth = '100%';
        }
      }
    }
  };

  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: historialPeso.value.map(h => new Date(h.fecha_registro).toLocaleDateString()),
      datasets: [
        {
          label: 'Peso (kg)',
          data: historialPeso.value.map(h => h.peso),
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#059669',
          pointBorderWidth: 2,
          pointRadius: pointRadius,
          pointHoverRadius: pointHoverRadius,
          pointHoverBackgroundColor: '#059669',
          pointHoverBorderColor: '#ffffff',
          clip: false,
          borderWidth: 2,
        }
      ]
    },
    options: chartOptions,
    plugins: [arrowPlugin, printPlugin]
  })
  
  // Inicializar scroll móvil si es necesario
  if (isMobile.value && historialPeso.value.length > 6) {
    setTimeout(() => {
      initMobileScroll();
    }, 100);
  }
}

const handleSubmitPeso = async (e: Event) => {
  e.preventDefault()
  if (!formPeso.peso || formPeso.peso <= 0) {
    toast.add({ title: 'Error', description: 'El peso debe ser mayor a 0', color: 'error' })
    return
  }
  isSaving.value = true
  try {
    const response = await $fetch(`/api/animal/specific/${props.animal.id_animal}/peso`, {
      method: 'POST',
      body: {
        peso: formPeso.peso,
        fecha_registro: formPeso.fecha || undefined
      }
    })
    
    // Agregar el nuevo peso al historial local
    if (response.historial_peso) {
      historialPeso.value.push(response.historial_peso)
    }
    
    isModalOpen.value = false
    formPeso.peso = null
    formPeso.fecha = ""
    
    // Re-renderizar el gráfico si es necesario
    if (showChart.value && historialPeso.value.length > 0) {
      setTimeout(() => {
        renderChart()
      }, 100)
    }
    
    toast.add({ title: 'Peso registrado', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message || error.message, color: 'error' })
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    await fetchHistorialPeso()
    await nextTick()
    if (showChart.value && historialPeso.value.length > 0) {
      setTimeout(() => {
        renderChart()
      }, 100)
    }
    if (chartContainerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        renderChart()
      })
      resizeObserver.observe(chartContainerRef.value)
    }
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})

watch([historialPeso, isEditing, showChart], () => {
  nextTick(() => {
    if (showChart.value && historialPeso.value.length > 0) {
      setTimeout(() => {
        renderChart()
      }, 100)
    }
  })
}, { deep: true })

// Escuchar cambios en el modo de impresión
if (typeof window !== 'undefined') {
  window.matchMedia('print').addEventListener('change', (e) => {
    if (e.matches && showChart.value && historialPeso.value.length > 0) {
      setTimeout(() => {
        renderChart()
      }, 100)
    }
  })
}

const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSavingEdit = ref(false)
const isDeleting = ref(false)
const editPesoForm = reactive({ id: null as number | null, peso: null as number | null, fecha: "" })
let pesoToDelete: HistorialPeso | null = null

function openEditPeso(peso: HistorialPeso) {
  editPesoForm.id = peso.id
  editPesoForm.peso = peso.peso
  editPesoForm.fecha = peso.fecha_registro.split('T')[0]
  isEditModalOpen.value = true
}

async function handleEditPeso(e: Event) {
  e.preventDefault()
  if (!editPesoForm.peso || editPesoForm.peso <= 0) {
    toast.add({ title: 'Error', description: 'El peso debe ser mayor a 0', color: 'error' })
    return
  }
  isSavingEdit.value = true
  try {
    const response = await $fetch(`/api/animal/specific/${props.animal.id_animal}/peso`, {
      method: 'put',
      body: {
        id: editPesoForm.id,
        peso: editPesoForm.peso,
        fecha_registro: editPesoForm.fecha
      }
    })
    
    // Actualizar el peso en el historial local
    if (response.historial_peso) {
      const index = historialPeso.value.findIndex(p => p.id === editPesoForm.id)
      if (index !== -1) {
        historialPeso.value[index] = response.historial_peso
      }
    }
    
    isEditModalOpen.value = false
    
    // Re-renderizar el gráfico si es necesario
    if (showChart.value && historialPeso.value.length > 0) {
      setTimeout(() => {
        renderChart()
      }, 100)
    }
    
    toast.add({ title: 'Peso actualizado', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message || error.message, color: 'error' })
  } finally {
    isSavingEdit.value = false
  }
}

function confirmDeletePeso(peso: HistorialPeso) {
  toast.add({
    title: '¿Eliminar registro de peso?',
    description: 'Esta acción no se puede deshacer',
    color: 'error',
    actions: [{
      label: 'Confirmar',
      onClick: () => deletePeso(peso.id),
      color: 'success'
    }],
    duration: 5000,
    icon: 'i-heroicons-trash'
  })
}

const deletePeso = async (id: number) => {
  try {
    await $fetch(`/api/animal/specific/${props.animal.id_animal}/peso`, {
      method: 'DELETE',
      body: { id }
    })
    
    // Actualizar el historial local
    historialPeso.value = historialPeso.value.filter(peso => peso.id !== id)
    
    // Re-renderizar el gráfico si es necesario
    if (showChart.value && historialPeso.value.length > 0) {
      setTimeout(() => {
        renderChart()
      }, 100)
    }
    
    toast.add({
      title: 'Peso eliminado',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error al eliminar',
      description: error.data?.message || error.message,
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  }
}

async function handleDeletePeso() {
  if (!pesoToDelete) return
  isDeleting.value = true
  try {
    await $fetch(`/api/animal/specific/${props.animal.id_animal}/peso`, {
      method: 'delete',
      body: { id: pesoToDelete.id }
    })
    isDeleteModalOpen.value = false
    pesoToDelete = null
    await fetchHistorialPeso()
    await nextTick()
    if (showChart.value && historialPeso.value.length > 0) {
      setTimeout(() => {
        renderChart()
      }, 100)
    }
    toast.add({ title: 'Peso eliminado', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message || error.message, color: 'error' })
  } finally {
    isDeleting.value = false
  }
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploadingImage.value = true;
  try {
    // 1. Subir imagen a Supabase Storage usando el mismo patrón que AnimalAddModal
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${props.animal.id_animal}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('animal-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('animal-images')
      .getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error("No se pudo obtener la URL pública de la imagen");
    }

    // 2. Actualizar el animal con la nueva URL de imagen
    const updateResponse = await $fetch(
      `/api/animal/specific/${props.animal.id_animal}`,
      {
        method: "PUT",
        body: {
          imagen_url: publicUrl,
        },
      }
    );

    if (!updateResponse?.animal) {
      throw new Error("Error al actualizar el animal en la base de datos");
    }

    // 3. Actualizar estado local
    Object.assign(props.animal, updateResponse.animal);
    emit("updated", props.animal);

    toast.add({
      title: "Imagen actualizada",
      description: "La imagen del animal se ha actualizado correctamente",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error: any) {
    console.error("Error al subir imagen:", error);
    const errorMessage = error?.message || "Error desconocido al subir la imagen";
    toast.add({
      title: "Error al subir imagen",
      description: errorMessage,
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isUploadingImage.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
};

const handleAndrologicoFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploadingImage.value = true;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${props.animal.id_animal}-andrologico.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('animal-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('animal-images')
      .getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error("No se pudo obtener la URL pública de la imagen");
    }

    // Actualizar el animal con la nueva URL de imagen andrológica
    const updateResponse = await $fetch(
      `/api/animal/specific/${props.animal.id_animal}`,
      {
        method: "PUT",
        body: {
          andrologico_image_url: publicUrl,
        },
      }
    );

    if (!updateResponse?.animal) {
      throw new Error("Error al actualizar el animal en la base de datos");
    }

    // Actualizar estado local
    Object.assign(props.animal, updateResponse.animal);
    emit("updated", props.animal);

    toast.add({
      title: "Imagen andrológica actualizada",
      description: "La imagen andrológica se ha actualizado correctamente",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error: any) {
    console.error("Error al subir imagen andrológica:", error);
    const errorMessage = error?.message || "Error desconocido al subir la imagen";
    toast.add({
      title: "Error al subir imagen andrológica",
      description: errorMessage,
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isUploadingImage.value = false;
    if (target) target.value = "";
  }
};

const handleGenomatologicoFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploadingImage.value = true;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${props.animal.id_animal}-genomatologico.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('animal-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('animal-images')
      .getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error("No se pudo obtener la URL pública de la imagen");
    }

    // Actualizar el animal con la nueva URL de imagen genomatológica
    const updateResponse = await $fetch(
      `/api/animal/specific/${props.animal.id_animal}`,
      {
        method: "PUT",
        body: {
          genomatologico_image_url: publicUrl,
        },
      }
    );

    if (!updateResponse?.animal) {
      throw new Error("Error al actualizar el animal en la base de datos");
    }

    // Actualizar estado local
    Object.assign(props.animal, updateResponse.animal);
    emit("updated", props.animal);

    toast.add({
      title: "Imagen genomatológica actualizada",
      description: "La imagen genomatológica se ha actualizado correctamente",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error: any) {
    console.error("Error al subir imagen genomatológica:", error);
    const errorMessage = error?.message || "Error desconocido al subir la imagen";
    toast.add({
      title: "Error al subir imagen genomatológica",
      description: errorMessage,
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isUploadingImage.value = false;
    if (target) target.value = "";
  }
};

const enableEditing = () => {
  isEditing.value = true;
  // Reset form data to original values
  Object.assign(formData, {
    id_animal: props.animal.id_animal,
    fecha_nacimiento: props.animal.fecha_nacimiento.split("T")[0],
    raza: props.animal.raza,
    tipo_animal: props.animal.tipo_animal as
      | "NOVILLO"
      | "TERNERO"
      | "TERNERA"
      | "VACA"
      | "TORO",
    peso_actual: props.animal.peso_actual,
    estado_salud: props.animal.estado_salud as
      | "EXCELENTE"
      | "BUENO"
      | "REGULAR"
      | "MALO"
      | "CRITICO"
      | "RECUPERACION"
      | "OBSERVACION",
    venta: props.animal.venta,
    peso_inicial: props.animal.peso_inicial,
    id_reproduccion:
      props.animal.id_reproduccion !== undefined &&
      props.animal.id_reproduccion !== null
        ? Number(props.animal.id_reproduccion)
        : undefined,
    fecha_fallecimiento: props.animal.fecha_fallecimiento?.split("T")[0] || "",
    // NUEVOS CAMPOS
    dueño: props.animal.dueño || "",
    tipo_ganado: props.animal.tipo_ganado as "PURO" | "COMERCIO" | undefined,
    cantidad_hijos: props.animal.cantidad_hijos || undefined,
    peso_destete: props.animal.peso_destete || undefined,
  });
};

const cancelEditing = () => {
  isEditing.value = false;
};

const deleteImage = async () => {
  isDeletingImage.value = true;
  try {
    const response = await $fetch(
      `/api/animal/specific/${props.animal.id_animal}/image`,
      {
        method: "DELETE",
      }
    );

    if (!response?.success) {
      throw new Error("Error al eliminar la imagen");
    }

    props.animal.imagen_url = null;

    toast.add({
      title: "Imagen eliminada",
      description: "La imagen del animal se ha eliminado correctamente",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error: unknown) {
    console.error("Error al eliminar imagen:", error);
    let message = "Error desconocido al eliminar la imagen";

    if (error instanceof Error) {
      message = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof (error as any).data?.message === "string"
    ) {
      message = (error as any).data.message;
    }

    toast.add({
      title: "Error al eliminar imagen",
      description: message,
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isDeletingImage.value = false;
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const response = await $fetch(
      `/api/animal/specific/${props.animal.id_animal}`,
      {
        method: "PUT",
        body: {
          fecha_nacimiento: formData.fecha_nacimiento,
          raza: formData.raza,
          tipo_animal: formData.tipo_animal,
          peso_actual: formData.peso_actual,
          estado_salud: formData.estado_salud,
          peso_inicial: formData.peso_inicial,
          id_reproduccion: formData.id_reproduccion,
          fecha_fallecimiento: formData.fecha_fallecimiento || null,
          // NUEVOS CAMPOS
          dueño: formData.dueño || null,
          tipo_ganado: formData.tipo_ganado || null,
          cantidad_hijos: formData.cantidad_hijos || null,
          peso_destete: formData.peso_destete || null,
        },
      }
    );

    if (!response?.animal) {
      throw new Error("La respuesta del servidor es inválida");
    }

    Object.assign(props.animal, response.animal);

    toast.add({
      title: "Actualización exitosa",
      description: "Los datos del animal se han actualizado correctamente",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    isEditing.value = false;
    emit("updated", {
      id_animal: formData.id_animal,
      fecha_nacimiento: formData.fecha_nacimiento,
      raza: formData.raza,
      tipo_animal: formData.tipo_animal!,
      peso_actual: formData.peso_actual,
      estado_salud: formData.estado_salud,
      id_reproduccion:
        formData.id_reproduccion !== undefined
          ? String(formData.id_reproduccion)
          : null,
      fecha_fallecimiento: formData.fecha_fallecimiento || null,
      venta: false,
      peso_inicial: 0,
      peso_destete: formData.peso_destete || null,
    });
  } catch (error: unknown) {
    console.error("Error en actualización:", error);
    let message = "Error desconocido";
    if (error instanceof Error) {
      message = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof (error as any).data?.message === "string"
    ) {
      message = (error as any).data.message;
    }

    toast.add({
      title: "Error en actualización",
      description: message,
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isSubmitting.value = false;
  }
};

onBeforeUnmount(() => {
  if (resizeObserver && chartContainerRef.value) {
    resizeObserver.disconnect()
  }
  if (chartInstance) {
    chartInstance.destroy()
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateIsMobile)
  }
})

const handleDeletePreviewImage = async () => {
  if (!previewImageUrl.value || !previewImageType.value) return;

  const fileName = previewImageUrl.value.split('/').pop();
  if (!fileName) return;

  try {
    // 1. Eliminar del storage
    const { error: deleteError } = await supabase.storage
      .from('animal-images')
      .remove([fileName]);
    if (deleteError) throw deleteError;

    // 2. Actualizar la base de datos
    let body: Record<string, any> = {};
    if (previewImageType.value === 'main') body.imagen_url = null;
    if (previewImageType.value === 'andrologico') body.andrologico_image_url = null;
    if (previewImageType.value === 'genomatologico') body.genomatologico_image_url = null;

    await $fetch(`/api/animal/specific/${props.animal.id_animal}`, {
      method: 'PUT',
      body,
    });

    // 3. Actualizar el estado local
    if (previewImageType.value === 'main') props.animal.imagen_url = null;
    if (previewImageType.value === 'andrologico') props.animal.andrologico_image_url = null;
    if (previewImageType.value === 'genomatologico') props.animal.genomatologico_image_url = null;

    previewImageUrl.value = undefined;
    previewImageType.value = undefined;
    isPreviewOpen.value = false;
    toast.add({
      title: 'Imagen eliminada',
      description: 'La imagen se ha eliminado correctamente',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    });
  } catch (error: any) {
    console.error('Error al eliminar imagen de previsualización:', error);
    const errorMessage = error?.message || 'Error desconocido al eliminar la imagen';
    toast.add({
      title: 'Error al eliminar imagen',
      description: errorMessage,
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
    });
  }
};

const showEvaluaciones = ref(true)
</script>

<style scoped>
/* Estilos para scroll horizontal suave en móvil */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-scroll {
  min-width: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* Scroll suave en iOS */
  padding: 0;
  margin: 0;
}

/* Estilos específicos para impresión */
@media print {
  .chart-wrapper {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
  }
  
  .chart-wrapper canvas {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
  }
  
  .mobile-scroll {
    overflow: visible !important;
    min-width: 100% !important;
    max-width: 100% !important;
  }
}

/* Mejorar la experiencia táctil en móvil */
@media (max-width: 640px) {
  .chart-wrapper {
    touch-action: pan-x; /* Solo permitir scroll horizontal */
  }
  
  .mobile-scroll {
    scroll-snap-type: x mandatory;
  }
  
  .mobile-scroll canvas {
    scroll-snap-align: start;
  }
}

/* Indicador visual de scroll */
.mobile-scroll::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 10px;
  width: 20px;
  height: 20px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1));
  border-radius: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  opacity: 0.6;
}

/* Indicadores de scroll personalizados */
.scroll-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.scroll-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: auto;
  cursor: pointer;
}

.scroll-arrow.left {
  left: 10px;
}

.scroll-arrow.right {
  right: 10px;
}

.scroll-arrow:hover {
  background: rgba(0, 0, 0, 0.9);
}

/* Mejorar la experiencia de scroll en dispositivos táctiles */
@media (max-width: 640px) {
  .chart-wrapper {
    touch-action: pan-x; /* Solo permitir scroll horizontal */
  }
  
  .mobile-scroll {
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
  }
  
  .mobile-scroll canvas {
    scroll-snap-align: start;
  }
  
  /* Ocultar scrollbar pero mantener funcionalidad */
  .mobile-scroll::-webkit-scrollbar {
    display: none;
  }
  
  .mobile-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
</style>
