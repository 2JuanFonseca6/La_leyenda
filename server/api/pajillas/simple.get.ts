import { serverSupabaseClient } from "#supabase/server"
import type { Database } from "~/types/supabase"

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient<Database>(event)
    
    // Simple query to test connection
    const { data, error } = await client
      .from("pajillas")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return createError({ statusCode: 500, statusMessage: error.message })
    }

    // Return the data directly as an array
    return data || []
  } catch (error) {
    console.error("Unexpected error:", error)
    return createError({ 
      statusCode: 500, 
      statusMessage: error instanceof Error ? error.message : "Error interno del servidor" 
    })
  }
}) 