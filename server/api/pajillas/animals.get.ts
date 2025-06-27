import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 10
  const search = (query.search as string)?.toLowerCase() || ''
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let supabaseQuery = client
    .from('animals')
    .select('*', { count: 'exact' })
    .order('id_animal', { ascending: true })

  if (search) {
    supabaseQuery = supabaseQuery.ilike('id_animal', `%${search}%`)
  }

  const { data, error, count } = await supabaseQuery.range(from, to)

  if (error) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.message }))
  }

  return {
    animals: data || [],
    total: count || 0
  }
})
