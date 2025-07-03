import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const query = getQuery(event)
  const fecha = query.fecha as string

  if (!fecha) {
    throw createError({ statusCode: 400, statusMessage: 'Fecha requerida' })
  }

  const { data, error } = await client
    .from('movimientos_pajilla')
    .select('id, pajilla_id, tipo_movimiento, cantidad, fecha, animal_id, observaciones')
    .eq('fecha', fecha)
    .eq('tipo_movimiento', 'SALIDA')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { movimientos: data || [] }
}) 