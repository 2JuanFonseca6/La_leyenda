import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('animals')
    .select('id_animal, tipo_animal, raza, estado_salud, peso_actual')
    .order('id_animal', { ascending: true })

  if (error) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.message }))
  }

  return data
})
