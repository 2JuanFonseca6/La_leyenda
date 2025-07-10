import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export async function getUserSession(event: any) {
  const user = await serverSupabaseUser(event)
  if (!user) return null
  // Obtener el rol desde la tabla profiles
  const supabase = await serverSupabaseClient<Database>(event)
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (error || !data) return { user, role: 'user' }
  return { user, role: data.role }
} 