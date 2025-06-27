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
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error("Error al cargar pajillas:", error.message)
      return createError({ statusCode: 500, statusMessage: error.message })
    }

    // Obtener estadísticas generales de todas las pajillas
    const { data: allPajillas, error: statsError } = await client
      .from("pajillas")
      .select("stock, animal_id")

    if (statsError) {
      console.error("Error al obtener estadísticas:", statsError.message)
    }

    // Calcular estadísticas generales
    const stats = {
      totalStock: 0,
      availableStock: 0,
      usedStock: 0,
      withAnimal: 0,
      totalItems: count || 0
    }

    if (allPajillas) {
      stats.totalStock = allPajillas.reduce((sum, item) => sum + (item.stock || 0), 0)
      stats.availableStock = allPajillas.filter(item => (item.stock || 0) > 0).length
      stats.usedStock = allPajillas.filter(item => (item.stock || 0) === 0).length
      stats.withAnimal = allPajillas.filter(item => item.animal_id).length
    }

    // Return paginated data with total count and general stats
    return {
      pajillas: data || [],
      total: count || 0,
      stats
    }
  } catch (error) {
    console.error("Unexpected error in pajillas GET:", error)
    return createError({ 
      statusCode: 500, 
      statusMessage: error instanceof Error ? error.message : "Error interno del servidor" 
    })
  }
})
