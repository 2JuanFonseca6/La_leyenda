// server/api/animal/specific/[id].get.ts
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase"; // Ajusta si es necesario
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
    const { data, error, status } = await client
      .from("inventario")
      .select("*")
      .eq("id_inventario", id)
      .single();

    if (error) {
      throw createError({
        statusCode: status || 500,
        statusMessage: error.message,
      });
    }

    return data;
  } catch (err: any) {
    console.error("Error al obtener inventario:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Error desconocido",
    });
  }
});
