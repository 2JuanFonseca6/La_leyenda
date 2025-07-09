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
    .select('id_corral, nombre')
    .eq('id_corral', corralId)
    .single()
  
  if (corralError || !corral) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Corral no encontrado'
    })
  }
  
  // Obtener los animales del corral
  const { data: animales, error: animalesError } = await client
    .from('animals')
    .select('id_animal, raza, peso_actual, tipo_animal')
    .eq('id_corral', corralId)
    .order('id_animal')

  if (animalesError) {
    throw createError({
      statusCode: 500,
      statusMessage: animalesError.message
    })
  }
  
  return { 
    corral: corral,
    animales: animales || [],
    total_animales: animales?.length || 0
  }
}) 