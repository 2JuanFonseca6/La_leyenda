import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'
import { createError, getHeader, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const secFetchSite = getHeader(event, "sec-fetch-site");
  if (secFetchSite === "none" && process.env.NODE_ENV === "production") {
    console.warn(`Acceso directo bloqueado para la ruta ${event.path}`);
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Direct access not allowed.",
    });
  }

  const client = await serverSupabaseClient<Database>(event);
  const query = getQuery(event);

  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const searchTerm = String(query.search || "").trim();

  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  try {
    let queryBuilder = client
      .from("profiles")
      .select("*", { count: "exact" })
      .order("email", { ascending: true }) // Cambiado a email en lugar de created_at
      .range(rangeFrom, rangeTo);

    if (searchTerm) {
      queryBuilder = queryBuilder.or(
        `email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`
      );
    }

    const { data, count, error } = await queryBuilder;

    if (error) throw error;

    return {
      profiles: data,
      total: count ?? 0,
      page: page,
      pageSize: pageSize,
    };
  } catch (err: any) {
    console.error("Error en endpoint /api/profiles/profiles:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || "Error del servidor",
    });
  }
});
