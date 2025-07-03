import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import type { Database } from "~/types/supabase"

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
  const idParam = getRouterParam(event, 'id')

  if (!idParam) {
    return createError({ 
      statusCode: 400, 
      statusMessage: "ID de pajilla requerido" 
    })
  }

  const id = parseInt(idParam)
  if (isNaN(id)) {
    return createError({ 
      statusCode: 400, 
      statusMessage: "ID de pajilla debe ser un número válido" 
    })
  }

  try {
    const { data, error } = await client
      .from("pajillas")
      .update({
        pajilla: body.pajilla,
        stock: body.stock,
        fecha_ingreso: body.fecha_ingreso,
        descripcion: body.descripcion,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar pajilla:", error.message)
      return createError({ 
        statusCode: 500, 
        statusMessage: error.message 
      })
    }

    return data
  } catch (error) {
    console.error("Unexpected error in pajillas PUT:", error)
    return createError({ 
      statusCode: 500, 
      statusMessage: error instanceof Error ? error.message : "Error interno del servidor" 
    })
  }
}) 