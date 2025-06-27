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
    display: block !important;
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    background: white;
  }

  .genealogy-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .genealogy-node {
    border: 2px solid #374151;
    border-radius: 8px;
    padding: 0.75rem;
    background: white;
    min-width: 200px;
    text-align: center;
  }

  .main-node {
    border-color: #1f2937;
    background: #f9fafb;
  }

  .parents-container {
    display: flex;
    gap: 2rem;
    justify-content: center;
  }

  .parent-node {
    border-color: #6b7280;
    position: relative;
  }

  .parent-node::before {
    content: '';
    position: absolute;
    top: -1rem;
    left: 50%;
    width: 2px;
    height: 1rem;
    background: #374151;
    transform: translateX(-50%);
  }

  .node-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .node-id {
    font-weight: bold;
    font-size: 14px;
    color: #1f2937;
  }

  .node-info {
    font-size: 12px;
    color: #6b7280;
  }

  .parent-label {
    font-size: 10px;
    color: #9ca3af;
    font-style: italic;
    margin-top: 0.25rem;
  }

  .mother::after {
    content: '↖';
    position: absolute;
    top: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 16px;
    color: #374151;
  }

  .father::after {
    content: '↗';
    position: absolute;
    top: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 16px;
    color: #374151;
  }
}
</style> 