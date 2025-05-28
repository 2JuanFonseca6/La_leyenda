<template>
  <h1>Corral</h1>
  <div class="drop-zone" @drop="onDrop($event, 1)" @dragover.prevent @dragenter.prevent>
    <div v-for="animal in getCorral(1)" :key="animal.id" class="drag-el" draggable="true"  @dragstart="startDrag($event, animal)">
      <h2>Corral {{ animal.title }}</h2>
    </div>
  </div>
  <div class="drop-zone" @drop="onDrop($event, 2)" @dragover.prevent @dragenter.prevent>
    <div v-for="animal in getCorral(2)" :key="animal.id" class="drag-el" draggable="true" @dragstart="startDrag($event, animal)">
      <h2>Corral {{ animal.title }}</h2>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'logged',
})

const animals = ref([
  { id: 1, title: 'Animal 1', corral: 1 },
  { id: 2, title: 'Animal 2', corral: 1 },
  { id: 3, title: 'Animal 3', corral: 2 },
])

const getCorral = (corral: number) => {
  return animals.value.filter(animal => animal.corral === corral)
}

const startDrag = (event: DragEvent, animal: any) => {
  event.dataTransfer?.setData('AnimalID', animal.id.toString())
  event.dataTransfer!.effectAllowed = 'move'
}

const onDrop = (event: DragEvent, corral: number) => {
  const animalId = event.dataTransfer?.getData('AnimalID')
  const animal = animals.value.find(animal => animal.id === Number(animalId))
  if (animal) {
    animal.corral = corral
  }
}
</script>

<style scoped>
.drop-zone {
  width: 100%;
  height: 200px;
  border: 2px dashed #ccc;
  margin-bottom: 20px;
}

.drag-el {
  width: 100px;
  height: 100px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  margin: 10px;
  display: inline-block;
  text-align: center;
  line-height: 100px;
}

.drag-el:nth-last-child-type(1) {
  margin-bottom: 0;
}

</style>