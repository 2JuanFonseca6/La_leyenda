#!/bin/bash
set -e

# Instala Bun
curl -fsSL https://bun.sh/install | bash

# Exporta las variables de entorno para Bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Instala las dependencias del proyecto
bun install 