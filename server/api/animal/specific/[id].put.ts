// server/api/animal/specific/[id].put.ts
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/supabase";
import { readBody } from "h3";

// Define el tipo para el cuerpo de la solicitud
type AnimalUpdate = Database["public"]["Tables"]["animals"]["Update"];

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Autenticación requerida",
    });
  }

  // Usa el tipo correcto para el cuerpo
  const body = await readBody<Partial<AnimalUpdate>>(event);

  // Extrae el id_animal de los parámetros
  const id_animal = event.context.params?.id;

  if (!id_animal) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID del animal es obligatorio.",
    });
  }

  // Construye el objeto de actualización
  const updateData: AnimalUpdate = {
    fecha_nacimiento: body.fecha_nacimiento,
    fecha_fallecimiento: body.fecha_fallecimiento,
    raza: body.raza,
    tipo_animal: body.tipo_animal,
    peso_actual: body.peso_actual,
    estado_salud: body.estado_salud,
    peso_inicial: body.peso_inicial,
    id_reproduccion: body.id_reproduccion,
    imagen_url: body.imagen_url, // ← 🔁 aquí está la corrección
    // NUEVOS CAMPOS
    dueño: body.dueño,
    tipo_ganado: body.tipo_ganado,
    andrologico_image_url: body.andrologico_image_url,
    genomatologico_image_url: body.genomatologico_image_url,
    cantidad_hijos: body.cantidad_hijos,
  };

  // Filtra campos undefined
  const filteredData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined)
  );

  // Ejecuta la actualización
  const { data, error } = await client
    .from("animals")
    .update(filteredData)
    .eq("id_animal", id_animal)
    .select("*")
    .single();

  if (error) {
    console.error("Error al actualizar animal:", error);
    throw createError({
      statusCode: error.code === "42501" ? 403 : 500,
      statusMessage: `Error al actualizar el animal: ${error.message}`,
    });
  }

  return {
    toast: { message: "Animal actualizado correctamente" },
    animal: data,
  };
});
