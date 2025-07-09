import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { defineEventHandler, getRouterParam } from 'h3'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  // Verificar autenticación
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autorizado'
    })
  }

  const corralId = getRouterParam(event, 'corral_id')
  
  if (!corralId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de corral requerido'
    })
  }
  
  const client = await serverSupabaseClient<Database>(event)
  
  // Verificar que el corral existe
  const { data: corral, error: corralError } = await client
    .from('corrales')
    .select('id_corral')
    .eq('id_corral', corralId)
    .single()
  
  if (corralError || !corral) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Corral no encontrado'
    })
  }
  
  // Obtener el historial de salud del corral
  const { data, error } = await client
    .from('historial_salud_corral')
    .select('id, fecha_evento, descripcion, observaciones, created_at')
    .eq('corral_id', corralId)
    .order('fecha_evento', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
  
  return { historial: data || [] }
}) 