import { serverSupabaseClient } from "#supabase/server";
import { getQuery, createError } from "h3";
import type { Database } from '~/types/supabase';

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  let idsParam = getQuery(event).ids;
  let ids: string[] = [];
  if (typeof idsParam === 'string') {
    ids = idsParam.split(',');
  } else if (Array.isArray(idsParam)) {
    ids = idsParam.flatMap((v) => typeof v === 'string' ? v.split(',') : []);
  }
  if (!ids.length) return { historiales: {} };
  const { data, error } = await client
    .from('historial_peso')
    .select('*')
    .in('animal_id', ids);
  if (error) throw createError({ statusCode: 500, message: error.message });
  // Agrupa por animal_id
  const historiales: Record<string, any[]> = {};
  for (const h of data || []) {
    if (!historiales[h.animal_id]) historiales[h.animal_id] = [];
    historiales[h.animal_id].push(h);
  }
  return { historiales };
}); 