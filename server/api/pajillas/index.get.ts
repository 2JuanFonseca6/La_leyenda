import { serverSupabaseClient } from "#supabase/server"
import type { Database } from "~/types/supabase"

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 10
  const offset = (page - 1) * pageSize

  try {
    // Obtener el total de registros
    const { count, error: countError } = await client
      .from("pajillas")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error al contar pajillas:", countError.message)
      return createError({ statusCode: 500, statusMessage: countError.message })
    }

    // Obtener los datos paginados
    const { data, error } = await client
      .from("pajillas")
      .select("id, pajilla, fecha_ingreso, descripcion, stock")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error("Error al cargar pajillas:", error.message)
      return createError({ statusCode: 500, statusMessage: error.message })
    }

    if (!Array.isArray(data)) {
      // Si data no es un array, probablemente hubo un error de columnas
      return createError({ statusCode: 500, statusMessage: "Error: la columna 'fecha_ingreso' no existe en la tabla 'pajillas'." })
    }
    const pajillas = data as unknown as Array<{ id: number, pajilla: string, fecha_ingreso: string, descripcion: string, stock: number }>;

    // Para cada pajilla, obtener los movimientos y calcular stock
    let movimientos: any[] = []
    let pajillaIds: number[] = []
    if (pajillas.length > 0) {
      pajillaIds = pajillas.map(p => p.id)
      const { data: movs, error: movsError } = await client
        .from('movimientos_pajilla')
        .select('pajilla_id, tipo_movimiento, cantidad')
        .in('pajilla_id', pajillaIds)
      if (movsError) {
        console.error('Error al obtener movimientos:', movsError.message)
        return createError({ statusCode: 500, statusMessage: movsError.message })
      }
      movimientos = movs || []
    }

    // Calcular stock y movimientos por pajilla
    const pajillasConInventario = pajillas.map(p => {
      const movs = movimientos.filter(m => m.pajilla_id === p.id)
      const stock_inicial = p.stock
      const total_entradas = movs.filter(m => m.tipo_movimiento === 'ENTRADA').reduce((sum, m) => sum + m.cantidad, 0)
      const total_salidas = movs.filter(m => m.tipo_movimiento === 'SALIDA').reduce((sum, m) => sum + m.cantidad, 0)
      // Stock final es stock_inicial - total_salidas
      const inventario_final = stock_inicial - total_salidas
      return {
        id: p.id,
        pajilla: p.pajilla,
        fecha_ingreso: p.fecha_ingreso,
        descripcion: p.descripcion,
        stock: p.stock,
        stock_inicial,
        total_entradas,
        total_salidas,
        inventario_final
      }
    })

    return {
      pajillas: pajillasConInventario,
      total: count || 0
    }
  } catch (error) {
    console.error("Unexpected error in pajillas GET:", error)
    return createError({ 
      statusCode: 500, 
      statusMessage: error instanceof Error ? error.message : "Error interno del servidor" 
    })
  }
})
