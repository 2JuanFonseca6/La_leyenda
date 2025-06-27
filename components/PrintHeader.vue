<template>
  <div class="print-header print-only">
    <div class="logo">
      <img 
        src="/img/logo/logo-black.webp" 
        alt="Logo San Rafael" 
        class="h-10 w-auto"
        @error="handleImageError"
      />
    </div>
    <div class="title">
      {{ title }}
    </div>
    <div class="date">
      {{ currentDate }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'San Rafael - Gestión Ganadera'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Error loading logo image:', img.src)
  // Fallback to text if image fails to load
  img.style.display = 'none'
  img.parentElement!.innerHTML = '<span class="text-lg font-bold text-gray-800">San Rafael</span>'
}
</script>

<style scoped>
.print-header {
  display: none;
}

@media print {
  .print-header {
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
    border-bottom: 2px solid #262626;
    margin-bottom: 30px;
    page-break-after: avoid;
    width: 100%;
  }

  .print-header .logo {
    height: 60px;
    width: auto;
    flex-shrink: 0;
  }

  .print-header .logo img {
    height: 60px;
    width: auto;
    object-fit: contain;
  }

  .print-header .title {
    font-size: 24px;
    font-weight: bold;
    color: #262626;
    text-align: center;
    flex-grow: 1;
    margin: 0 20px;
  }

  .print-header .date {
    font-size: 14px;
    color: #737373;
    text-align: right;
    flex-shrink: 0;
  }
}
</style> 