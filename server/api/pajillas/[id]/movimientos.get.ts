import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const idParam = event.context.params?.id

  if (!idParam) {
    throw createError({ statusCode: 400, statusMessage: 'ID de pajilla requerido.' })
  }

  const id = Number(idParam)
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de pajilla inválido.' })
  }

  // Buscar movimientos de la pajilla
  const { data, error } = await client
    .from('movimientos_pajilla')
    .select('id, tipo_movimiento, cantidad, fecha, animal_id, observaciones')
    .eq('pajilla_id', id)
    .order('fecha', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { movimientos: data || [] }
}) 