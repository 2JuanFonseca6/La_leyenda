// server/api/corrales/specific/[id].delete.ts
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  console.log("--- HITTING /api/corrales/[id] DELETE ---");
  const client = await serverSupabaseClient<Database>(event);
  const corralId = getRouterParam(event, 'id');

  if (!corralId) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID del corral es requerido",
    });
  }

  try {
    // Verificar que el corral existe
    const { data: existingCorral, error: checkError } = await client
      .from("corrales")
      .select("*")
      .eq("id_corral", corralId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking corral:", checkError);
      throw checkError;
    }

    if (!existingCorral) {
      throw createError({
        statusCode: 404,
        statusMessage: "Corral no encontrado",
      });
    }

    // Verificar si hay animales asignados al corral
    const { count: animalsCount, error: countError } = await client
      .from("animals")
      .select("*", { count: "exact", head: true })
      .eq("id_corral", corralId);

    if (countError) {
      console.error("Error counting animals:", countError);
      throw countError;
    }

    if ((animalsCount || 0) > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `No se puede eliminar el corral. Hay ${animalsCount} animales asignados. Mueva los animales antes de eliminar el corral.`,
      });
    }

    // Eliminar el corral
    const { error: deleteError } = await client
      .from("corrales")
      .delete()
      .eq("id_corral", corralId);

    if (deleteError) {
      console.error("Error deleting corral:", deleteError);
      throw deleteError;
    }

    console.log(`Corral eliminado exitosamente: ${corralId}`);

    return {
      success: true,
      message: "Corral eliminado exitosamente",
      deletedCorralId: corralId
    };

  } catch (err: any) {
    console.error("API Database/Processing Error:", err);
    const statusCode = err.statusCode || err.code || 500;
    const statusMessage =
      err.statusMessage ||
      err.message ||
      "Error desconocido al eliminar el corral";
    throw createError({
      statusCode: typeof statusCode === "string" ? 500 : statusCode,
      statusMessage: `Error del servidor: ${statusMessage}`,
    });
  }
});