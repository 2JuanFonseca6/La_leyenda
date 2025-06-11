// server/api/corrales/specific/[id].put.ts
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { createError, readBody, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  console.log("--- HITTING /api/corrales/[id] PUT ---");
  const client = await serverSupabaseClient<Database>(event);
  const corralId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!corralId) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID del corral es requerido",
    });
  }

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

  // Validar tipos de corral permitidos
  const tiposPermitidos = ["ENGORDE", "CUARENTENA", "REPRODUCCION", "MATERNIDAD", "DESTETE", "OTROS"];
  if (!tiposPermitidos.includes(tipo_corral)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tipo de corral no válido",
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

    // Verificar si ya existe otro corral con el mismo nombre (excluyendo el actual)
    const { data: duplicateCorral, error: duplicateError } = await client
      .from("corrales")
      .select("id_corral")
      .eq("nombre", nombre.trim())
      .neq("id_corral", corralId)
      .maybeSingle();

    if (duplicateError) {
      console.error("Error checking duplicate name:", duplicateError);
      throw duplicateError;
    }

    if (duplicateCorral) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ya existe otro corral con ese nombre",
      });
    }

    // Verificar capacidad si hay animales asignados
    const { count: currentAnimals, error: countError } = await client
      .from("animals")
      .select("*", { count: "exact", head: true })
      .eq("id_corral", corralId);

    if (countError) {
      console.error("Error counting animals:", countError);
      throw countError;
    }

    if ((currentAnimals || 0) > capacidad_maxima) {
      throw createError({
        statusCode: 400,
        statusMessage: `No se puede reducir la capacidad a ${capacidad_maxima}. Actualmente hay ${currentAnimals} animales asignados`,
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