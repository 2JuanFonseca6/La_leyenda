import type { Database } from "~/types/supabase";
import type { Session } from "@supabase/supabase-js";

export default defineNuxtRouteMiddleware(async (to) => {
  const client = useSupabaseClient<Database>();
  const toast = useToast();

  // Get authenticated user
  let user = null;

  try {
    const {
      data: { user: supabaseUser },
      error,
    } = await client.auth.getUser();
    if (error) throw error;
    user = supabaseUser;
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  // Redirect if authentication is required
  if (!user && to.meta.requiresAuth) {
    return navigateTo("/login");
  }

  // Role-based access control
  if (user && to.meta.requiredRole) {
    try {
      const { data: profile, error } = await client
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const userProfile = profile as Profile;

      if (to.meta.requiredRole !== userProfile.role) {
        toast.add({ title: "Acceso no autorizado", color: "error", icon: "i-heroicons-exclamation-circle" });
        return navigateTo("/");
      }
    } catch (error) {
      toast.add({ title: "Error cargando perfil", color: "error", icon: "i-heroicons-exclamation-circle" });
      console.error("Error fetching profile:", error);
      return navigateTo("/");
    }
  }
});
