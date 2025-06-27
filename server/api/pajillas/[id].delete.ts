import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const id = event.context.params?.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID requerido' })
  }

  const { error } = await client.from('pajillas').delete().eq('id', parseInt(id))

  if (error) {
    console.error('Error al eliminar pajilla:', error.message)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
}) 