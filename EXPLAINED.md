# Estructura de carpetas - San Rafael
```
├── app.config.ts                       # Configuración global del UI en Nuxt
├── app.vue                             # Componente raíz de la app Vue
├── bun.lock                            # Lockfile del gestor Bun
├── Dockerfile                          # Configuración para contenedor Docker
├── error.vue                           # Vista de manejo de errores
├── EXPLAINED.md                        # Documentación detallada de la arquitectura del proyecto
├── nuxt.config.ts                      # Configuración principal de Nuxt
├── package.json                        # Dependencias y scripts del proyecto
├── tsconfig.json                       # Opciones de compilación TypeScript
├── README.md                           # Documentación inicial del proyecto
├── SUPABASE_SETUP.md                   # Guía de configuración de Supabase
├── public/                             # Archivos públicos estáticos
│   ├── favicon.ico                     # Ícono de la aplicación
│   ├── robots.txt                      # Reglas de rastreo para buscadores
│   └── img/
│       └── logo/
│           └── logo-black.webp         # Logotipo versión negra
├── assets/                             # Recursos estáticos (CSS, imágenes)
│   ├── css/
│   │   └── main.css                    # Estilos globales de la app
│   └── img/
│       ├── login/
│       │   └── orion.webp              # Imagen para login
│       └── logo/
│           ├── logo-black.webp         # Logotipo versión negra
│           └── logo-white.webp         # Logotipo versión blanca
├── components/                         # Componentes Vue reutilizables
│   ├── animal/                         # Componentes de gestión animal
│   │   ├── AnimalAddModal.vue          # Modal para registrar nuevo animal
│   │   ├── AnimalDetailsCard.vue       # Tarjeta de detalles de animal
│   │   ├── AnimalExpandedCard.vue      # Tarjeta expandida con detalles completos
│   │   ├── AnimalSearch.vue            # Buscador de animales
│   │   ├── AnimalTable.vue             # Tabla de animales
│   │   ├── DeleteAnimalCard.vue        # Confirmación de eliminación individual
│   │   ├── DeleteAnimals.vue           # Modal para eliminar múltiples animales
│   │   ├── DrawerGenealogy.vue         # Drawer para visualizar id de reproducciones
│   │   ├── GenealogyTree.vue           # Árbol genealógico
│   │   ├── GenealogyTreePrint.vue      # Árbol genealógico para impresión
│   │   ├── HealthHistoryCard.vue       # Historial de salud
│   │   ├── SaleInfoCard.vue            # Información de venta del animal
│   │   └── SaleModal.vue               # Modal de gestión de venta
│   ├── corrals/                        # Componentes de gestión de corrales
│   │   ├── AnimalDrag.vue              # Componente drag para arrastrar animales
│   │   ├── AnimalDrop.vue              # Componente drop para soltar animales
│   │   ├── DragDropAnimals.vue         # Gestión de drag & drop de animales
│   │   └── modals/
│   │       ├── CorralFormModal.vue     # Modal para crear/editar corral
│   │       └── DeleteCorralModal.vue   # Modal para eliminar corral
│   ├── dashboard/                      # Componentes para el dashboard principal
│   │   ├── MetricsCards.vue            # Métricas clave de la app
│   │   ├── SalesCharts.vue             # Gráficos de ventas
│   │   └── StadisticCards.vue          # Tarjetas estadísticas del sistema
│   ├── genealogy/                      # Componentes relacionados con reproducción/genealogía
│   │   ├── DeleteReproductions.vue     # Modal para eliminar reproducciones
│   │   ├── DrawerAnimals.vue           # Drawer para seleccionar animales
│   │   ├── EditReproduction.vue        # Modal para editar una reproducción
│   │   ├── GenealogyTable.vue          # Tabla de genealogías
│   │   └── ReproductionCreateModal.vue # Modal para crear reproducción
│   ├── navigation/                     # Componentes de navegación
│   │   ├── BreadNav.vue                # Migas de pan
│   │   ├── NavButtons.vue              # Botones de navegación
│   │   └── Sidebar.vue                 # Barra lateral
│   ├── pajillas/                       # Componentes de gestión de pajillas
│   │   ├── PajillaCreateModal.vue      # Modal para crear nueva pajilla
│   │   ├── PajillasTable.vue           # Tabla de pajillas
│   │   └── SelectVacaDrawer.vue        # Drawer para seleccionar vaca
│   ├── profiles/                       # Componentes de perfil de usuario
│   │   ├── DeleteProfiles.vue          # Modal para eliminar perfiles
│   │   ├── EditProfile.vue             # Modal para editar perfil
│   │   ├── ProfileCreateModal.vue      # Modal para crear nuevo perfil
│   │   ├── ProfileEditor.vue           # Editor de perfil
│   │   ├── ProfilesTable.vue           # Tabla de perfiles
│   │   └── SearchProfile.vue           # Buscador de perfiles
│   ├── providers/                      # Componentes de proveedores
│   │   ├── DeleteProvider.vue          # Modal para eliminar proveedores
│   │   ├── ProviderAddModal.vue        # Modal para crear nuevo proveedor
│   │   ├── ProviderExpanded.vue        # Vista expandida para editar proveedor
│   │   └── ProviderTable.vue           # Tabla de proveedores
│   ├── stock/                          # Componentes de inventario
│   │   ├── DeleteStock.vue             # Modal para eliminar stock
│   │   ├── DrawerProviders.vue         # Drawer para seleccionar proveedores
│   │   ├── StockAddModal.vue           # Modal para agregar stock
│   │   ├── StockExpandedCard.vue       # Tarjeta expandida de stock
│   │   ├── StockStadistics.vue         # Estadísticas de stock
│   │   └── StockTable.vue              # Tabla de stock
│   ├── theming/                        # Componentes de personalización de temas
│   │   ├── Theming.vue                 # Selector de tema
│   │   └── ThemingText.vue             # Textos para personalización
│   ├── Logout.vue                      # Componente de logout
│   └── PrintHeader.vue                 # Encabezado para impresión
├── composables/                        # Funciones reutilizables (composables)
│   ├── arestricted.ts                  # Lógica de restricciones de acceso
│   └── useLogout.ts                    # Composable para logout
├── layouts/                            # Plantillas de diseño de páginas
│   ├── default.vue                     # Layout por defecto
│   └── logged.vue                      # Layout para usuarios autenticados
├── middleware/                         # Middlewares de rutas
│   ├── auth.global.ts                  # Autenticación global
│   └── restricted.ts                   # Verificación de acceso
├── pages/                              # Vistas y rutas de la aplicación
│   ├── index.vue                       # Página de inicio ("/")
│   ├── login.vue                       # Página de inicio de sesión
│   ├── about.vue                       # Página "Acerca de"
│   ├── settings.vue                    # Página de configuración
│   ├── profiles.vue                    # Gestión de perfiles
│   ├── animals/                        # Rutas de animales
│   │   ├── genealogy.vue               # Página de genealogía de animales
│   │   ├── index.vue                   # Listado de animales
│   │   ├── reproduction.vue            # Página de reproducción animal
│   │   └── specific/
│   │       └── [id].vue                # Detalle de animal específico (ruta dinámica)
│   ├── corrals/                        # Rutas de corrales
│   │   └── index.vue                   # Gestión de corrales
│   └── stock/                          # Rutas de inventario
│       ├── index.vue                   # Listado de stock
│       ├── pajillas.vue                # Gestión de pajillas
│       └── providers.vue               # Gestión de proveedores
├── server/                             # Backend (API) del proyecto
│   ├── tsconfig.json                   # Configuración TS del backend
│   └── api/                            # Endpoints de la API
│       ├── animal/
│       │   ├── animals.get.ts          # Obtener todos los animales
│       │   ├── animals.delete.ts       # Eliminar múltiples animales
│       │   └── specific/
│       │       ├── [id].get.ts         # Obtener animal por ID
│       │       ├── [id].put.ts         # Actualizar animal por ID
│       │       ├── [id].delete.ts      # Eliminar animal por ID
│       │       └── [id]/
│       │           └── image.delete.ts # Eliminar imagen de animal
│       ├── corrales/                   # Gestión de corrales
│       │   ├── corrales.get.ts         # Obtener todos los corrales
│       │   ├── corrales.post.ts        # Crear nuevo corral
│       │   ├── assign.put.ts           # Asignar animal a corral
│       │   ├── assign/
│       │   │   └── assigned.get.ts     # Obtener animales asignados
│       │   ├── unassign/
│       │   │   └── unassign.put.ts     # Desasignar animal de corral
│       │   └── specific/
│       │       ├── [id].put.ts         # Actualizar corral por ID
│       │       └── [id].delete.ts      # Eliminar corral por ID
│       ├── dashboard/
│       │   └── metrics.get.ts          # Métricas para el dashboard
│       ├── genealogy/
│       │   └── id/
│       │       └── [id].get.ts         # Obtener genealogía por ID
│       ├── health/
│       │   ├── health.post.ts          # Crear registro de salud
│       │   └── specific/
│       │       ├── [id].put.ts         # Actualizar registro de salud
│       │       └── [id].delete.ts      # Eliminar registro de salud
│       ├── pajillas/                   # Gestión de pajillas
│       │   └── (archivos pendientes)   # Endpoints para pajillas
│       ├── profiles/
│       │   ├── delete.delete.ts        # Eliminar perfiles
│       │   ├── profile.post.ts         # Crear nuevo perfil
│       │   ├── profile.put.ts          # Actualizar perfil
│       │   ├── profiles.get.ts         # Obtener lista de perfiles
│       │   └── search.get.ts           # Buscar perfiles
│       ├── providers/
│       │   ├── providers.get.ts        # Obtener lista de proveedores
│       │   ├── providers.post.ts       # Crear nuevo proveedor
│       │   ├── providers.delete.ts     # Eliminar proveedor
│       │   └── providers.put.ts        # Editar proveedor
│       ├── reproduction/
│       │   ├── reproductions.get.ts    # Listar reproducciones
│       │   ├── reproductions.post.ts   # Crear reproducción
│       │   ├── reproductions.delete.ts # Eliminar reproducciones
│       │   └── specific/
│       │       ├── [id].delete.ts      # Eliminar reproducción por ID
│       │       └── [id].put.ts         # Actualizar reproducción por ID
│       ├── sales/
│       │   └── specific/
│       │       ├── [id].post.ts        # Registrar venta por ID
│       │       ├── [id].put.ts         # Actualizar venta por ID
│       │       └── [id].delete.ts      # Eliminar venta por ID
│       ├── stock/
│       │   ├── stock.get.ts            # Obtener stock
│       │   ├── items.post.ts           # Crear item de stock
│       │   ├── stock.delete.ts         # Eliminar stock
│       │   └── specific/
│       │       ├── [id].get.ts         # Obtener stock por ID
│       │       └── [id].put.ts         # Actualizar stock por ID
│       └── test.get.ts                 # Endpoint de prueba
└── types/                              # Definiciones de tipos TypeScript
    ├── animal.ts                       # Interfaces relacionadas con animales
    ├── pajillas.ts                     # Interfaces relacionadas con pajillas
    ├── supabase.ts                     # Tipos generados desde Supabase
    └── types.d.ts                      # Tipos globales del proyecto
```

# ESTADO DE SALUD DE LOS ANIMALES

1. **EXCELENTE** – Salud óptima, sin signos de enfermedad ni lesiones.
2. **BUENO** – Salud general buena, sin problemas significativos.
3. **REGULAR** – Algunos signos menores de enfermedad o debilidad.
4. **MALO** – Enfermedad evidente o condición física deficiente.
5. **CRITICO** – Riesgo de muerte inminente, requiere atención urgente.
6. **RECUPERACION** – Animal que estuvo enfermo y está en proceso de mejora.
7. **OBSERVACION** – Aún sin diagnóstico claro, pero muestra posibles signos de enfermedad.

# FUNCIONALIDADES PRINCIPALES

## 🐄 Gestión de Animales
- Registro y seguimiento de animales
- Historial de salud
- Genealogía y reproducción
- Gestión de ventas

## 🏠 Gestión de Corrales
- Creación y administración de corrales
- Asignación de animales a corrales mediante drag & drop
- Visualización de ocupación

## 📦 Gestión de Inventario
- Control de stock de productos
- Gestión de proveedores
- Sistema de pajillas para inseminación artificial

## 👥 Gestión de Usuarios
- Perfiles de usuario
- Sistema de autenticación
- Control de acceso

## 📊 Dashboard
- Métricas en tiempo real
- Gráficos de ventas
- Estadísticas del sistema

## 🎨 Personalización
- Sistema de temas
- Configuración de interfaz
- Modo oscuro/claro

