# Nuxt

**Version:** 3.17.2

# Icons

[HeroIcons](https://icon-sets.iconify.design/heroicons/)

```bash
bun i -D @iconify-json/heroicons
```

<br>

[HealthIcons](https://icon-sets.iconify.design/healthicons/)

```bash
bun i -D @iconify-json/healthicons
```

<br>

[Lucide](https://icon-sets.iconify.design/lucide/)

```bash
bun i -D @iconify-json/lucide
```

# Supabase

## Get db structure

```bash
bunx supabase login
```

```bash
bunx supabase gen types typescript --project-id "yhydjqxtnqinaxnqnegn" --schema public > types/supabase.ts
```

---

# Docker
[Dockerfile With Bun](Dockerfile)

## Build and run the Docker image
```bash
docker build -t san-rafael .
```
> [!NOTE]
> This command tells Docker to build an image with the tag my-nuxt-app using the current directory (denoted by the .).

```bash
docker run -p 3000:3000 san-rafael
```

## Using docker compose (optional)
Create de docker-compose.yml

```yml
version: '3'
services:
  web:
    build: .
    ports:
      - "3000:3000"
```

docker-compose.yml for more complex applications
```bash
docker-compose up
```

---

# POR HACER

## Genealogia (La tabla es la de reproduccion)

- [ ] Modal para agregar registros genealogicos (Condicional de que no puede agregar registros masculinos o bebes en campos femeninos y en campos femeninos no se puede agregar registros masculinos o bebes).

- [ ] Genearar la posibilidad de asignar un registro genealogico a un registro animal mediante el checkbox en seleccion unica. Ademas de agregar la condicional de poder eliminar ese asignacion o mostrar alertas para cuando se intenta generar una doble asignacion a un mismo registro.

## Animal

- [X] <s>Agregar la funcionalidad a la columna de checkbox, para eliminar varios o un solo registro.</s>

- [X] <s>Agregar el modal para la creacion de un registro animal.</s>

## Inventario

- [ ] Mostrar de manera visual el inventario con diferentes colores en la tabla.

## Proveedores

- [ ] Agregar de manera visual los proveedores en forma de cartas con paginacion.

## <s>Usuarios</s>

- [X] <s>Agregar la tabla de usuarios y funcionalidad de eliminar</s>
- [X] <s>Agregar componentes de busqueda de usuarios</s>
- [X] <s>Modal para agregar usuarios</s>
- [X] <s>Modal para editar usuarios</s>
- [X] <s>Agregar el apartado de usuarios de la version (prueba) a la version (stable).</s>
