// server/api/reproduction/reproductions.post.ts
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from '~/types/supabase'

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
    // Validación de IDs de animales
    const verifyAnimal = async (id: string) => {
      const { data, error } = await client
        .from("animals")
        .select("id_animal")
        .eq("id_animal", id)
        .single();

      if (error || !data)
        throw createError({
          statusCode: 400,
          statusMessage: `Animal con ID ${id} no encontrado`,
        });
    };

    await verifyAnimal(body.madre_id);
    if (body.padre_id) await verifyAnimal(body.padre_id);

    // Crear registro
    const { data, error } = await client
      .from("reproduccion")
      .insert({
        fecha_evento: new Date(body.fecha_evento).toISOString(),
        madre_id: body.madre_id,
        padre_id: body.padre_id || null,
        raza: body.raza,
        tipo_concepcion: body.tipo_concepcion,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err: any) {
    console.error("Error creando reproducción:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || "Error creando registro",
    });
  }
});
