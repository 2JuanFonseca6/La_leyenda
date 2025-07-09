// server/api/corrales/specific/[id].put.ts
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'
import { createError, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);
  const id = getRouterParam(event, 'id');

  if (!id || typeof id !== 'string' || id.length < 32) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de corral inválido",
    });
  }

  const corralId = id;

  const { nombre, tipo_corral, capacidad_maxima, descripcion } = body;

  // Validaciones
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nombre del corral es requerido",
    });
  }

  if (!tipo_corral || typeof tipo_corral !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "Tipo de corral es requerido",
    });
  }

  if (!capacidad_maxima || typeof capacidad_maxima !== 'number' || capacidad_maxima <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Capacidad máxima debe ser un número mayor a 0",
    });
  }

  const tiposPermitidos = ["ENGORDE", "CUARENTENA", "REPRODUCCION", "MATERNIDAD", "DESTETE", "OTROS"];
  if (!tiposPermitidos.includes(tipo_corral)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tipo de corral no válido",
    });
  }

  try {
    // Verificar si el corral existe
    const { data: existingCorral, error: fetchError } = await client
      .from("corrales")
      .select("id_corral")
      .eq("id_corral", corralId)
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

    // Verificar si ya existe otro corral con el mismo nombre
    const { data: duplicateCorral, error: duplicateError } = await client
      .from("corrales")
      .select("id_corral")
      .eq("nombre", nombre.trim())
      .neq("id_corral", corralId) // Excluir el corral actual
      .maybeSingle();

    if (duplicateError) {
      console.error("Error checking duplicate corral:", duplicateError);
      throw duplicateError;
    }

    if (duplicateCorral) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ya existe un corral con ese nombre",
      });
    }

    // Actualizar el corral
    const { data, error } = await client
      .from("corrales")
      .update({
        nombre: nombre.trim(),
        tipo_corral: tipo_corral as "ENGORDE" | "CUARENTENA" | "REPRODUCCION" | "MATERNIDAD" | "DESTETE" | "OTROS",
        capacidad_maxima,
        descripcion: descripcion?.trim() || null,
      })
      .eq("id_corral", corralId)
      .select()
      .single();

    if (error) {
      console.error("Error updating corral:", error);
      throw error;
    }

    console.log(`Corral actualizado exitosamente: ${data.id_corral}`);

    return {
      success: true,
      corral: data,
      message: "Corral actualizado exitosamente"
    };

  } catch (err: any) {
    console.error("API Database/Processing Error:", err);
    const statusCode = err.statusCode || err.code || 500;
    const statusMessage =
      err.statusMessage ||
      err.message ||
      "Error desconocido al actualizar el corral";
    throw createError({
      statusCode: typeof statusCode === "string" ? 500 : statusCode,
      statusMessage: `Error del servidor: ${statusMessage}`,
    });
  }
});