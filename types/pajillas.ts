export interface InventarioPajilla {
  id: string
  pajilla: string
  stock: number
  fecha_uso: string
  descripcion?: string
  created_at: string
  updated_at: string
  animal_id?: string | null
  animal?: {
    id_animal: string
    raza: string
    tipo_animal: string
  }
}

export interface CreatePajillaData {
  pajilla: string
  cantidad_total: number
  fecha_uso: string
  animal_id?: string
  descripcion?: string
}
