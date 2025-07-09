import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/supabase";
import { readBody } from "h3";

type InventoryUpdate = Database["public"]["Tables"]["inventario"]["Update"];

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Autenticación requerida",
    });
  }

  const body = await readBody<Partial<InventoryUpdate>>(event);
  const idParam = event.context.params?.id;
  const id = idParam ? Number(idParam) : undefined;

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de inventario es requerido y debe ser un número",
    });
  }

  const updateData: InventoryUpdate = {
    tipo: body.tipo,
    descripcion: body.descripcion,
    cantidad: body.cantidad,
    precio: body.precio,
    proveedor_id: body.proveedor_id,
    factura_url: body.factura_url
  };

  // Validación básica
  if (updateData.cantidad && updateData.cantidad < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "La cantidad no puede ser negativa"
    });
  }

  if (updateData.precio && updateData.precio < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "El precio no puede ser negativo"
    });
  }

  try {
    const { data, error } = await client
      .from("inventario")
      .update(updateData)
      .eq("id_inventario", id)
      .select()
      .single();

    if (error) {
      throw createError({
        statusCode: error.code === '42501' ? 403 : 400,
        statusMessage: error.message
      });
    }

    return {
      success: true,
      data
    };

  } catch (error: any) {
    console.error("Error actualizando inventario:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Error actualizando el registro"
    });
  }
});