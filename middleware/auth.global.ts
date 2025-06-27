import type { Database } from "~/types/supabase";

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip authentication check for public routes
  const publicRoutes = ['/login', '/callback', '/about', '/']
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NUXT_SUPABASE_URL
  const supabaseKey = process.env.NUXT_SUPABASE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not configured. Please check SUPABASE_SETUP.md')
    // Allow access but show warning
    return
  }

  const client = useSupabaseClient<Database>();

  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    
    if (error) {
      console.error("Supabase auth error:", error);
      // Only redirect if it's not a session missing error (which is expected when not logged in)
      if (!error.message?.includes('Auth session missing')) {
        console.error("Unexpected auth error:", error);
      }
    }
    
    // If no user and route requires auth, redirect to login
    if (!user && to.meta.requiresAuth) {
      return navigateTo("/login");
    }

    // Role-based access control
    if (user && to.meta.requiredRole) {
      try {
        const { data: profile, error: profileError } = await client
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return navigateTo("/");
        }

        const userProfile = profile as Profile;

        if (to.meta.requiredRole !== userProfile.role) {
          const toast = useToast();
          toast.add({ title: "Acceso no autorizado", color: "error", icon: "i-heroicons-exclamation-circle" });
          return navigateTo("/");
        }
      } catch (error) {
        console.error("Error in role check:", error);
        return navigateTo("/");
      }
    }
  } catch (error) {
    console.error("Unexpected error in auth middleware:", error);
    // Don't redirect on unexpected errors, just log them
  }
});
