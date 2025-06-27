<template>
  <div class="vue-flow-container h-[500px] w-full border rounded-lg print:h-[300px] print:border-0 print:rounded-none">
    <VueFlow v-model:nodes="nodes" v-model:edges="edges" :fit-view-on-init="true" :max-zoom="1.5" :min-zoom="0.5"
      :node-drag-threshold="0" class="print:scale-75 print:transform print:origin-top-left">
      <Background :gap="35" :size="1" class="print:hidden" />
      <Controls class="print:hidden" />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, Position } from '@vue-flow/core'
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
</script>