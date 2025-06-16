// server/api/corrales/specific/[id].delete.ts
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const id = getRouterParam(event, 'id');

  if (!id || isNaN(Number(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de corral inválido",
    });
  }

  const corralId = Number(id);

  try {
    // Verificar si el corral existe
    const { data: existingCorral, error: fetchError } = await client
      .from("corrales")
      .select("id_corral")
      .eq("id_corral", corralId.toString())
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching corral:", fetchError);
      throw fetchError;
    }

    if (!existingCorral) {
      throw createError({
        statusCode: 404,
        statusMessage: "Corral no encontrado",
      });
    }

    // Verificar si el corral tiene animales asignados
    const { data: animalsInCorral, error: animalsError } = await client
      .from("animals")
      .select("id_animal")
      .eq("id_corral", corralId.toString())
      .limit(1);

    if (animalsError) {
      console.error("Error checking animals in corral:", animalsError);
      throw animalsError;
    }

    if (animalsInCorral && animalsInCorral.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No se puede eliminar el corral porque tiene animales asignados",
      });
    }

    // Eliminar el corral
    const { error } = await client
      .from("corrales")
      .delete()
      .eq("id_corral", corralId.toString());

    if (error) {
      console.error("Error deleting corral:", error);
      throw error;
    }

    console.log(`Corral eliminado exitosamente: ${corralId}`);

    return {
      success: true,
      message: "Corral eliminado exitosamente"
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