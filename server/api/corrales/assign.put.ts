// server/api/corrales/assign.put.ts
import { serverSupabaseClient } from "#supabase/server";
import { createError, readBody } from "h3";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  console.log("--- HITTING /api/corrales/assign PUT ---");
  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);

  let { animalId, corralId } = body;

  // Validaciones
  if (!animalId || typeof animalId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "ID del animal es requerido",
    });
  }

  if (!corralId || typeof corralId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "ID del corral es requerido",
    });
  }

  try {
    // 1. Verificar capacidad del corral
    const { data: corral, error: corralError } = await client
      .from("corrales")
      .select("capacidad_maxima")
      .eq("id_corral", corralId)
      .single();

    if (corralError) throw corralError;

    // 2. Contar animales en el corral
    const { count: animalCount, error: countError } = await client
      .from("animals")
      .select("*", { count: "exact", head: true })
      .eq("id_corral", corralId);

    if (countError) throw countError;

    if ((animalCount || 0) >= corral.capacidad_maxima) {
      throw createError({
        statusCode: 400,
        statusMessage: "El corral ha alcanzado su capacidad máxima",
      });
    }

    // 3. ACTUALIZAR EL ANIMAL EN LA BASE DE DATOS
    const { error: updateError } = await client
      .from("animals")
      .update({ id_corral: corralId })
      .eq("id_animal", animalId);

    if (updateError) throw updateError;

    return {
      success: true,
      message: "Animal asignado al corral exitosamente",
      animalId
    };

  } catch (err: any) {
    console.error("Error asignando animal:", err);
    const statusCode = err.statusCode || 500;
    const statusMessage = err.statusMessage || "Error desconocido al asignar el animal";
    throw createError({
      statusCode,
      statusMessage: `Error del servidor: ${statusMessage}`,
    });
  }
});