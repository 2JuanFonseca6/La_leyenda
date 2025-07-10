// server/api/stock/items.post.ts
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);

  try {
    // Validar proveedor
    const { data: proveedor, error: proveedorError } = await client
      .from("proveedores")
      .select("id_proveedor")
      .eq("id_proveedor", body.proveedor_id)
      .single();

    if (proveedorError || !proveedor) {
      throw createError({
        statusCode: 400,
        statusMessage: "Proveedor no encontrado",
      });
    }

    // Insertar en inventario
    const { data, error } = await client
      .from("inventario")
      .insert({
        cantidad: body.cantidad,
        descripcion: body.descripcion,
        precio: body.precio,
        proveedor_id: body.proveedor_id,
        tipo: body.tipo,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err: any) {
    console.error("Error creando artículo:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || "Error al crear el artículo",
    });
  }
});