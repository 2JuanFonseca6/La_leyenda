<template>
  <div>
    <UCard v-if="userData">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <UAvatar :src="avatarUrl" size="lg" />
            <div class="flex flex-col space-y-2">
              <h2 v-if="!isEditing" class="text-xl font-semibold">{{ userData.name || 'Sin nombre' }}</h2>
              <UInput v-else v-model="editableUserData.name" placeholder="Nombre completo" size="xl"
                class="font-semibold" />

              <p v-if="!isEditing" class="text-[var(--color-m5)] dark:text-[var(--color-m2)]">{{ userData.email }}</p>
              <UInput v-else v-model="editableUserData.email" type="email" placeholder="Correo electrónico" />
            </div>
          </div>
          <UButton :icon="isEditing ? 'i-heroicons-x-mark' : 'i-heroicons-pencil-square'" size="sm" square
            @click="toggleEdit" :aria-label="isEditing ? 'Cancelar edición' : 'Editar perfil'" />
        </div>
      </template>

      <div class="space-y-2 mb-4">
        <p><strong class="font-medium">Rol:</strong> {{ userData.role || 'Sin rol asignado' }}</p>
        <p><strong class="font-medium">UID:</strong> <span class="text-sm">{{ userData.id }}</span></p>
      </div>

      <UForm v-if="isEditing" :state="editableUserData" @submit="saveChanges">
        <div class="flex justify-end gap-3 mt-4">
          <UButton label="Cancelar" color="error" variant="ghost" @click="cancelEdit" :disabled="loading" />
          <UButton type="submit" label="Guardar Cambios" :loading="loading" :disabled="!hasChanges" />
        </div>
        <p v-if="emailChangeRequiresConfirmation" class="text-sm text-yellow-600 dark:text-yellow-400 mt-3">
          Se ha enviado un correo de confirmación a la nueva dirección. El cambio será efectivo después de la
          confirmación.
        </p>
      </UForm>
    </UCard>
    <USkeleton v-else class="h-48 w-full bg-[var(--color-custom-500)] dark:bg-[var(--color-custom-50)]" />
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase';
type Profile = Database['public']['Tables']['profiles']['Row'];

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toast = useToast()

const userData = ref<(Profile & { email?: string }) | null>(null);
const isEditing = ref(false)
const loading = ref(false)
const editableUserData = ref({ name: '', email: '' })
const emailChangeRequiresConfirmation = ref(false)
const avatarUrl = "https://picsum.photos/512/512?random";

const hasChanges = computed(() => {
  return editableUserData.value.name !== (userData.value?.name || '') ||
    editableUserData.value.email !== (userData.value?.email || '');
});

const fetchUserData = async () => {
  if (!user.value) return;
  loading.value = true;

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', user.value.id)
      .maybeSingle();

    if (profileError) throw profileError;

    userData.value = {
      id: user.value.id,
      name: profileData?.name ?? '',
      email: user.value.email ?? '',
      role: profileData?.role ?? 'user',
    };

    editableUserData.value = {
      name: userData?.value.name ?? '',
      email: userData.value.email,
    };

  } catch (error: any) {
    toast.add({ title: 'Error', description: 'Error cargando perfil', color: 'error', icon: 'i-heroicons-x-mark' });
  } finally {
    loading.value = false;
  }
};

const toggleEdit = () => {
  isEditing.value ? cancelEdit() : startEdit();
};

const startEdit = () => {
  isEditing.value = true;
  editableUserData.value = {
    name: userData.value?.name ?? '',
    email: userData.value?.email ?? '',
  };
};

const cancelEdit = () => {
  isEditing.value = false;
  emailChangeRequiresConfirmation.value = false;
};

const saveChanges = async () => {
  if (!user.value || !userData.value) return;

  loading.value = true;
  const updates: Partial<Profile> = {};
  let emailUpdated = false;

  try {
    // Actualizar nombre en profiles
    if (editableUserData.value.name !== userData.value.name) {
      updates.name = editableUserData.value.name;
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id);

      if (error) throw error;
      userData.value.name = editableUserData.value.name;
    }

    // Actualizar email en auth
    if (editableUserData.value.email !== userData.value.email) {
      const { error } = await supabase.auth.updateUser({
        email: editableUserData.value.email
      });

      if (error) throw error;
      emailChangeRequiresConfirmation.value = true;
      emailUpdated = true;
    }

    toast.add({
      title: 'Éxito',
      description: emailUpdated ? 'Revisa tu correo para confirmar el cambio' : 'Perfil actualizado',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    });

    isEditing.value = false;

  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error', icon: 'i-heroicons-exclamation-circle' });
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUserData);
watch(user, fetchUserData);
</script>