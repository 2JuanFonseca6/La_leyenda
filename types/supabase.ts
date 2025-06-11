export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      animals: {
        Row: {
          estado_salud: Database["public"]["Enums"]["estado_salud"] | null
          fecha_fallecimiento: string | null
          fecha_nacimiento: string
          id_animal: string
          id_corral: string | null
          id_reproduccion: number | null
          peso_actual: number
          peso_inicial: number
          raza: string
          tipo_animal: Database["public"]["Enums"]["tipo_animal"] | null
        }
        Insert: {
          estado_salud?: Database["public"]["Enums"]["estado_salud"] | null
          fecha_fallecimiento?: string | null
          fecha_nacimiento: string
          id_animal: string
          id_corral?: string | null
          id_reproduccion?: number | null
          peso_actual: number
          peso_inicial: number
          raza: string
          tipo_animal?: Database["public"]["Enums"]["tipo_animal"] | null
        }
        Update: {
          estado_salud?: Database["public"]["Enums"]["estado_salud"] | null
          fecha_fallecimiento?: string | null
          fecha_nacimiento?: string
          id_animal?: string
          id_corral?: string | null
          id_reproduccion?: number | null
          peso_actual?: number
          peso_inicial?: number
          raza?: string
          tipo_animal?: Database["public"]["Enums"]["tipo_animal"] | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_id_corral_fkey"
            columns: ["id_corral"]
            isOneToOne: false
            referencedRelation: "corrales"
            referencedColumns: ["id_corral"]
          },
          {
            foreignKeyName: "animals_id_reproduccion_fkey"
            columns: ["id_reproduccion"]
            isOneToOne: false
            referencedRelation: "reproduccion"
            referencedColumns: ["id_reproduccion"]
          },
        ]
      }
      calendario_salud: {
        Row: {
          animal_id: string
          fecha_programada: string
          fecha_realizado: string | null
          id_evento: number
          observaciones: string | null
          realizado: boolean
          repetir_cada_dias: number | null
          tipo_evento: string
        }
        Insert: {
          animal_id: string
          fecha_programada: string
          fecha_realizado?: string | null
          id_evento?: number
          observaciones?: string | null
          realizado?: boolean
          repetir_cada_dias?: number | null
          tipo_evento: string
        }
        Update: {
          animal_id?: string
          fecha_programada?: string
          fecha_realizado?: string | null
          id_evento?: number
          observaciones?: string | null
          realizado?: boolean
          repetir_cada_dias?: number | null
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_calendario_animal"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id_animal"]
          },
        ]
      }
      corrales: {
        Row: {
          capacidad_maxima: number
          descripcion: string | null
          fecha_creacion: string | null
          id_corral: string
          nombre: string
          tipo_corral: Database["public"]["Enums"]["tipo_corral"]
        }
        Insert: {
          capacidad_maxima: number
          descripcion?: string | null
          fecha_creacion?: string | null
          id_corral?: string
          nombre: string
          tipo_corral: Database["public"]["Enums"]["tipo_corral"]
        }
        Update: {
          capacidad_maxima?: number
          descripcion?: string | null
          fecha_creacion?: string | null
          id_corral?: string
          nombre?: string
          tipo_corral?: Database["public"]["Enums"]["tipo_corral"]
        }
        Relationships: []
      }
      genealogia: {
        Row: {
          animal_id: string
          documento: string | null
          id_documento: number
          observaciones: string | null
          tipo_registro: string
        }
        Insert: {
          animal_id: string
          documento?: string | null
          id_documento?: number
          observaciones?: string | null
          tipo_registro: string
        }
        Update: {
          animal_id?: string
          documento?: string | null
          id_documento?: number
          observaciones?: string | null
          tipo_registro?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_genealogia_animal"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id_animal"]
          },
        ]
      }
      historial_salud: {
        Row: {
          animal_id: string
          descripcion: string
          fecha_evento: string
          id_historial: number
          observaciones: string | null
        }
        Insert: {
          animal_id: string
          descripcion: string
          fecha_evento: string
          id_historial?: number
          observaciones?: string | null
        }
        Update: {
          animal_id?: string
          descripcion?: string
          fecha_evento?: string
          id_historial?: number
          observaciones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_historial_animal"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id_animal"]
          },
        ]
      }
      inventario: {
        Row: {
          cantidad: number
          descripcion: string
          id_inventario: number
          precio: number
          proveedor_id: string
          tipo: string
        }
        Insert: {
          cantidad: number
          descripcion: string
          id_inventario?: number
          precio: number
          proveedor_id: string
          tipo: string
        }
        Update: {
          cantidad?: number
          descripcion?: string
          id_inventario?: number
          precio?: number
          proveedor_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventario_proveedor"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id_proveedor"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          email: string
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      proveedores: {
        Row: {
          correo_empresa: string
          direccion: string
          id_proveedor: string
          nombre_empresa: string
          telefono: string
        }
        Insert: {
          correo_empresa: string
          direccion: string
          id_proveedor: string
          nombre_empresa: string
          telefono: string
        }
        Update: {
          correo_empresa?: string
          direccion?: string
          id_proveedor?: string
          nombre_empresa?: string
          telefono?: string
        }
        Relationships: []
      }
      reproduccion: {
        Row: {
          fecha_evento: string
          id_reproduccion: number
          madre_id: string
          padre_id: string | null
          raza: string
          tipo_concepcion: Database["public"]["Enums"]["tipo_concepcion"] | null
        }
        Insert: {
          fecha_evento: string
          id_reproduccion?: number
          madre_id: string
          padre_id?: string | null
          raza: string
          tipo_concepcion?:
            | Database["public"]["Enums"]["tipo_concepcion"]
            | null
        }
        Update: {
          fecha_evento?: string
          id_reproduccion?: number
          madre_id?: string
          padre_id?: string | null
          raza?: string
          tipo_concepcion?:
            | Database["public"]["Enums"]["tipo_concepcion"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reproduccion_madre"
            columns: ["madre_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id_animal"]
          },
          {
            foreignKeyName: "fk_reproduccion_padre"
            columns: ["padre_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id_animal"]
          },
        ]
      }
      tratamientos: {
        Row: {
          animal_id: string
          descripcion: string | null
          fecha: string | null
          id_tratamiento: number
          nombre: string
        }
        Insert: {
          animal_id: string
          descripcion?: string | null
          fecha?: string | null
          id_tratamiento?: number
          nombre: string
        }
        Update: {
          animal_id?: string
          descripcion?: string | null
          fecha?: string | null
          id_tratamiento?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tratamiento_animal"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id_animal"]
          },
        ]
      }
      vacunas: {
        Row: {
          animal_id: string | null
          cantidad_implementada: number
          fecha_aplicacion: string | null
          id_vacunacion: number
          nombre: string
        }
        Insert: {
          animal_id?: string | null
          cantidad_implementada: number
          fecha_aplicacion?: string | null
          id_vacunacion?: number
          nombre: string
        }
        Update: {
          animal_id?: string | null
          cantidad_implementada?: number
          fecha_aplicacion?: string | null
          id_vacunacion?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_vacuna_animal"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id_animal"]
          },
        ]
      }
      ventas: {
        Row: {
          animal_id: string
          fecha_venta: string
          id_venta: number
          monto: number | null
          notas: string | null
        }
        Insert: {
          animal_id: string
          fecha_venta: string
          id_venta?: number
          monto?: number | null
          notas?: string | null
        }
        Update: {
          animal_id?: string
          fecha_venta?: string
          id_venta?: number
          monto?: number | null
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_venta_animal"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id_animal"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_animal_cascade: {
        Args: { animal_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      estado_salud:
        | "EXCELENTE"
        | "BUENO"
        | "REGULAR"
        | "MALO"
        | "CRITICO"
        | "RECUPERACION"
        | "OBSERVACION"
      tipo_animal:
        | "NOVILLO"
        | "TERNERO"
        | "TERNERA"
        | "VACA"
        | "TORO"
        | "LECHONA"
      tipo_concepcion: "NATURAL" | "INSEMINACION"
      tipo_corral:
        | "ENGORDE"
        | "CUARENTENA"
        | "REPRODUCCION"
        | "MATERNIDAD"
        | "DESTETE"
        | "OTROS"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_salud: [
        "EXCELENTE",
        "BUENO",
        "REGULAR",
        "MALO",
        "CRITICO",
        "RECUPERACION",
        "OBSERVACION",
      ],
      tipo_animal: ["NOVILLO", "TERNERO", "TERNERA", "VACA", "TORO", "LECHONA"],
      tipo_concepcion: ["NATURAL", "INSEMINACION"],
      tipo_corral: [
        "ENGORDE",
        "CUARENTENA",
        "REPRODUCCION",
        "MATERNIDAD",
        "DESTETE",
        "OTROS",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
