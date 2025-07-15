import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import { createError, getHeader } from "h3";

// Función recursiva para construir el árbol genealógico completo
type GenealogyTreeNode = {
  id: string;
  raza: string;
  tipo_animal: string;
  madre?: GenealogyTreeNode;
  padre?: GenealogyTreeNode;
};

import type { SupabaseClient } from "@supabase/supabase-js";

async function buildGenealogyTree(client: SupabaseClient<Database>, animalId: string, depth = 0, maxDepth = 5): Promise<GenealogyTreeNode | undefined> {
  if (!animalId || depth > maxDepth) return undefined;

  // 1. Obtener animal
  const { data: animal, error: animalError } = await client
    .from("animals")
    .select("*")
    .eq("id_animal", animalId)
    .single();
  if (animalError || !animal) return undefined;

  // 2. Obtener reproducción (si existe id_reproduccion)
  let madreNode: GenealogyTreeNode | undefined = undefined;
  let padreNode: GenealogyTreeNode | undefined = undefined;
  const reproduccionId = animal.id_reproduccion;

  if (reproduccionId !== null && reproduccionId !== undefined) {
    const { data: reproduccionData, error: errReproduccion } = await client
      .from("reproduccion")
      .select(
        `*, madre:animals!fk_reproduccion_madre(id_animal, raza, tipo_animal, id_reproduccion), padre:animals!fk_reproduccion_padre(id_animal, raza, tipo_animal, id_reproduccion)`
      )
      .eq("id_reproduccion", reproduccionId)
      .maybeSingle();

    if (!errReproduccion && reproduccionData) {
      // Recursivamente buscar madre
      if (reproduccionData.madre && reproduccionData.madre.id_animal) {
        madreNode = await buildGenealogyTree(client, String(reproduccionData.madre.id_animal), depth + 1, maxDepth);
      }
      // Recursivamente buscar padre
      if (reproduccionData.padre && reproduccionData.padre.id_animal) {
        padreNode = await buildGenealogyTree(client, String(reproduccionData.padre.id_animal), depth + 1, maxDepth);
      }
    }
  }

  return {
    id: animal.id_animal,
    raza: animal.raza,
    tipo_animal: animal.tipo_animal ?? '',
    madre: madreNode,
    padre: padreNode,
  };
}

export default defineEventHandler(async (event) => {
  // --- INICIO: Comprobación de Acceso Directo ---
  const secFetchSite = getHeader(event, "sec-fetch-site");

  if (secFetchSite === "none") {
    console.warn(
      `Acceso directo bloqueado para la ruta ${event.path}. Sec-Fetch-Site: ${secFetchSite}`
    );
    throw createError({
      statusCode: 403, // Forbidden
      statusMessage: "Forbidden",
      message: "Direct access not allowed.",
    });
  }
  // --- FIN: Comprobación de Acceso Directo ---

  const client = await serverSupabaseClient<Database>(event);
  const id = getRouterParam(event, "id");

  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: "Se requiere ID del animal",
    });

  try {
    // Construir árbol genealógico completo recursivo
    const genealogyTree = await buildGenealogyTree(client, id);
    if (!genealogyTree) {
      throw createError({
        statusCode: 404,
        statusMessage: "Animal no encontrado o sin genealogía",
      });
    }
    return genealogyTree;
  } catch (err: any) {
    // Manejar errores específicos
    if (err.message && err.message.includes("No rows found")) {
      throw createError({
        statusCode: 404,
        statusMessage: "Animal no encontrado",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Error: ${err.message}`,
    });
  }
});
