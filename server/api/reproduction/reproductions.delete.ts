import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);
  
  // Verificar que el usuario esté autenticado
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  // Verificar que el usuario sea admin
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Acceso denegado. Se requieren permisos de administrador.' })
  }

  const body = await readBody(event);

  try {
    const { error } = await client
      .from("reproduccion")
      .delete()
      .in("id_reproduccion", body.ids);

    if (error) throw error;

    return {
      success: true,
      message: `${body.ids.length} registros eliminados correctamente`,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || "Error eliminando registros",
    });
  }
});
