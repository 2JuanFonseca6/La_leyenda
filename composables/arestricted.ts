// composables/useUserRole.ts
import { ref, computed, onMounted } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";

export const useUserRole = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const userRole = ref<string | null>(null);

  onMounted(async () => {
    if (user.value) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.value.id)
        .single();

      const profile = data as { role: string } | null;
      userRole.value = profile?.role ?? null;
    }
  });

  // Propiedades de permisos computadas
  const isAdmin = computed(() => userRole.value === 'admin')
  const isUser = computed(() => userRole.value === 'user')
  const canEdit = computed(() => isAdmin.value)
  const canDelete = computed(() => isAdmin.value)
  const canCreate = computed(() => isAdmin.value)
  const canView = computed(() => isAdmin.value || isUser.value)

  return {
    userRole,
    isAdmin,
    isUser,
    canEdit,
    canDelete,
    canCreate,
    canView,
  };
};
