import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  
  // Verificar que el usuario esté autenticado
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  // Verificar que el usuario sea admin
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Acceso denegado. Se requieren permisos de administrador.' })
  }

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