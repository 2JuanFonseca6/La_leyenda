// server/api/corrales/corrales.get.ts
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { createError, getHeader, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const secFetchSite = getHeader(event, "sec-fetch-site");
  if (secFetchSite === "none" && process.env.NODE_ENV === "production") {
    console.warn(
      `Acceso directo bloqueado para la ruta ${event.path}. Sec-Fetch-Site: ${secFetchSite}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Direct access not allowed.",
    });
  }

  console.log("--- HITTING /api/corrales ---");
  const client = await serverSupabaseClient<Database>(event);
  const query = getQuery(event);

  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 50;
  const searchTerm = String(query.search || "").trim();
  const includeAnimals = query.includeAnimals === 'true';

  console.log(`API Received Query: ${JSON.stringify(query)}`);

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
      .from("corrales")
      .select("*", { count: "exact", head: true });

    // Construir selectFields dinámicamente
    let selectFields = `
      id_corral,
      nombre,
      tipo_corral,
      capacidad_maxima,
      descripcion,
      fecha_creacion
    `;

    if (includeAnimals) {
      selectFields += `, animals:animals(id_animal, raza, peso_actual, tipo_animal, estado_salud)`;
    } else {
      selectFields += `, animal_count:animals(count)`;
    }

    let dataQuery = client
      .from("corrales")
      .select(selectFields)
      .order("nombre", { ascending: true })
      .range(rangeFrom, rangeTo);

    if (searchTerm) {
      const searchFilter = `nombre.ilike.%${searchTerm}%,tipo_corral.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error("API Supabase count error:", countError);
      throw countError;
    }

    const { data, error: dataError } = await dataQuery;
    if (dataError) {
      console.error("API Supabase data fetch error:", dataError);
      throw dataError;
    }

    // Procesar los datos de animales
    type Corral = {
      id_corral: string;
      nombre: string;
      tipo_corral: string;
      capacidad_maxima: number;
      descripcion: string;
      fecha_creacion: string;
      animals?: Array<{
        id_animal: number;
        raza: string;
        peso_actual: number;
        tipo_animal: string;
        estado_salud: string;
      }>;
      animal_count?: number;
      [key: string]: any;
    };

    const corralesWithData = (Array.isArray(data) ? (data as unknown as Corral[]) : []).map((corral) => {
      // Para el conteo de animales
      let animalCount = 0;

      // Si se incluyeron animales, obtener el conteo y datos
      if (includeAnimals) {
        animalCount = corral.animals?.length || 0;
      } else {
        // Si no se incluyeron animales, usar el conteo de la consulta
        animalCount = corral.animal_count || 0;
      }

      return {
        ...corral,
        id_corral: corral.id_corral.toString(),
        animal_count: animalCount,
        // Solo incluir animales si se solicitó
        animals: includeAnimals ? (corral.animals || []) : []
      };
    });

    console.log(`API Fetched ${corralesWithData.length} corrales for page ${page}`);

    return {
      corrales: corralesWithData,
      total: count ?? 0,
      page: page,
      pageSize: pageSize,
    };
  } catch (err: any) {
    console.error("API Database/Processing Error:", err);
    const statusCode = err.statusCode || err.code || 500;
    const statusMessage =
      err.statusMessage ||
      err.message ||
      "Error desconocido en la base de datos";
    throw createError({
      statusCode: typeof statusCode === "string" ? 500 : statusCode,
      statusMessage: `Error del servidor: ${statusMessage}`,
    });
  }
});