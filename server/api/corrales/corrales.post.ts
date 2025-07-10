// server/api/corrales/corrales.post.ts
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'
import { createError, readBody } from "h3";

export default defineEventHandler(async (event) => {
  console.log("--- HITTING /api/corrales POST ---");
  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);

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
    // Verificar si ya existe un corral con el mismo nombre
    const { data: existingCorral, error: checkError } = await client
      .from("corrales")
      .select("id_corral")
      .eq("nombre", nombre.trim())
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing corral:", checkError);
      throw checkError;
    }

    if (existingCorral) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ya existe un corral con ese nombre",
      });
    }

    // Crear el corral
    const { data, error } = await client
      .from("corrales")
      .insert({
        nombre: nombre.trim(),
        tipo_corral: tipo_corral as "ENGORDE" | "CUARENTENA" | "REPRODUCCION" | "MATERNIDAD" | "DESTETE" | "OTROS",
        capacidad_maxima,
        descripcion: descripcion?.trim() || null,
        fecha_creacion: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating corral:", error);
      throw error;
    }

    console.log(`Corral creado exitosamente: ${data.id_corral}`);

    return {
      success: true,
      corral: data,
      message: "Corral creado exitosamente"
    };

  } catch (err: any) {
    console.error("API Database/Processing Error:", err);
    const statusCode = err.statusCode || err.code || 500;
    const statusMessage =
      err.statusMessage ||
      err.message ||
      "Error desconocido al crear el corral";
    throw createError({
      statusCode: typeof statusCode === "string" ? 500 : statusCode,
      statusMessage: `Error del servidor: ${statusMessage}`,
    });
  }
});