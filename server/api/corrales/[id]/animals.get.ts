// server/api/corrales/[id]/animals.get.ts
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { createError, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  console.log("--- HITTING /api/corrales/[id]/animals GET ---");
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
    const { data: corral, error: corralError } = await client
      .from("corrales")
      .select("*")
      .eq("id_corral", corralId)
      .maybeSingle();

    if (corralError) {
      console.error("Error checking corral:", corralError);
      throw corralError;
    }

    if (!corral) {
      throw createError({
        statusCode: 404,
        statusMessage: "Corral no encontrado",
      });
    }

    // Obtener animales del corral
    const { data: animals, error: animalsError } = await client
      .from("animals")
      .select("*")
      .eq("id_corral", corralId)
      .order("fecha_nacimiento", { ascending: false });

    if (animalsError) {
      console.error("Error fetching animals:", animalsError);
      throw animalsError;
    }

    console.log(`Found ${animals?.length || 0} animals in corral ${corralId}`);

    return {
      success: true,
      corral: corral,
      animals: animals || [],
      count: animals?.length || 0
    };

  } catch (err: any) {
    console.error("API Database/Processing Error:", err);
    const statusCode = err.statusCode || err.code || 500;
    const statusMessage =
      err.statusMessage ||
      err.message ||
      "Error desconocido al obtener animales del corral";
    throw createError({
      statusCode: typeof statusCode === "string" ? 500 : statusCode,
      statusMessage: `Error del servidor: ${statusMessage}`,
    });
  }
});