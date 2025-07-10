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
    // Verificar si el nuevo ID ya existe (excluyendo el registro actual)
    const { data: existingProvider } = await client
      .from("proveedores")
      .select("id_proveedor")
      .eq("id_proveedor", body.id_proveedor)
      .neq("id_proveedor", body.original_id)
      .single();

    if (existingProvider) {
      throw createError({
        statusCode: 400,
        statusMessage: "Este ID de proveedor ya existe",
      });
    }

    const { data, error } = await client
      .from("proveedores")
      .update({
        id_proveedor: body.id_proveedor,
        nombre_empresa: body.nombre_empresa,
        telefono: body.telefono,
        correo_empresa: body.correo_empresa || "",
        direccion: body.direccion || ""
      })
      .eq('id_proveedor', body.original_id)
      .select()
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      });
    }

    return data;
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message
    });
  }
});