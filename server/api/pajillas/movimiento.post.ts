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
  const { pajilla_id, tipo_movimiento, cantidad, fecha, animal_id, observaciones } = body

  if (!pajilla_id || !tipo_movimiento || !cantidad || !fecha) {
    throw createError({ statusCode: 400, statusMessage: 'Faltan datos obligatorios.' })
  }

  if (!['ENTRADA', 'SALIDA'].includes(tipo_movimiento)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de movimiento inválido.' })
  }

  // Insertar el movimiento
  const { error } = await client.from('movimientos_pajilla').insert({
    pajilla_id,
    tipo_movimiento,
    cantidad,
    fecha,
    animal_id: tipo_movimiento === 'SALIDA' ? animal_id : null,
    observaciones
  })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { success: true }
}) 