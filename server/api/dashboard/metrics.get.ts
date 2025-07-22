import { defineEventHandler, createError } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  // Excluir animales con ventas o fecha_fallecimiento
  // 1. Obtener IDs de animales vendidos
  const { data: ventasAnimales, error: errVentasAnimales } = await client
    .from("ventas")
    .select("animal_id");
  if (errVentasAnimales) throw createError({ statusCode: 500, message: errVentasAnimales.message });
  const vendidosIds = (ventasAnimales || []).map(v => v.animal_id);

  // 2. Contar animales propios (fecha_nacimiento no nula, sin ventas, sin fecha_fallecimiento)
  const { count: totalAnimals, error: errA } = await client
    .from("animals")
    .select("id_animal", { head: true, count: "exact" })
    .not("fecha_nacimiento", "is", null)
    .is("fecha_fallecimiento", null)
    .not("id_animal", "in", `(${vendidosIds.map(id => `'${id}'`).join(",") || "''"})`);
  if (errA) throw createError({ statusCode: 500, message: errA.message });

  // 1b) Total de corrales (lotes)
  const { count: totalCorrales, error: errCorrales } = await client
    .from("corrales")
    .select("id_corral", { head: true, count: "exact" });
  if (errCorrales) throw createError({ statusCode: 500, message: errCorrales.message });

  // 1c) Conteo de animales por estado de salud (agrupado manualmente)
  const { data: saludData, error: errSalud } = await client
    .from("animals")
    .select("estado_salud, id_animal");
  if (errSalud) throw createError({ statusCode: 500, message: errSalud.message });
  // Agrupar en JS
  const animalsByHealth: Record<string, number> = {};
  for (const row of saludData || []) {
    if (row.estado_salud) animalsByHealth[row.estado_salud] = (animalsByHealth[row.estado_salud] || 0) + 1;
  }

  // 2) Incremento de peso mensual promedio REAL
  // Obtener todos los historiales de peso
  const { data: pesosHist, error: errPH } = await client
    .from("historial_peso")
    .select("animal_id, peso, fecha_registro");
  if (errPH) throw createError({ statusCode: 500, message: errPH.message });

  // Agrupar por animal y por mes
  const incrementosMensuales: number[] = [];
  if (pesosHist && Array.isArray(pesosHist)) {
    const porAnimal: Record<string, { fecha: string; peso: number }[]> = {};
    for (const p of pesosHist) {
      if (!porAnimal[p.animal_id]) porAnimal[p.animal_id] = [];
      porAnimal[p.animal_id].push({ fecha: p.fecha_registro, peso: p.peso });
    }
    for (const historial of Object.values(porAnimal)) {
      // Ordenar por fecha
      historial.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      // Agrupar por año-mes
      const porMes: Record<string, { primero: number; ultimo: number }> = {};
      for (const p of historial) {
        const ym = p.fecha.slice(0, 7); // YYYY-MM
        if (!porMes[ym]) {
          porMes[ym] = { primero: p.peso, ultimo: p.peso };
        } else {
          porMes[ym].ultimo = p.peso;
        }
      }
      // Calcular incremento mensual para ese animal
      for (const mes in porMes) {
        const inc = porMes[mes].ultimo - porMes[mes].primero;
        if (!isNaN(inc)) incrementosMensuales.push(inc);
      }
    }
  }
  // Promedio global mensual
  const weightIncreasePercent = incrementosMensuales.length
    ? Number((incrementosMensuales.reduce((a, b) => a + b, 0) / incrementosMensuales.length).toFixed(2))
    : 0;

  // 3) Total de insumos
  const { count: totalInsumos, error: errI } = await client
    .from("inventario")
    .select("id_inventario", { head: true, count: "exact" });
  if (errI) throw createError({ statusCode: 500, message: errI.message });

  // 4) Stock bajo (<=10 unidades) sumando todas las empresas
  const LOW_THRESHOLD = 10;
  const { data: lowStockItems, error: errL } = await client
    .from("inventario")
    .select("cantidad, proveedor_id")
    .lte("cantidad", LOW_THRESHOLD);
  if (errL) throw createError({ statusCode: 500, message: errL.message });
  // Sumar el total de stock bajo de todas las empresas
  const lowStock = lowStockItems?.reduce((acc, i) => acc + (i.cantidad ?? 0), 0) ?? 0;

  // 5) Gastos inventario
  const { data: invItems, error: errG } = await client
    .from("inventario")
    .select("precio");
  if (errG) throw createError({ statusCode: 500, message: errG.message });
  const totalExpenses =
    invItems?.reduce((acc, i) => acc + (i.precio ?? 0), 0) ?? 0;

  // 6) Ventas totales y análisis anual
  const { data: sales, error: errS } = await client
    .from("ventas")
    .select("animal_id, monto, fecha_venta");
  if (errS) throw createError({ statusCode: 500, message: errS.message });

  type VentasAnualesType = {
    [key: string]: {
      total: number;
      ventas_por_mes: number[];
      cantidad_ventas: number;
    };
  };

  // Análisis de ventas por año
  const ventasAnuales = sales?.reduce<VentasAnualesType>((acc, venta) => {
    const año = new Date(venta.fecha_venta).getFullYear().toString();
    if (!acc[año]) {
      acc[año] = {
        total: 0,
        ventas_por_mes: Array(12).fill(0),
        cantidad_ventas: 0
      };
    }
    acc[año].total += venta.monto ?? 0;
    acc[año].cantidad_ventas++;
    const mes = new Date(venta.fecha_venta).getMonth();
    acc[año].ventas_por_mes[mes] += venta.monto ?? 0;
    return acc;
  }, {});

  // Calcular tendencias anuales
  const años = Object.keys(ventasAnuales || {}).sort((a, b) => a.localeCompare(b));
  const tendenciasAnuales = años.map((año, index) => {
    if (index === 0) return { año, variacion: 0 };
    const ventasAñoActual = ventasAnuales?.[año]?.total ?? 0;
    const ventasAñoAnterior = ventasAnuales?.[años[index - 1]]?.total ?? 0;
    const variacion = ventasAñoAnterior !== 0 
      ? ((ventasAñoActual - ventasAñoAnterior) / ventasAñoAnterior) * 100 
      : 0;
    return {
      año,
      variacion: Number(variacion.toFixed(2))
    };
  });

  const añoActual = new Date().getFullYear().toString();

  // Animal con mayor cantidad de descendencia
  const { data: topDescAnimal, error: errDesc } = await client
    .from("animals")
    .select("id_animal, raza, cantidad_hijos")
    .gt("cantidad_hijos", 0)
    .order("cantidad_hijos", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (errDesc) throw createError({ statusCode: 500, message: errDesc.message });

  return {
    totalAnimals,
    totalCorrales,
    animalsByHealth,
    weightIncreasePercent,
    topDescAnimal,
    totalInsumos,
    lowStock,
    totalExpenses,
    totalSales: sales?.reduce((acc, s) => acc + (s.monto ?? 0), 0) ?? 0,
    salesData: sales?.map((s) => ({
      animal_id: s.animal_id,
      monto: s.monto ?? 0,
      fecha_venta: s.fecha_venta,
    })) ?? [],
    analisis_ventas: {
      ventas_anuales: ventasAnuales ?? {},
      tendencias: tendenciasAnuales,
      resumen_actual: {
        total_año_actual: ventasAnuales?.[añoActual]?.total ?? 0,
        promedio_mensual: ventasAnuales?.[añoActual]?.total 
          ? (ventasAnuales[añoActual].total / 12) 
          : 0
      }
    }
  };
});