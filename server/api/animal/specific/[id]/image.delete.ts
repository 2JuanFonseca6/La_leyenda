import { serverSupabaseClient } from "#supabase/server";
import { H3Event, sendError, createError } from "h3";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const client = await serverSupabaseClient<Database>(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, message: "ID no proporcionado" });
  }

  const { data: animal, error: fetchError } = await client
    .from("animals")
    .select("imagen_url")
    .eq("id_animal", id)
    .single();

  if (fetchError || !animal) {
    throw createError({ statusCode: 404, message: "Animal no encontrado" });
  }

  const imagePath = animal.imagen_url?.split("/storage/v1/object/public/")[1];

  if (imagePath) {
    const { error: deleteError } = await client.storage
      .from("imagenes_animales")
      .remove([imagePath]);

    if (deleteError) {
      throw createError({
        statusCode: 500,
        message: "Error al eliminar imagen del storage",
      });
    }
  }

  const { error: updateError } = await client
    .from("animals")
    .update({ imagen_url: null })
    .eq("id_animal", id);

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: "Error al limpiar imagen en base de datos",
    });
  }

  return { success: true };
});
