<template>
  <UContextMenu size="xl" :items="items" class="w-full h-full">
    <Sidebar>
      <slot />
    </Sidebar>
  </UContextMenu>
</template>

<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'
import { ref } from 'vue'
import { useUserRole } from '~/composables/arestricted'
import { useLogout } from '~/composables/useLogout'

const { userRole } = useUserRole()
const { logout } = useLogout()

const items = ref<ContextMenuItem[]>([
  {
    label: 'Inicio',
    icon: 'i-heroicons-home-solid',
    type: 'link',
    href: '/',
  },
  {
    label: 'Animales',
    icon: 'i-healthicons-animal-cow',
    type: 'link',
    href: '/animals',
  },
  {
    label: 'Inventario',
    icon: 'i-healthicons-i-exam-multiple-choice',
    type: 'link',
    href: '/stock',
  },
  {
    label: 'Ajustes',
    icon: 'i-heroicons-cog',
    type: 'link',
    href: '/settings',
  },
  {
    label: 'Corrales',
    icon: 'i-healthicons-syringe-outline',
    type: 'link',
    href: '/corrals',
  },
  {
    label: 'Cerrar sesión',
    icon: 'i-heroicons-arrow-right-on-rectangle-solid',
    color: 'error' as const,
    onSelect: () => logout(),
  },
])
</script>
