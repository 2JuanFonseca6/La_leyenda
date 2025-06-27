import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const body = await readBody(event)

  const { pajilla, cantidad_total, fecha_uso, animal_id, descripcion } = body

  const { error } = await client.from('pajillas').insert({
    pajilla,
    stock: cantidad_total,
    fecha_uso,
    animal_id,
    descripcion
  })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { success: true }
})
