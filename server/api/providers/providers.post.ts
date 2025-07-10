import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'
import { createError, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);

  // Validación de campos requeridos
  if (!body.id_proveedor || !body.nombre_empresa || !body.telefono) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID del proveedor, nombre de empresa y teléfono son campos requeridos",
    });
  }

  try {
    const { data, error } = await client.from("proveedores").insert({
      id_proveedor: body.id_proveedor,
      nombre_empresa: body.nombre_empresa,
      telefono: body.telefono,
      correo_empresa: body.correo_empresa || "",
      direccion: body.direccion || ""
    }).select().single();

    if (error) throw error;

    return data;
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message
    });
  }
});