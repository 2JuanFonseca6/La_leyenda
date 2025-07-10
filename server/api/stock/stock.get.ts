// server/api/stock/items.get.ts
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'
import { createError, getHeader, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const query = getQuery(event);

  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const searchTerm = String(query.search || "").trim();

  if (isNaN(page) || page < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "Número de página inválido",
    });
  }

  if (isNaN(pageSize) || pageSize < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tamaño de página inválido",
    });
  }

  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  try {
    let countQuery = client
      .from("inventario")
      .select("id_inventario", { count: "exact", head: true });

    let dataQuery = client
      .from("inventario")
      .select("id_inventario, tipo, descripcion, cantidad, precio, proveedor_id, factura_url")
      .order("id_inventario", { ascending: false })
      .range(rangeFrom, rangeTo);

    if (searchTerm) {
      const searchFilter = `
        tipo.ilike.%${searchTerm}%,
        descripcion.ilike.%${searchTerm}%,
        proveedor_id.ilike.%${searchTerm}%
      `;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    const { data, error: dataError } = await dataQuery;
    if (dataError) throw dataError;

    return {
      items: data || [],
      total: count ?? 0,
      page: page,
      pageSize: pageSize,
    };
  } catch (err: any) {
    throw createError({
      statusCode: err.code || 500,
      statusMessage: `Error del servidor: ${err.message}`,
    });
  }
});
