import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { defineEventHandler, getRouterParam, readBody } from 'h3'
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
  const body = await readBody(event)
  
  if (!id || isNaN(Number(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de evento inválido'
    })
  }
  
  const { fecha_evento, descripcion, observaciones } = body
  if (!fecha_evento || !descripcion) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Faltan campos obligatorios'
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
      statusMessage: 'Solo los administradores pueden editar eventos de salud'
    })
  }
  
  // Verificar que el evento existe
  const { data: existingEvent, error: eventError } = await client
    .from('historial_salud_corral')
    .select('id, corral_id')
    .eq('id', Number(id))
    .single()
  
  if (eventError || !existingEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Evento no encontrado'
    })
  }
  
  // Actualizar el evento
  const { data, error } = await client
    .from('historial_salud_corral')
    .update({
      fecha_evento,
      descripcion,
      observaciones: observaciones || null
    })
    .eq('id', Number(id))
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
  
  return { historial: [data] }
}) 