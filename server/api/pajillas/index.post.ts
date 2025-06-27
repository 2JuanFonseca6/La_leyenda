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
