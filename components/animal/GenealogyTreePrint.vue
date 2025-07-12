<template>
  <div class="genealogy-print">
    <div class="genealogy-container">
      <div class="genealogy-node main-node">
        <div class="node-content">
          <div class="node-id">{{ treeData?.id || 'N/A' }}</div>
          <div class="node-info">{{ treeData?.raza || 'N/A' }} | {{ treeData?.tipo_animal || 'N/A' }}</div>
        </div>
      </div>
      
      <div class="parents-container">
        <div v-if="treeData?.madre" class="parent-node mother">
          <div class="node-content">
            <div class="node-id">{{ treeData.madre.id }}</div>
            <div class="node-info">{{ treeData.madre.raza }} | {{ treeData.madre.tipo_animal }}</div>
            <div class="parent-label">Madre</div>
          </div>
        </div>
        
        <div v-if="treeData?.padre" class="parent-node father">
          <div class="node-content">
            <div class="node-id">{{ treeData.padre.id }}</div>
            <div class="node-info">{{ treeData.padre.raza }} | {{ treeData.padre.tipo_animal }}</div>
            <div class="parent-label">Padre</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GenealogyTreeNode } from '~/types/animal'

const props = defineProps<{
  treeData?: GenealogyTreeNode | null
}>()
</script>

<style scoped>
.genealogy-print {
  display: none;
}

@media print {
  .genealogy-print {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    margin: 1.5rem 0;
    padding: 1.5rem 1rem;
    border: 1.5px solid #374151;
    background: #fff;
    border-radius: 10px;
    min-width: 350px;
    max-width: 800px;
    width: 100%;
    font-family: 'Times New Roman', Times, serif;
  }

  .genealogy-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    width: 100%;
  }

  .genealogy-node {
    border: 1.5px solid #374151;
    border-radius: 8px;
    padding: 1rem 2rem;
    background: #fff;
    min-width: 200px;
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: #222;
    position: relative;
    z-index: 2;
  }

  .main-node {
    border-color: #222;
    background: #fff;
    font-size: 1.2rem;
    font-weight: 700;
    color: #111;
  }

  .parents-container {
    display: flex;
    gap: 4rem;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    position: relative;
    margin-top: 1.2rem;
  }

  .parent-node {
    border: 1.5px solid #374151;
    border-radius: 8px;
    background: #fff;
    min-width: 160px;
    padding: 0.7rem 1.2rem 1.2rem 1.2rem;
    text-align: center;
    font-size: 1rem;
    font-weight: 500;
    color: #222;
    position: relative;
    z-index: 2;
  }

  .parent-label {
    font-size: 0.95rem;
    color: #374151;
    background: none;
    border-radius: 0;
    padding: 0;
    font-style: italic;
    font-weight: 400;
    margin-top: 0.4rem;
    display: block;
    letter-spacing: 0.2px;
  }

  .node-content {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    align-items: center;
  }

  .node-id {
    font-weight: bold;
    font-size: 1.05rem;
    color: #222;
    letter-spacing: 0.2px;
  }

  .node-info {
    font-size: 0.98rem;
    color: #444;
    font-weight: 400;
    letter-spacing: 0.1px;
  }

  /* Líneas rectas de conexión */
  .genealogy-container {
    position: relative;
  }
  .genealogy-container::before {
    content: '';
    display: block;
    position: absolute;
    top: 2.2rem;
    left: 50%;
    width: 2px;
    height: 2.2rem;
    background: #374151;
    z-index: 1;
    transform: translateX(-50%);
  }
  .parents-container::before {
    content: '';
    position: absolute;
    top: -1.2rem;
    left: 0;
    width: 100%;
    height: 0;
    border-top: 1.5px solid #374151;
    z-index: 1;
    pointer-events: none;
  }
  .parent-node.mother::before,
  .parent-node.father::before,
  .parent-node.mother::after,
  .parent-node.father::after {
    content: none !important;
  }
}
</style> 