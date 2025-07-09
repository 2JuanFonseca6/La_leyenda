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

  const id = getRouterParam(event, 'id')
  
  if (!id || isNaN(Number(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de evento inválido'
    })
  }
  
  const client = await serverSupabaseClient<Database>(event)
  
  // Verificar que el usuario es admin
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profile || profile.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Solo los administradores pueden eliminar eventos de salud'
    })
  }
  
  // Verificar que el evento existe
  const { data: existingEvent, error: eventError } = await client
    .from('historial_salud_corral')
    .select('id')
    .eq('id', Number(id))
    .single()
  
  if (eventError || !existingEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Evento no encontrado'
    })
  }
  
  // Eliminar el evento
  const { error } = await client
    .from('historial_salud_corral')
    .delete()
    .eq('id', Number(id))

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
  
  return { success: true }
}) 