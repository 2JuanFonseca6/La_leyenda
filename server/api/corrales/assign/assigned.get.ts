// server/api/corrales/assign/assigned.get.ts
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  try {
    const { data, error } = await client
      .from('animals')
      .select('id_animal')
      .not('id_corral', 'is', null);

    if (error) {
      throw error;
    }

    return data.map(animal => animal.id_animal);
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener animales asignados',
      message: err.message
    });
  }
});