import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const id = event.context.params?.id;
  const body = await readBody(event);

  console.log('DELETE peso - ID animal:', id);
  console.log('DELETE peso - Body:', body);

  if (!id || !body?.id) {
    console.log('DELETE peso - Error: IDs faltantes');
    throw createError({ statusCode: 400, statusMessage: "ID de animal y de peso requeridos" });
  }

  try {
    console.log('DELETE peso - Intentando eliminar registro ID:', body.id);
    const { error } = await client.from("historial_peso").delete().eq("id", body.id);
    
    if (error) {
      console.log('DELETE peso - Error de Supabase:', error);
      throw error;
    }
    
    console.log('DELETE peso - Éxito');
    return { success: true };
  } catch (error: any) {
    console.log('DELETE peso - Error capturado:', error);
    throw createError({
      statusCode: error.code || 500,
      statusMessage: error.message || "Error al eliminar peso",
    });
  }
}); 