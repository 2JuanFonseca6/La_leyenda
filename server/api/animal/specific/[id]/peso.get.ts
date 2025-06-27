import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const id = event.context.params?.id;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID de animal requerido" });
  }

  try {
    const { data, error } = await client
      .from("historial_peso" as const)
      .select("id, peso, fecha_registro, animal_id")
      .eq("animal_id", id)
      .order("fecha_registro", { ascending: true });
    if (error) throw error;
    return { historial_peso: data };
  } catch (error: any) {
    throw createError({
      statusCode: error.code || 500,
      statusMessage: error.message || "Error al obtener historial de peso",
    });
  }
}); 