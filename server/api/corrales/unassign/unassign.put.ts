// server/api/animal/unassign.put.ts
import { serverSupabaseClient } from "#supabase/server";
import { createError, readBody } from "h3";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);

  const { animalId } = body;

  if (!animalId || typeof animalId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "ID del animal es requerido",
    });
  }

  try {
    const { error } = await client
      .from('animals')
      .update({ id_corral: null })
      .eq('id_animal', animalId);

    if (error) throw error;

    return { success: true, message: "Animal desasignado correctamente" };
  } catch (err: any) {
    console.error('Error desasignando animal:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al desasignar el animal'
    });
  }
});