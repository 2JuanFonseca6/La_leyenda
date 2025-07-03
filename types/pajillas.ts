export interface InventarioPajilla {
  id: number
  pajilla: string
  fecha_ingreso: string
  descripcion?: string
  stock: number
  stock_inicial: number
  total_entradas: number
  total_salidas: number
  inventario_final: number
}

export interface CreatePajillaData {
  pajilla: string
  cantidad_total: number
  fecha_ingreso: string
  descripcion?: string
}

export interface MovimientoPajilla {
  id: number
  tipo_movimiento: 'ENTRADA' | 'SALIDA'
  cantidad: number
  fecha: string
  animal_id?: string | null
  observaciones?: string
}
