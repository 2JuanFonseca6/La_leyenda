<template>
  <div class="genealogy-print" v-if="treeData">
    <ul class="genealogy-list">
      <GenealogyListNode :node="treeData" role="Animal" :generation="0" />
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { GenealogyTreeNode } from '~/types/animal'
const props = defineProps<{ treeData?: GenealogyTreeNode | null }>()
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default {
  components: {
    GenealogyListNode: defineComponent({
      name: 'GenealogyListNode',
      props: {
        node: {
          type: Object,
          required: true
        },
        role: {
          type: String,
          required: true
        },
        generation: {
          type: Number,
          required: true
        }
      },
      computed: {
        nextGeneration() {
          return this.generation + 1
        },
        motherRole() {
          if (this.generation === 0) return 'Madre'
          if (this.generation === 1) return 'Abuela materna'
          if (this.generation === 2) return 'Bisabuela materna'
          return 'Ascendiente'
        },
        fatherRole() {
          if (this.generation === 0) return 'Padre'
          if (this.generation === 1) return 'Abuelo materno'
          if (this.generation === 2) return 'Bisabuelo materno'
          return 'Ascendiente'
        }
      },
      template: `
        <li class='genealogy-list-item' :style="{ marginLeft: (generation * 2) + 'rem' }">
          <span class='role-label'>{{ role }}:</span>
          <span class='node-id'>{{ node.id }}</span>
          <span class='node-info'>{{ node.raza }} | {{ node.tipo_animal }}</span>
          <ul v-if="generation < 4 && (node.madre || node.padre)">
            <GenealogyListNode v-if="node.madre" :node="node.madre" :role="motherRole" :generation="nextGeneration" />
            <GenealogyListNode v-if="node.padre" :node="node.padre" :role="fatherRole" :generation="nextGeneration" />
          </ul>
        </li>
      `
    })
  }
}
</script>

<style scoped>
.genealogy-print {
  display: none;
}

@media print {
  .genealogy-print {
    display: block !important;
    margin: 1.5rem 0;
    padding: 1.5rem 1rem;
    border: none;
    background: #fff;
    border-radius: 0;
    min-width: 350px;
    max-width: 800px;
    width: 100%;
    font-family: 'Times New Roman', Times, serif;
  }
  .genealogy-list {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }
  .genealogy-list-item {
    margin-bottom: 0.7rem;
    font-size: 1.05rem;
    font-weight: 500;
    color: #222;
  }
  .role-label {
    font-weight: bold;
    margin-right: 0.5rem;
  }
  .node-id {
    font-weight: bold;
    margin-right: 0.5rem;
    color: #374151;
  }
  .node-info {
    color: #444;
    font-weight: 400;
    margin-left: 0.5rem;
  }
}
</style> 