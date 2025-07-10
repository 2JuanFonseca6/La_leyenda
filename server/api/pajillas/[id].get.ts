import { serverSupabaseClient } from "#supabase/server"
import type { Database } from "~/types/supabase"

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const id = event.context.params?.id

  if (!id) {
    return createError({ statusCode: 400, statusMessage: "ID requerido" })
  }

  // Convertir id a número
  const numericId = Number(id)

  // Obtener la pajilla (sin fecha_ingreso, usar created_at si se requiere)
  const { data: pajilla, error } = await client
    .from("pajillas")
    .select("id, pajilla, descripcion, stock, created_at, updated_at, animal_id, fecha_uso")
    .eq("id", numericId)
    .single()

  if (error || !pajilla) {
    return createError({ statusCode: 404, statusMessage: "Pajilla no encontrada" })
  }

  // Obtener movimientos
  const { data: movs, error: movsError } = await client
    .from('movimientos_pajilla')
    .select('pajilla_id, tipo_movimiento, cantidad')
    .eq('pajilla_id', numericId)

  if (movsError) {
    return createError({ statusCode: 500, statusMessage: movsError.message })
  }

  // Stock inicial es el campo editable stock
  const stock_inicial = pajilla.stock
  const total_entradas = movs?.filter(m => m.tipo_movimiento === 'ENTRADA').reduce((sum, m) => sum + m.cantidad, 0) || 0
  const total_salidas = movs?.filter(m => m.tipo_movimiento === 'SALIDA').reduce((sum, m) => sum + m.cantidad, 0) || 0
  // Stock final es stock_inicial - total_salidas
  const inventario_final = stock_inicial - total_salidas

  return {
    ...pajilla,
    stock_inicial,
    total_entradas,
    total_salidas,
    inventario_final
  }
}) 