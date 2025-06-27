import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const id = event.context.params?.id;
  const body = await readBody(event);

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID de animal requerido" });
  }
  if (!body?.peso || isNaN(Number(body.peso))) {
    throw createError({ statusCode: 400, statusMessage: "Peso válido requerido" });
  }
  const peso = Number(body.peso);
  const fecha_registro = body.fecha_registro ? new Date(body.fecha_registro).toISOString() : new Date().toISOString();

  try {
    const { data, error } = await client.from("historial_peso" as const).insert({
      animal_id: id,
      peso,
      fecha_registro
    } as Database["public"]["Tables"]["historial_peso"]["Insert"]).select().single();
    if (error) throw error;
    return { historial_peso: data };
  } catch (error: any) {
    throw createError({
      statusCode: error.code || 500,
      statusMessage: error.message || "Error al registrar peso",
    });
  }
}); 