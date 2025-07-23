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
│   ├── animal/                         # Gestión animal (modales, tablas, detalles, búsqueda)
│   ├── corrals/                        # Gestión de corrales y drag & drop
│   │   └── modals/                     # Modales de corrales
│   ├── dashboard/                      # Métricas, estadísticas y gráficos de ventas
│   ├── genealogy/                      # Gestión de genealogía y reproducción (tablas, modales, búsqueda)
│   ├── navigation/                     # Barra lateral, migas de pan, botones de navegación
│   ├── pajillas/                       # Gestión de pajillas (modales, tablas, drawer de vaca, búsqueda)
│   ├── profiles/                       # Gestión de perfiles de usuario (modales, tablas, búsqueda)
│   ├── providers/                      # Gestión de proveedores (modales, tabla, drawer, búsqueda)
│   ├── stock/                          # Gestión de inventario (modales, drawer de proveedores, búsqueda, tablas, estadísticas)
│   ├── theming/                        # Personalización de temas (selector, textos)
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
│   ├── index.vue                       # Dashboard principal (métricas, gráficos, ventas)
│   ├── login.vue                       # Página de inicio de sesión
│   ├── about.vue                       # Página "Acerca de"
│   ├── settings.vue                    # Página de configuración
│   ├── profiles.vue                    # Gestión de perfiles
│   ├── animals/                        # Rutas de animales (listado, genealogía, reproducción, detalle)
│   ├── corrals/                        # Gestión de corrales
│   └── stock/                          # Inventario, pajillas, proveedores
├── server/                             # Backend (API) del proyecto
│   └── api/                            # Endpoints de la API (animales, corrales, stock, ventas, etc)
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
- Registro, edición y eliminación de animales
- Historial de salud y ventas
- Genealogía y reproducción (con búsqueda y filtros)
- Modales para agregar/editar/eliminar
- Búsqueda reactiva y filtrado en tablas

## 🏠 Gestión de Corrales
- Creación, edición y eliminación de corrales
- Asignación de animales mediante drag & drop
- Visualización de ocupación y estado de salud por corral

## 📦 Gestión de Inventario
- Control de stock de productos (agregar, editar, eliminar)
- Gestión de proveedores (drawer, búsqueda, tarjetas)
- Sistema de pajillas para inseminación artificial (con drawer de vaca)
- Búsqueda y filtrado en tiempo real (incluye filtro por fecha)
- Visualización de inventario con colores y estadísticas
- Modales independientes para agregar y editar

## 👥 Gestión de Usuarios
- Perfiles de usuario (crear, editar, eliminar)
- Sistema de autenticación y control de acceso
- Búsqueda y filtrado en tablas

## 📊 Dashboard
- Métricas en tiempo real
- Gráficos de ventas y estadísticas del sistema
- Tarjetas estadísticas y visualización de datos clave

## 🎨 Personalización
- Sistema de temas (oscuro/claro)
- Configuración de interfaz y textos personalizados

# BUENAS PRÁCTICAS Y TROUBLESHOOTING

- Mantén actualizado el archivo `.env` en la raíz del proyecto con las variables:
  - `NUXT_SUPABASE_URL` y `NUXT_SUPABASE_KEY` (sin comillas ni espacios)
- Reinicia el servidor de desarrollo tras cambios en `.env`
- Usa siempre el prefijo `heroicons-outline:` para iconos de Iconify
- Si un icono no carga, revisa el nombre exacto en https://icon-sets.iconify.design/heroicons-outline/
- Si ves errores de variables de entorno, revisa el archivo `.env` y la configuración de despliegue
- Para problemas con tipos de Supabase, asegúrate de importar con `import type { Database } from ...`
- Consulta `SUPABASE_SETUP.md` para detalles de configuración de Supabase

# NOTAS
- Actualiza esta documentación si agregas o renombras componentes, rutas o funcionalidades clave.
- Para flujos de trabajo y ejemplos prácticos, consulta el README.md o agrega una sección aquí si es necesario.

# EJEMPLOS DE FLUJO DE TRABAJO

## Registrar un animal y asignarlo a un corral
1. Ve a la sección de Animales y haz clic en "Agregar Animal".
2. Completa el formulario y guarda.
3. Ve a la sección de Corrales, selecciona el corral y usa drag & drop para asignar el animal.

## Agregar un proveedor y usarlo en inventario
1. Ve a la sección de Proveedores y haz clic en "Agregar Proveedor".
2. Completa el formulario y guarda.
3. Al agregar o editar un producto en Inventario, selecciona el proveedor desde el drawer.

## Filtrar inventario por fecha
1. Ve a Inventario y usa el campo de búsqueda de fecha (formato dd/mm/yyyy).
2. Los resultados se filtran en tiempo real.

# TESTING

- Actualmente no hay tests automatizados, pero se recomienda:
  - Tests unitarios para composables y lógica de negocio.
  - Tests de integración para endpoints de la API.
  - Tests end-to-end (E2E) con Cypress o Playwright para flujos críticos.
- Para agregar tests, crea una carpeta `tests/` y usa Vitest o Jest para unitarios.

# CONVENCIONES DE CÓDIGO

- Usa nombres en inglés para archivos y componentes, y español para textos de UI.
- Componentes Vue: PascalCase (`AnimalTable.vue`), composables: camelCase (`useLogout.ts`).
- Mantén los imports ordenados y usa `import type` para tipos.
- Prefiere Composition API (`setup`) en componentes nuevos.
- Usa comentarios claros para funciones complejas.

# DESPLIEGUE Y VARIABLES DE ENTORNO

- Proporciona un archivo `.env.example` con:
  ```
  NUXT_SUPABASE_URL=
  NUXT_SUPABASE_KEY=
  ```
- Para Netlify/Vercel, configura las variables en el panel de control.
- Para Docker, usa `--env-file .env` o define variables en el `docker-compose.yml`.
- Reinicia siempre el servidor tras cambios en variables.

# CHANGELOG (Historial de cambios)

- v3.17.x: Refactor de inventario, drawer de proveedores, búsqueda reactiva, soporte de fechas, iconos con Iconify.
- v3.16.x: Mejoras en genealogía, modales independientes, fixes de Supabase y types.
- v3.15.x: Primeras versiones estables de gestión animal, corrales y usuarios.

# FAQ (Preguntas frecuentes)

**¿Por qué no se muestran los iconos?**
- Verifica que el nombre sea correcto y tenga el prefijo `heroicons-outline:`.
- Instala el paquete de iconos con `bun i -D @iconify-json/heroicons`.

**¿Por qué sale error de variables de entorno de Supabase?**
- Asegúrate de tener `.env` en la raíz y que las variables estén bien escritas y sin comillas.
- Reinicia el servidor tras cambios.

**¿Por qué no puedo eliminar una reproducción?**
- Verifica que no haya restricciones de claves foráneas en la base de datos.
- Usa los endpoints de eliminación múltiple para evitar errores de integridad.

**¿Cómo agrego un nuevo tipo de estado de salud?**
- Modifica el array `estadosSalud` en los componentes relacionados y actualiza la base de datos si es necesario.

# BADGES Y ENLACES (para README)

- Puedes agregar badges de estado de build, cobertura y versión en el README:
  ```md
  ![Build](https://img.shields.io/github/actions/workflow/status/tu-org/tu-repo/ci.yml)
  ![Version](https://img.shields.io/github/package-json/v/tu-org/tu-repo)
  ![License](https://img.shields.io/github/license/tu-org/tu-repo)
  ```
- Enlaza a la documentación, demo online, y panel de Supabase si es público.

