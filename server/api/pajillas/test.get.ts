import { serverSupabaseClient } from "#supabase/server"
import type { Database } from "~/types/supabase"

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  try {
    // Test 1: Check if table exists and get count
    const { count, error: countError } = await client
      .from("pajillas")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error checking table:", countError)
      return {
        error: "Table error",
        message: countError.message,
        count: null
      }
    }

    // Test 2: Get all data
    const { data, error: dataError } = await client
      .from("pajillas")
      .select("*")
      .order("created_at", { ascending: false })

    if (dataError) {
      console.error("Error fetching data:", dataError)
      return {
        error: "Data error",
        message: dataError.message,
        count,
        data: null
      }
    }

    return {
      success: true,
      count,
      data,
      tableExists: true
    }

  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      error: "Unexpected error",
      message: error instanceof Error ? error.message : "Unknown error",
      count: null,
      data: null
    }
  }
}) 