import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = event.context.params?.id

  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requerido' })

  const { error } = await client.from('pajillas').delete().eq('id', id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { success: true }
})
