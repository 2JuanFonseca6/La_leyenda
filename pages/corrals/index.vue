<template>
  <DragDropAnimals />
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ['restricted'],
  layout: 'logged',
})
</script>