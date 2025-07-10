import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'
import { createError, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);
  const ids = body.ids as number[];

  if (!ids || !Array.isArray(ids)) {
    throw createError({
      statusCode: 400,
      statusMessage: "IDs de proveedores no proporcionados",
    });
  }

  try {
    const { error } = await client
      .from("proveedores")
      .delete()
      .in("id_proveedor", ids.map(id => id.toString()));

    if (error) throw error;

    return { success: true, message: `${ids.length} proveedores eliminados` };
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message
    });
  }
});