import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'
import { createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 10
  const search = (query.search as string)?.toLowerCase() || ''
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  console.log('--- HITTING /api/pajillas/animals ---')
  console.log('Query:', query)
  console.log(`Page: ${page}, PageSize: ${pageSize}, Search: "${search}"`)
  console.log(`Range: From ${from} To ${to}`)

  try {
    let countQuery = client
      .from('animals')
      .select('*', { count: 'exact', head: true })
    let dataQuery = client
      .from('animals')
      .select('*')
      .order('fecha_nacimiento', { ascending: false })
      .range(from, to)

    if (search) {
      const searchFilter = `id_animal.ilike.%${search}%,raza.ilike.%${search}%,tipo_animal.ilike.%${search}%`
      countQuery = countQuery.or(searchFilter)
      dataQuery = dataQuery.or(searchFilter)
    }

    const { count, error: countError } = await countQuery
    if (countError) {
      console.error('Supabase count error:', countError)
      throw countError
    }
    console.log(`Fetched Count: ${count}`)

    const { data, error: dataError } = await dataQuery
    if (dataError) {
      console.error('Supabase data fetch error:', dataError)
      throw dataError
    }
    console.log(`Fetched ${data?.length ?? 0} records for page ${page}`)

    return {
      animals: data || [],
      total: count ?? 0,
      page: page,
      pageSize: pageSize,
    }
  } catch (err: any) {
    console.error('Database/Processing Error:', err)
    const statusCode = err.statusCode || err.code || 500
    const statusMessage = err.statusMessage || err.message || 'Error desconocido en la base de datos'
    throw createError({
      statusCode: typeof statusCode === 'string' ? 500 : statusCode,
      statusMessage: `Error del servidor: ${statusMessage}`,
    })
  }
})
