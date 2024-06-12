<template>
<main>
  
  <div class="h-screen w-full">
    <div class="w-10/12 h-1/2 bg-white rounded-md mt-4 mx-auto border-2">
      <div ref="cytoscapeRef" class="w-full h-full" />
    </div>
    <div>
      a
    </div>
  </div>
</main>
</template>

<script lang="ts">
import { defineComponent, ref, computed, ComputedRef } from "vue";

import { GraphAI } from "graphai";
import { streamMockAgent } from "@graphai/vanilla";

import { graphData } from "./data";

import { useCytoscape } from "./composables/cytoscape";

export default defineComponent({
  setup() {
    const selectdGraph = ref(graphData)
    const { updateCytoscape, cytoscapeRef, resetCytoscape } = useCytoscape(selectdGraph);
    
    const run = async () => {
      const graphai = new GraphAI(graphData, { streamMockAgent });
      graphai.onLogCallback = async ({ nodeId, state, inputs, result, errorMessage }) => {
        // logs.value.push({ nodeId, state, inputs, result, errorMessage });
        updateCytoscape(nodeId, state);
        console.log(nodeId, state);
      };
      const results = await graphai.run();
    }
    run();

    return {
      cytoscapeRef
    };
  }
});
</script>


<style scoped>
header {
    line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
