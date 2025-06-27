<template>
  <UContextMenu size="xl" :items="items" class="w-full h-full">
    <Sidebar>
      <slot />
    </Sidebar>
  </UContextMenu>
</template>

<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import { useUserRole } from '~/composables/arestricted'
import { useLogout } from '~/composables/useLogout'

const { userRole } = useUserRole()
const { logout } = useLogout()

const items = computed<ContextMenuItem[]>(() => {
  const baseItems: ContextMenuItem[] = [
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
      label: 'Pajillas',
      icon: 'i-healthicons-syringe-outline',
      type: 'link',
      href: '/pajillas',
    },
    {
      label: 'Ajustes',
      icon: 'i-heroicons-cog',
      type: 'link',
      href: '/settings',
    },
  ]

  // Agrega Corrales solo si el usuario es admin
  if (userRole.value === 'admin') {
    baseItems.push({
      label: 'Corrales',
      icon: 'i-healthicons-syringe-outline',
      type: 'link',
      href: '/corrals',
    })
  }

  // Siempre incluir la opción de logout
  baseItems.push({
    label: 'Cerrar sesión',
    icon: 'i-heroicons-arrow-right-on-rectangle-solid',
    color: 'error' as const,
    onSelect: () => logout(),
  })

  return baseItems
})
</script>
