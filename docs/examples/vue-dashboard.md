# Example: Vue.js Graph Dashboard

This example showcases how to build an interactive dashboard using Vue.js and the `@receptron/graphai_vue_cytoscape` package to visualize and interact with GraphAI workflows.

## Features Demonstrated

-   **`@receptron/graphai_vue_cytoscape`**: Integration of the Vue composable for Cytoscape.
-   **Vue 3 (Composition API)**: Building reactive components.
-   **Dynamic Graph Rendering**: Loading and displaying graph data.
-   **Interactivity**: Adding nodes, edges, and selecting elements.
-   **Layout Management**: Applying different graph layouts (e.g., Klay).
-   **Node Information Display**: Showing details of a selected node.

## Prerequisites

-   Node.js 16+
-   npm or yarn
-   Basic understanding of Vue.js

## Code

### 1. Project Setup

```bash
# Create a new Vue project
npm create vue@latest graphai-vue-dashboard-example
cd graphai-vue-dashboard-example

# Install dependencies
npm install @receptron/graphai_vue_cytoscape cytoscape cytoscape-klay
```
During `npm create vue@latest`, you can choose default options (e.g., No TypeScript, No Router, No Pinia, etc.) for simplicity, or configure as you prefer.

### 2. Graph Display Component (`src/components/GraphDisplay.vue`)

This is a reusable component to render the graph. (Similar to the one in the Graph Dashboard Tutorial).

```vue
<template>
  <div class="graph-visualization-container">
    <div ref="cytoscapeElement" class="cytoscape-render-area"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, toRefs } from 'vue';
import { useCytoscape } from '@receptron/graphai_vue_cytoscape';

const props = defineProps({
  elements: { type: Array, default: () => [] },
  layoutConfig: { 
    type: Object, 
    default: () => ({ name: 'klay', klay: { direction: 'RIGHT', spacing: 60 } }) 
  },
  styleDefinition: { type: Array, default: () => defaultGraphStyles }
});

const emit = defineEmits(['node-tapped', 'graph-ready']);
const { elements, layoutConfig, styleDefinition } = toRefs(props);
const cytoscapeElement = ref(null);
const { initCytoscape, cyInstance, layoutGraph, on } = useCytoscape();

const defaultGraphStyles = [
  { selector: 'node', style: { 'background-color': '#0ea5e9', 'label': 'data(label)', 'color': 'white', 'text-valign': 'center', 'font-size': '10px', 'width': '90px', 'height': '45px', 'shape': 'round-rectangle', 'border-width': 1, 'border-color': '#0284c7'} },
  { selector: 'edge', style: { 'width': 1.5, 'line-color': '#64748b', 'target-arrow-color': '#64748b', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } },
  { selector: 'node:selected', style: { 'background-color': '#ef4444', 'border-color': '#dc2626' } }
];

onMounted(async () => {
  if (cytoscapeElement.value) {
    await initCytoscape(cytoscapeElement.value, {
      elements: elements.value,
      style: styleDefinition.value,
      layout: layoutConfig.value
    });
    if (cyInstance.value) {
      on('tap', 'node', (event) => {
        emit('node-tapped', event.target.data());
      });
      on('tap', (event) => {
        if (event.target === cyInstance.value) emit('node-tapped', null); // Background tap
      });
      emit('graph-ready', cyInstance.value);
    }
  }
});

watch(elements, (newElements) => {
  if (cyInstance.value) {
    cyInstance.value.elements().remove();
    cyInstance.value.add(newElements);
    layoutGraph(layoutConfig.value);
  }
}, { deep: true });

watch(layoutConfig, (newLayout) => {
  if (cyInstance.value) {
    layoutGraph(newLayout);
  }
}, { deep: true });

// Expose a function to re-apply layout if needed externally
defineExpose({
  forceRelayout: () => {
    if (cyInstance.value) layoutGraph(layoutConfig.value);
  }
});
</script>

<style scoped>
.graph-visualization-container {
  width: 100%;
  height: 600px; /* Default height, can be overridden */
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f8fafc;
}
.cytoscape-render-area {
  width: 100%;
  height: 100%;
}
</style>
```

### 3. Main Application (`src/App.vue`)

```vue
<template>
  <div id="vue-dashboard-app">
    <header class="app-header">
      <h1>GraphAI Vue Dashboard Example</h1>
    </header>
    <div class="dashboard-layout">
      <aside class="controls-sidebar">
        <h2>Controls</h2>
        <button @click="addSampleNode">Add Node</button>
        <button @click="addSampleEdge" :disabled="currentGraphElements.filter(el => el.group === 'nodes').length < 2">Add Edge</button>
        <hr>
        <label for="layout-select">Layout:</label>
        <select id="layout-select" v-model="selectedLayoutName" @change="updateGraphLayout">
          <option value="klay">Klay (Hierarchical)</option>
          <option value="cose">CoSE (Force-Directed)</option>
          <option value="grid">Grid</option>
          <option value="circle">Circle</option>
        </select>
        <hr>
        <button @click="loadInitialData">Load Sample Workflow</button>
        <button @click="clearCurrentGraph">Clear Graph</button>
      </aside>

      <main class="graph-main-area">
        <GraphDisplay 
          :elements="currentGraphElements" 
          :layout-config="currentLayoutConfig"
          @node-tapped="displayNodeInfo"
          ref="graphDisplayRef"
          style="height: calc(100vh - 200px);" /* Example of overriding height */
        />
      </main>

      <aside class="info-sidebar">
        <h2>Selected Node</h2>
        <div v-if="activeNodeInfo" class="node-details">
          <p><strong>ID:</strong> {{ activeNodeInfo.id }}</p>
          <p><strong>Label:</strong> {{ activeNodeInfo.label }}</p>
          <p v-if="activeNodeInfo.type"><strong>Type:</strong> {{ activeNodeInfo.type }}</p>
          <pre v-if="activeNodeInfo.params"><strong>Params:</strong> {{ JSON.stringify(activeNodeInfo.params, null, 2) }}</pre>
        </div>
        <p v-else>Click a node to see its details.</p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import GraphDisplay from './components/GraphDisplay.vue';

const currentGraphElements = ref([]);
const activeNodeInfo = ref(null);
const graphDisplayRef = ref(null); // Ref for the GraphDisplay component instance

let nodeIdCounter = 0;

const selectedLayoutName = ref('klay');
const currentLayoutConfig = computed(() => {
  switch (selectedLayoutName.value) {
    case 'klay':
      return { name: 'klay', klay: { direction: 'DOWN', spacing: 70, nodePlacement: 'LINEAR_SEGMENTS', thoroughness: 7 }, fit: true, padding: 30 };
    case 'cose':
      return { name: 'cose', idealEdgeLength: 100, nodeOverlap: 20, refresh: 20, fit: true, padding: 30, randomize: false, componentSpacing: 100, nodeRepulsion: () => 400000, edgeElasticity: () => 100 };
    case 'grid':
      return { name: 'grid', fit: true, padding: 30, rows: undefined, cols: undefined };
    case 'circle':
      return { name: 'circle', fit: true, padding: 30, radius: undefined };
    default:
      return { name: 'klay', klay: { direction: 'DOWN', spacing: 70 } };
  }
});

const updateGraphLayout = () => {
  // The watch in GraphDisplay handles layout changes via layoutConfig prop
  // If direct re-layout is needed: graphDisplayRef.value?.forceRelayout();
};

const addSampleNode = () => {
  nodeIdCounter++;
  const newNode = { 
    group: 'nodes', 
    data: { 
      id: `n${nodeIdCounter}`, 
      label: `Node ${nodeIdCounter}`,
      type: nodeIdCounter % 2 === 0 ? 'processing' : 'data_source' 
    } 
  };
  currentGraphElements.value = [...currentGraphElements.value, newNode];
};

const addSampleEdge = () => {
  const nodes = currentGraphElements.value.filter(el => el.group === 'nodes');
  if (nodes.length >= 2) {
    const sourceIdx = Math.floor(Math.random() * nodes.length);
    let targetIdx = Math.floor(Math.random() * nodes.length);
    while (targetIdx === sourceIdx && nodes.length > 1) {
      targetIdx = Math.floor(Math.random() * nodes.length);
    }
    if (nodes[sourceIdx].data.id !== nodes[targetIdx].data.id) {
      const newEdge = { 
        group: 'edges', 
        data: { 
          id: `e${nodes[sourceIdx].data.id}-${nodes[targetIdx].data.id}`, 
          source: nodes[sourceIdx].data.id, 
          target: nodes[targetIdx].data.id 
        } 
      };
      currentGraphElements.value = [...currentGraphElements.value, newEdge];
    }
  }
};

const displayNodeInfo = (nodeData) => {
  activeNodeInfo.value = nodeData;
};

const loadInitialData = () => {
  nodeIdCounter = 3;
  currentGraphElements.value = [
    { group: 'nodes', data: { id: 'n1', label: 'User Input', type: 'input', params: { schema: 'text' } } },
    { group: 'nodes', data: { id: 'n2', label: 'OpenAI Call', type: 'llm_agent', params: { model: 'gpt-3.5-turbo' } } },
    { group: 'nodes', data: { id: 'n3', label: 'Format Output', type: 'processing', params: { template: 'json' } } },
    { group: 'edges', data: { id: 'e1-2', source: 'n1', target: 'n2' } },
    { group: 'edges', data: { id: 'e2-3', source: 'n2', target: 'n3' } }
  ];
  activeNodeInfo.value = null; // Clear selection
};

const clearCurrentGraph = () => {
  currentGraphElements.value = [];
  activeNodeInfo.value = null;
  nodeIdCounter = 0;
};

onMounted(() => {
  loadInitialData();
});

</script>

<style>
/* Global styles */
body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; }
#vue-dashboard-app { display: flex; flex-direction: column; height: 100vh; }

.app-header {
  background-color: #1f2937; /* Dark gray */
  color: white;
  padding: 1rem 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.app-header h1 { margin: 0; font-size: 1.5rem; }

.dashboard-layout {
  display: grid;
  grid-template-columns: 280px 1fr 320px; /* Controls | Graph | Info */
  gap: 1rem;
  padding: 1rem;
  flex-grow: 1;
  overflow: hidden; /* Prevent layout from causing scrollbars on body */
}

.controls-sidebar, .info-sidebar {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow-y: auto;
}
.controls-sidebar h2, .info-sidebar h2 {
  margin-top: 0;
  font-size: 1.25rem;
  color: #374151; /* Medium gray */
  border-bottom: 1px solid #e5e7eb; /* Light gray */
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.controls-sidebar button, .controls-sidebar select {
  display: block;
  width: 100%;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.75rem;
  border: 1px solid #d1d5db; /* Gray border */
  border-radius: 0.375rem;
  background-color: #fff;
  font-size: 0.9rem;
  box-sizing: border-box;
}
.controls-sidebar button {
  background-color: #3b82f6; /* Blue */
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}
.controls-sidebar button:hover:not(:disabled) { background-color: #2563eb; } /* Darker blue */
.controls-sidebar button:disabled { background-color: #9ca3af; cursor: not-allowed; } /* Muted gray */
.controls-sidebar hr { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }
.controls-sidebar label { display: block; margin-bottom: 0.3rem; font-size: 0.85rem; color: #4b5563; }

.graph-main-area {
  /* The GraphDisplay component will fill this area */
  /* Its height is set via style prop for flexibility */
  min-height: 0; /* Important for flex/grid children to shrink properly */
}

.node-details p { margin: 0.5rem 0; font-size: 0.9rem; }
.node-details strong { color: #4b5563; }
.node-details pre {
  background-color: #f3f4f6; /* Very light gray */
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  margin-top: 0.5rem;
}
</style>
```

### 4. Running the Dashboard

```bash
npm run dev
```
Navigate to the URL provided by Vite (usually `http://localhost:5173`). You should see the dashboard with:
- Controls to add nodes/edges and change layouts.
- A central area for graph visualization.
- A sidebar to display information about selected nodes.

## Key Concepts

-   **`useCytoscape` Composable**: Provides functions like `initCytoscape`, `cyInstance` (the Cytoscape core instance), `layoutGraph`, and `on` (for event handling).
-   **Reactive Data**: Vue's `ref` and `computed` are used to manage graph elements and layout configurations dynamically.
-   **Props and Events**: The `GraphDisplay` component accepts `elements`, `layoutConfig`, and `styleDefinition` as props, and emits events like `node-tapped`.
-   **Component Structure**: A parent `App.vue` orchestrates the dashboard, using a child `GraphDisplay.vue` for the actual rendering.
-   **Styling**: Cytoscape styles are defined as an array of JavaScript objects.

## Customization and Further Steps

-   **Fetch Real Data**: Modify `loadInitialData` to fetch workflow data from your GraphAI server API.
-   **Save Changes**: Implement functionality to send graph modifications back to a server.
-   **More Sophisticated Styling**: Dynamically change node styles based on their properties (e.g., agent type, status).
-   **Context Menus**: Add right-click context menus to nodes for actions like "Edit Properties", "Delete Node".
-   **Error Handling**: Add error handling for API calls.
-   **State Management**: For larger applications, consider Pinia for state management.

This example provides a solid foundation for building rich, interactive UIs for your GraphAI projects using Vue.js.