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
  const searchDate = String(query.date || '').trim();

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

    // OPTIMIZACIÓN: Si no hay búsqueda, primero trae solo los IDs de la página, luego los detalles
    if (!searchTerm && !searchDate) {
      // 1. Trae solo los IDs de la página
      const { data: idsData, error: idsError } = await client
        .from("inventario")
        .select("id_inventario")
        .order("id_inventario", { ascending: false })
        .range(rangeFrom, rangeTo);
      if (idsError) throw idsError;
      const ids = (idsData || []).map(i => i.id_inventario);
      // 2. Trae los detalles solo de esos IDs
      let data: any[] = [];
      if (ids.length > 0) {
        const { data: details, error: detailsError } = await client
          .from("inventario")
          .select("id_inventario, tipo, descripcion, cantidad, precio, proveedor_id, factura_url, fecha")
          .in("id_inventario", ids);
        if (detailsError) throw detailsError;
        // Mantener el orden original de la página
        data = ids.map(id => details.find((d: any) => d.id_inventario === id)).filter(Boolean);
      }
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      return {
        items: data,
        total: count ?? 0,
        page: page,
        pageSize: pageSize,
      };
    } else {
      // Si hay búsqueda, usa la lógica original
      let query = client
        .from("inventario")
        .select("id_inventario, tipo, descripcion, cantidad, precio, proveedor_id, factura_url, fecha")
        .order("id_inventario", { ascending: false })
        .range(rangeFrom, rangeTo);
      
      let countQuery = client
        .from("inventario")
        .select("id_inventario", { count: "exact", head: true });

      // Aplicar filtros
      if (searchTerm && searchDate) {
        // Ambos filtros: texto Y fecha
        const textFilter = `tipo.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%,proveedor_id.ilike.%${searchTerm}%`;
        query = query.or(textFilter).eq('fecha', searchDate);
        countQuery = countQuery.or(textFilter).eq('fecha', searchDate);
      } else if (searchTerm) {
        // Solo filtro de texto
        const textFilter = `tipo.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%,proveedor_id.ilike.%${searchTerm}%`;
        query = query.or(textFilter);
        countQuery = countQuery.or(textFilter);
      } else if (searchDate) {
        // Solo filtro de fecha
        query = query.eq('fecha', searchDate);
        countQuery = countQuery.eq('fecha', searchDate);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      const { data, error: dataError } = await query;
      if (dataError) throw dataError;
      return {
        items: data || [],
        total: count ?? 0,
        page: page,
        pageSize: pageSize,
      };
    }
  } catch (err: any) {
    throw createError({
      statusCode: err.code || 500,
      statusMessage: `Error del servidor: ${err.message}`,
    });
  }
});
