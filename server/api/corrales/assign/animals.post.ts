// server/api/corrales/assign/animals.post.ts
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { createError, readBody } from "h3";

interface AnimalAssignment {
  id_animal: string;
  id_corral: string | null; // null para desasignar
}

export default defineEventHandler(async (event) => {
  console.log("--- HITTING /api/corrales/assign-animals POST ---");
  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);

  const { assignments }: { assignments: AnimalAssignment[] } = body;

  // Validaciones
  if (!Array.isArray(assignments) || assignments.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Se requiere un array de asignaciones",
    });
  }

  // Validar estructura de cada asignación
  for (const assignment of assignments) {
    if (!assignment.id_animal || typeof assignment.id_animal !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: "Cada asignación debe tener un id_animal válido",
      });
    }

    if (assignment.id_corral !== null && typeof assignment.id_corral !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: "id_corral debe ser string o null",
      });
    }
  }

  try {
    // Verificar que todos los animales existen
    const animalIds = assignments.map(a => a.id_animal);
    const { data: existingAnimals, error: animalsError } = await client
      .from("animals")
      .select("id_animal")
      .in("id_animal", animalIds);

    if (animalsError) {
      console.error("Error checking animals:", animalsError);
      throw animalsError;
    }

    const foundAnimalIds = existingAnimals?.map(a => a.id_animal) || [];
    const missingAnimals = animalIds.filter(id => !foundAnimalIds.includes(id));

    if (missingAnimals.length > 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Animales no encontrados: ${missingAnimals.join(', ')}`,
      });
    }

    // Verificar que todos los corrales existen (solo los que no son null)
    const corralIds = assignments
      .filter(a => a.id_corral !== null)
      .map(a => a.id_corral as string);

    if (corralIds.length > 0) {
      const { data: existingCorrales, error: corralesError } = await client
        .from("corrales")
        .select("id_corral, capacidad_maxima")
        .in("id_corral", corralIds);

      if (corralesError) {
        console.error("Error checking corrales:", corralesError);
        throw corralesError;
      }

      const foundCorralIds = existingCorrales?.map(c => c.id_corral) || [];
      const missingCorrales = corralIds.filter(id => !foundCorralIds.includes(id));

      if (missingCorrales.length > 0) {
        throw createError({
          statusCode: 404,
          statusMessage: `Corrales no encontrados: ${missingCorrales.join(', ')}`,
        });
      }

      // Verificar capacidad de corrales
      for (const corral of existingCorrales || []) {
        const animalsForThisCorral = assignments.filter(a => a.id_corral === corral.id_corral);

        // Contar animales ya asignados a este corral (excluyendo los que estamos reasignando)
        const { count: currentCount, error: countError } = await client
          .from("animals")
          .select("*", { count: "exact", head: true })
          .eq("id_corral", corral.id_corral)
          .not("id_animal", "in", `(${animalIds.join(',')})`);

        if (countError) {
          console.error("Error counting current animals:", countError);
          throw countError;
        }

        const newTotal = (currentCount || 0) + animalsForThisCorral.length;
        if (newTotal > corral.capacidad_maxima) {
          throw createError({
            statusCode: 400,
            statusMessage: `El corral ${corral.id_corral} excedería su capacidad máxima (${corral.capacidad_maxima}). Total sería: ${newTotal}`,
          });
        }
      }
    }

    // Realizar las asignaciones en una transacción
    const updatePromises = assignments.map(assignment =>
      client
        .from("animals")
        .update({ id_corral: assignment.id_corral })
        .eq("id_animal", assignment.id_animal)
    );

    const results = await Promise.all(updatePromises);

    // Verificar si hubo errores
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Errors in assignments:", errors);
      throw createError({
        statusCode: 500,
        statusMessage: "Error al procesar algunas asignaciones",
      });
    }

    console.log(`${assignments.length} asignaciones procesadas exitosamente`);

    // Preparar resumen de cambios
    const assigned = assignments.filter(a => a.id_corral !== null);
    const unassigned = assignments.filter(a => a.id_corral === null);

    return {
      success: true,
      message: "Asignaciones procesadas exitosamente",
      summary: {
        total: assignments.length,
        assigned: assigned.length,
        unassigned: unassigned.length
      },
      assignments: assignments
    };

  } catch (err: any) {
    console.error("API Database/Processing Error:", err);
    const statusCode = err.statusCode || err.code || 500;
    const statusMessage =
      err.statusMessage ||
      err.message ||
      "Error desconocido al procesar las asignaciones";
    throw createError({
      statusCode: typeof statusCode === "string" ? 500 : statusCode,
      statusMessage: `Error del servidor: ${statusMessage}`,
    });
  }
});