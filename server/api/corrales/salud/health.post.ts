import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { defineEventHandler, readBody } from 'h3'
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

  const body = await readBody(event)
  const { corral_id, fecha_evento, descripcion, observaciones } = body
  
  if (!corral_id || !fecha_evento || !descripcion) {
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
      statusMessage: 'Solo los administradores pueden crear eventos de salud'
    })
  }
  
  // Verificar que el corral existe
  const { data: corral, error: corralError } = await client
    .from('corrales')
    .select('id_corral')
    .eq('id_corral', corral_id)
    .single()
  
  if (corralError || !corral) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Corral no encontrado'
    })
  }
  
  // Obtener todos los animales del corral
  const { data: animales, error: animalesError } = await client
    .from('animals')
    .select('id_animal')
    .eq('id_corral', corral_id)
  
  if (animalesError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error obteniendo animales del corral'
    })
  }
  
  // Crear el evento de salud del corral
  const { data: eventoCorral, error: eventoError } = await client
    .from('historial_salud_corral')
    .insert([{
      corral_id,
      fecha_evento,
      descripcion,
      observaciones: observaciones || null
    }])
    .select()
    .single()

  if (eventoError) {
    throw createError({
      statusCode: 500,
      statusMessage: eventoError.message
    })
  }
  
  // Crear eventos de salud individuales para cada animal del corral
  if (animales && animales.length > 0) {
    const eventosAnimales = animales.map(animal => ({
      animal_id: animal.id_animal,
      fecha_evento,
      descripcion: `[Evento de Corral] ${descripcion}`,
      observaciones: observaciones ? `[Evento de Corral] ${observaciones}` : null
    }))
    
    const { error: eventosAnimalesError } = await client
      .from('historial_salud')
      .insert(eventosAnimales)
    
    if (eventosAnimalesError) {
      console.error('Error creando eventos para animales:', eventosAnimalesError)
      // No lanzamos error aquí porque el evento del corral ya se creó
      // Solo logeamos el error para debugging
    }
  }
  
  return { 
    historial: [eventoCorral],
    animales_afectados: animales?.length || 0,
    mensaje: `Evento creado para el corral y ${animales?.length || 0} animales`
  }
}) 