export interface GenealogyTreeNode {
  id: string;
  raza: string;
  tipo_animal: string;
  madre?: GenealogyTreeNode;
  padre?: GenealogyTreeNode;
}

export type GenealogyResponse = GenealogyTreeNode

export interface Animal {
  id_animal: string;
  fecha_nacimiento: string;
  raza: string;
  tipo_animal: string;
  peso_actual: number;
  estado_salud: string;
  venta: boolean;
  peso_inicial: number;
  id_reproduccion: string | null;
  fecha_fallecimiento: string | null;
  imagen_url?: string | null;
}

export interface Venta {
  id_venta: number;
  animal_id: string;
  fecha_venta: string;
  monto: number | null;
  notas: string | null;
}

export interface HistorialSalud {
  id_historial: number;
  animal_id: string;
  fecha_evento: string;
  descripcion: string;
  observaciones: string | null;
}

export interface HistorialPeso {
  id: number;
  animal_id: string;
  peso: number;
  fecha_registro: string;
}

// =====================================================
// TIPOS ACTUALIZADOS PARA PAJILLAS (ESTRUCTURA REAL)
// =====================================================

export interface InventarioPajilla {
  id: string;
  toro_id: string; // TEXT - Referencia al toro del que proviene la pajilla
  codigo_pajilla: string;
  cantidad_total: number;
  cantidad_disponible: number;
  fecha_ingreso: string;
  fecha_vencimiento?: string;
  proveedor?: string;
  precio_unitario?: number;
  notas?: string;
  created_at: string;
  updated_at: string;
  animal?: Animal; // Información del animal (toro) - agregada por el endpoint
}

export interface HistorialPajilla {
  id: string;
  pajilla_id: string;
  tipo_operacion: 'uso' | 'restock';
  cantidad: number;
  fecha_operacion: string;
  usuario_id?: string;
  animal_destino_id?: string; // TEXT - Animal donde se usó la pajilla
  observaciones?: string;
  created_at: string;
}

export interface PajillaConHistorial extends InventarioPajilla {
  historial: HistorialPajilla[];
}

// Tipos para formularios
export interface CreatePajillaData {
  toro_id: string;
  codigo_pajilla: string;
  cantidad_total: number;
  fecha_vencimiento?: string;
  proveedor?: string;
  precio_unitario?: number;
  notas?: string;
}

export interface UsePajillaData {
  pajilla_id: string;
  cantidad: number;
  animal_destino_id?: string;
  observaciones?: string;
}

export interface RestockPajillaData {
  pajilla_id: string;
  cantidad: number;
  observaciones?: string;
}
