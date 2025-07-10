// server/api/providers/providers.get.ts
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase'
import { createError, getHeader, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const query = getQuery(event);

  // Validación de parámetros
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "Parámetros de paginación inválidos",
    });
  }

  try {
    // Consulta principal
    const { data, error, count } = await client
      .from("proveedores")
      .select("*", { count: "exact" })
      .order("nombre_empresa", { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    return {
      proveedores: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  } catch (err: any) {
    console.error("Error obteniendo proveedores:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || "Error obteniendo proveedores",
    });
  }
});