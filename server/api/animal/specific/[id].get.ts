// server/api/animal/specific/[id].get.ts
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'
import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Falta el parámetro 'id'",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  try {
    // Obtener datos del animal
    const {
      data: animal,
      error: animalError,
      status: animalStatus,
    } = await client.from("animals").select("*").eq("id_animal", id).single();

    if (animalError) {
      throw createError({
        statusCode: animalStatus || 500,
        statusMessage: animalError.message,
      });
    }

    // Obtener datos de venta del animal
    const { data: venta, error: ventaError } = await client
      .from("ventas")
      .select("*")
      .eq("animal_id", id)
      .order("fecha_venta", { ascending: false }) // En caso de múltiples ventas
      .limit(1)
      .single();

    const { data: historialSalud } = await client
      .from("historial_salud")
      .select("*")
      .eq("animal_id", id)
      .order("fecha_evento", { ascending: false });

    // No lanza error si no hay venta
    return { animal, venta, historialSalud };
  } catch (err: any) {
    console.error("Error al obtener el animal:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Error desconocido",
    });
  }
});
