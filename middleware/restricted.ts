import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useSupabaseUser,
} from "#imports";

export default defineNuxtRouteMiddleware(async (to) => {
  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NUXT_SUPABASE_URL
  const supabaseKey = process.env.NUXT_SUPABASE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not configured. Please check SUPABASE_SETUP.md')
    // Allow access but show warning
    return
  }

  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Check if user exists
  if (!user.value) {
    console.log("No user found, redirecting to login");
    return navigateTo("/login");
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.value.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return navigateTo("/error");
    }

    const profile = data as { role: string } | null;

    if (!profile) {
      console.log("No profile found for user");
      return navigateTo("/error");
    }

    if (profile.role !== "admin") {
      console.log("User is not admin, redirecting to home");
      return navigateTo("/");
    }
  } catch (error) {
    console.error("Unexpected error in restricted middleware:", error);
    return navigateTo("/error");
  }
});
