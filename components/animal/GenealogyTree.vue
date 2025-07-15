<template>
  <div class="vue-flow-container h-[500px] w-full border rounded-lg print:h-[700px] print:w-[95vw] print:mx-auto print:border print:border-gray-300 print:rounded-lg print:p-0 print:m-0 print:scale-[1.35] print:origin-top-left">
    <VueFlow v-model:nodes="nodes" v-model:edges="edges" :fit-view-on-init="true" :max-zoom="1.5" :min-zoom="0.5"
      :node-drag-threshold="0">
      <Background :gap="35" :size="1" class="print:hidden" />
      <Controls class="print:hidden" />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, Position, useVueFlow } from '@vue-flow/core'
import { Background, Controls } from '@vue-flow/additional-components'
import '@vue-flow/core/dist/style.css'
import type { Edge, Node } from '@vue-flow/core'
import type { GenealogyTreeNode } from '~/types/animal'

const props = defineProps<{
  treeData?: GenealogyTreeNode
}>()

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const positionCache = new Map()

// Nuevo parámetro: isFocalNode. True para el nodo principal (TERNERO), false para sus padres (VACA, TORO).
const buildTree = (nodeData: GenealogyTreeNode | undefined, x: number = 0, y: number = 0, isFocalNode: boolean = true) => {
  if (!nodeData || positionCache.has(nodeData.id)) return

  const horizontalSpacing = 200
  // Los padres (VACA, TORO) se dibujarán debajo del nodo focal (TERNERO)
  const verticalSpacing = 100

  const currentNode: Node = {
    id: nodeData.id,
    label: `${nodeData.id} | ${nodeData.raza} | ${nodeData.tipo_animal}`,
    position: { x, y },
    data: nodeData,
    connectable: false,
    sourcePosition: isFocalNode ? Position.Bottom : Position.Top,
    targetPosition: Position.Bottom,
  }

  nodes.value.push(currentNode)
  positionCache.set(nodeData.id, { x, y })

  if (nodeData.madre) {
    buildTree(nodeData.madre, x - horizontalSpacing, y + verticalSpacing, false)
    edges.value.push({
      id: `edge-${nodeData.madre.id}-${nodeData.id}`,
      source: nodeData.madre.id,
      target: nodeData.id,
      label: 'Madre',
      labelBgPadding: [8, 4],
    })
  }

  if (nodeData.padre) {
    buildTree(nodeData.padre, x + horizontalSpacing, y + verticalSpacing, false)
    edges.value.push({
      id: `edge-${nodeData.padre.id}-${nodeData.id}`,
      source: nodeData.padre.id,
      target: nodeData.id,
      label: 'Padre',
      labelBgPadding: [8, 4],
    })
  }
}

watch(() => props.treeData, (newVal) => {
  if (newVal) {
    nodes.value = []
    edges.value = []
    positionCache.clear()
    buildTree(newVal, 500, 100, true)
  }
}, { immediate: true, deep: true })

// --- Ajuste automático para impresión ---
const { fitView } = useVueFlow()

onMounted(() => {
  // Ajustar el árbol automáticamente antes de imprimir
  const handleBeforePrint = () => {
    setTimeout(() => {
      fitView && fitView()
    }, 100) // pequeño delay para asegurar render
  }
  window.addEventListener('beforeprint', handleBeforePrint)
})
</script>

<style scoped>
.vue-flow-container {
  height: 500px;
  width: 100%;
  border: 1.5px solid #d1d5db;
  border-radius: 0.5rem;
  background: #fff;
  margin: 0 auto;
  padding: 0;
  overflow: auto;
}

@media print {
  .vue-flow-container {
    width: 180vw !important;
    height: 90vh !important;
    min-width: 0 !important;
    min-height: 0 !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    border: none !important;
    box-shadow: none !important;
    /* Escala el contenido para que quepa en la hoja */
    transform: scale(0.45);
    transform-origin: top left;
    break-after: auto !important;
    break-inside: avoid !important;
    page-break-after: auto !important;
    page-break-inside: avoid !important;
  }
  body, html {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
}
</style>