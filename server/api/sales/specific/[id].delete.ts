// server/api/sales/[id].delete.ts
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const id = event.context.params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de animal no proporcionado',
    })
  }

  const { error } = await client
    .from('ventas')
    .delete()
    .eq('id_animal', id)

  if (error) {
    console.error('Error al eliminar la venta:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al eliminar la venta: ' + error.message,
    })
  }

  return { success: true }
})
