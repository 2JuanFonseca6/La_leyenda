// server/api/reproduction/reproductions.get.ts
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import { createError, getHeader, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  // Verificación de seguridad (opcional)
  const secFetchSite = getHeader(event, "sec-fetch-site");
  if (secFetchSite === "none" && process.env.NODE_ENV === "production") {
    console.warn(`Acceso directo bloqueado a ${event.path}`);
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const client = await serverSupabaseClient<Database>(event);
  const query = getQuery(event);

  // Validación de parámetros
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const search = String(query.search || "").trim();

  if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "Parámetros de paginación inválidos",
    });
  }

  try {
    let countQuery = client
      .from("reproduccion")
      .select("*", { count: "exact", head: true });
    
    let dataQuery = client
      .from("reproduccion")
      .select("*")
      .order("fecha_evento", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    // Aplicar filtro de búsqueda si se proporciona
    if (search) {
      const searchFilter = `id_reproduccion.eq.${search},madre_id.ilike.%${search}%,padre_id.ilike.%${search}%,raza.ilike.%${search}%,tipo_concepcion.ilike.%${search}%`;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    const { data, error: dataError } = await dataQuery;
    if (dataError) throw dataError;

    // Mapeamos cada fila para añadir `id` = `id_reproduccion`
    const reproduccionesConId = (data || []).map((row) => ({
      ...row,
      id: row.id_reproduccion,
    }));

    return {
      reproducciones: reproduccionesConId,
      total: count || 0,
      page,
      pageSize,
    };
  } catch (err: any) {
    console.error("Error en API reproducciones:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || "Error obteniendo registros",
    });
  }
});
