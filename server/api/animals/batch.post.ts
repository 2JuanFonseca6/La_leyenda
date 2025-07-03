import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const body = await readBody(event)
  const ids = body.ids as string[]

  if (!ids || !Array.isArray(ids)) {
    throw createError({ statusCode: 400, statusMessage: 'IDs requeridos' })
  }

  const { data, error } = await client
    .from('animals')
    .select('id_animal, tipo_animal, raza')
    .in('id_animal', ids)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { animals: data || [] }
}) 