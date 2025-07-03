// server/api/animal/animals.get.ts
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { createError, getHeader, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const secFetchSite = getHeader(event, "sec-fetch-site");
  if (secFetchSite === "none" && process.env.NODE_ENV === "production") {
    // Quizás solo en producción
    console.warn(
      `Acceso directo bloqueado para la ruta ${event.path}. Sec-Fetch-Site: ${secFetchSite}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Direct access not allowed.",
    });
  }

  console.log("--- HITTING /api/animal/animals.get ---");
  const client = await serverSupabaseClient<Database>(event);
  const query = getQuery(event);

  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const searchTerm = String(query.search || "").trim();

  console.log(`API Received Query: ${JSON.stringify(query)}`);
  console.log(
    `API Parsed - Page: ${page}, PageSize: ${pageSize}, Search: "${searchTerm}"`
  );

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
  console.log(`API Calculated Range: From ${rangeFrom} To ${rangeTo}`);

  try {
    let countQuery = client
      .from("animals")
      .select("*", { count: "exact", head: true });
    let dataQuery = client
      .from("animals")
      .select("*")
      .order("fecha_nacimiento", { ascending: false })
      .range(rangeFrom, rangeTo);

    if (searchTerm) {
      const safeSearch = String(searchTerm || '').trim();
      if (safeSearch.length > 0) {
        const isNumeric = /^\d+$/.test(safeSearch);
        let searchFilter = `raza.ilike.%${safeSearch}%,estado_salud.ilike.%${safeSearch}%,tipo_animal::text.ilike.%${safeSearch}%`;
        if (isNumeric) {
          // Coincidencia exacta en id_animal, usando cast numérico si es necesario
          searchFilter = `id_animal.eq.${Number(safeSearch)},` + searchFilter;
        } else {
          searchFilter = `id_animal.ilike.%${safeSearch}%,` + searchFilter;
        }
        countQuery = countQuery.or(searchFilter);
        dataQuery = dataQuery.or(searchFilter);
      }
    }

    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error("API Supabase count error:", countError);
      throw countError;
    }
    console.log(`API Fetched Count: ${count}`);

    const { data, error: dataError } = await dataQuery;
    if (dataError) {
      console.error("API Supabase data fetch error:", dataError);
      throw dataError;
    }
    console.log(`API Fetched ${data?.length ?? 0} records for page ${page}`);

    return {
      animals: data || [],
      total: count ?? 0,
      page: page,
      pageSize: pageSize,
    };
  } catch (err: any) {
    console.error("API Database/Processing Error:", err);
    const statusCode = err.statusCode || err.code || 500; // Supabase a veces usa 'code' para errores HTTP-like
    const statusMessage =
      err.statusMessage ||
      err.message ||
      "Error desconocido en la base de datos";
    throw createError({
      statusCode: typeof statusCode === "string" ? 500 : statusCode, // Asegurar que statusCode sea número
      statusMessage: `Error del servidor: ${statusMessage}`,
    });
  }
});
