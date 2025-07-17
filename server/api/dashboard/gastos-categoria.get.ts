import { serverSupabaseClient } from "#supabase/server";
import type { Database } from '~/types/supabase';
import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  try {
    // Agrupar por tipo y sumar los precios
    const { data, error } = await client
      .from("inventario")
      .select("tipo, precio")
      .eq("activo", true);

    if (error) throw error;

    // Agrupar y sumar en JS
    const gastosPorCategoria: Record<string, number> = {};
    (data || []).forEach(item => {
      if (!item.tipo) return;
      gastosPorCategoria[item.tipo] = (gastosPorCategoria[item.tipo] || 0) + (item.precio || 0);
    });

    // Formatear para el frontend
    const result = Object.entries(gastosPorCategoria).map(([tipo, total]) => ({ tipo, total }));
    return { categorias: result };
  } catch (err: any) {
    throw createError({
      statusCode: err.code || 500,
      message: `Error al obtener gastos por categoría: ${err.message}`,
    });
  }
}); 