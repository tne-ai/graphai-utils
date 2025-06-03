# Package: @receptron/graphai_vue_cytoscape

**Version**: `0.2.0` (Active Development)

## Overview

`@receptron/graphai_vue_cytoscape` is a Vue 3 composable designed to integrate Cytoscape.js into Vue applications for interactive graph visualization. It simplifies the process of rendering and managing GraphAI workflows or any graph-like data structures within a Vue environment.

This package is ideal for developers looking to build UIs that display, edit, or interact with graphs, such as workflow editors, data relationship visualizers, or monitoring dashboards.

## Key Features

-   **Vue 3 Composition API**: Built as a composable (`useCytoscape`) for easy integration into Vue 3 `setup` scripts.
-   **Cytoscape.js Integration**: Leverages the power and flexibility of Cytoscape.js for rendering and graph manipulation.
-   **Layout Support**: Includes support for various Cytoscape.js layouts, with specific integration for `cytoscape-klay` for hierarchical layouts.
-   **Reactivity**: Designed to work with Vue's reactivity system for dynamic updates to graph elements, styles, and layouts.
-   **Event Handling**: Provides a way to attach and detach event listeners to Cytoscape instances (e.g., node taps, edge selections).
-   **TypeScript Support**: Comes with type definitions for a better development experience.

## Installation

```bash
npm install @receptron/graphai_vue_cytoscape cytoscape cytoscape-klay vue@^3
# or
yarn add @receptron/graphai_vue_cytoscape cytoscape cytoscape-klay vue@^3
```
-   `cytoscape`: Core Cytoscape.js library (peer dependency).
-   `cytoscape-klay`: Klay layout algorithm for hierarchical graph rendering (peer dependency, optional if not using Klay).
-   `vue`: Vue 3 (peer dependency).

The main export is `lib/cytoscape.js` and types are in `lib/cytoscape.d.ts`.

## Core API & Usage

The primary way to use this package is through the `useCytoscape` composable.

```vue
<template>
  <div class="graph-container-wrapper">
    <div ref="cytoscapeContainerElement" style="width: 100%; height: 500px;"></div>
    <div v-if="selectedNodeData">
      <h3>Selected Node: {{ selectedNodeData.label }}</h3>
      <pre>{{ selectedNodeData }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import { useCytoscape, CyEvent, CyNodeData } from '@receptron/graphai_vue_cytoscape';
// Make sure to import Cytoscape and Klay types if you need them directly,
// though the composable often abstracts much of this.
// import type { Core as CytoscapeCore, ElementDefinition, LayoutOptions, Stylesheet } from 'cytoscape';

const cytoscapeContainerElement = ref<HTMLDivElement | null>(null);
const selectedNodeData = ref<CyNodeData | null>(null);

// Graph data (nodes and edges)
const graphElements = reactive<Array<any>>([ // Use ElementDefinition[] for stricter typing
  { group: 'nodes', data: { id: 'n1', label: 'Node 1' } },
  { group: 'nodes', data: { id: 'n2', label: 'Node 2' } },
  { group: 'edges', data: { id: 'e1-2', source: 'n1', target: 'n2' } }
]);

// Cytoscape configuration
const cytoscapeOptions = reactive({
  // elements are handled by the composable via a prop or direct manipulation
  style: [
    { selector: 'node', style: { 'background-color': '#60a5fa', 'label': 'data(label)', 'color': 'white', 'text-valign': 'center' } },
    { selector: 'edge', style: { 'width': 2, 'line-color': '#9ca3af', 'target-arrow-color': '#9ca3af', 'target-arrow-shape': 'triangle' } },
    { selector: 'node:selected', style: { 'background-color': '#ef4444' } }
  ],
  layout: {
    name: 'klay', // Requires cytoscape-klay to be installed and registered
    klay: {
      direction: 'RIGHT', // Example Klay option: LEFT, RIGHT, UP, DOWN
      spacing: 50
    },
    fit: true,
    padding: 20
  }
  // ... other Cytoscape core options
});

// Use the composable
const { 
  initCytoscape, 
  cyInstance,     // The Cytoscape core instance (ref)
  elements,       // Reactive ref for graph elements (nodes & edges)
  layout,         // Reactive ref for layout configuration
  style,          // Reactive ref for style configuration
  addNode, 
  addEdge, 
  removeElement,
  layoutGraph,    // Function to re-apply layout
  on,             // Function to attach event listeners
  off             // Function to detach event listeners
} = useCytoscape();


onMounted(async () => {
  if (cytoscapeContainerElement.value) {
    // Initialize Cytoscape
    // The composable might take initial elements, style, layout directly
    // or you might set them via the reactive refs it exposes.
    // The exact API of initCytoscape from the package is key here.
    // Based on memory bank, it seems to be:
    // await initCytoscape(containerElement, { elements: initialElements, style: initialStyle, layout: initialLayout });
    
    await initCytoscape(
      cytoscapeContainerElement.value,
      { // Initial options for Cytoscape core
        elements: graphElements, // Pass initial elements
        style: cytoscapeOptions.style,
        layout: cytoscapeOptions.layout,
        // wheelSensitivity: 0.2, // Example: other cytoscape options
      }
    );

    // Set up event listeners using the 'on' method from the composable
    if (cyInstance.value) {
      on('tap', 'node', (event: CyEvent) => {
        const tappedNode = event.target;
        selectedNodeData.value = tappedNode.data() as CyNodeData;
        console.log('Node tapped:', tappedNode.id(), tappedNode.data());
      });

      on('tap', (event: CyEvent) => { // Tap on background
        if (event.target === cyInstance.value) {
          selectedNodeData.value = null;
        }
      });
    }
  }
});

// Example: Dynamically add a node
function addNewNode() {
  const newNodeId = `n${Date.now()}`;
  // Use addNode from the composable
  addNode({ group: 'nodes', data: { id: newNodeId, label: `Node ${graphElements.length + 1}` } });
  // The composable should handle updating its internal elements ref and re-rendering.
}

// Example: Change layout dynamically
function changeLayoutToGrid() {
  // Update the reactive layout ref from the composable
  // layout.value = { name: 'grid', fit: true, padding: 30 };
  // Or, if layoutGraph is preferred:
  layoutGraph({ name: 'grid', fit: true, padding: 30 });
}

// Watch for external changes to graphElements prop if this were a child component
// watch(() => props.initialElements, (newElements) => {
//   if (cyInstance.value && newElements) {
//     elements.value = newElements; // Update the composable's reactive elements
//   }
// }, { deep: true });

</script>

<style scoped>
.graph-container-wrapper {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
/* Ensure the container for Cytoscape has defined dimensions */
</style>
```

### `useCytoscape` Composable API (Conceptual)

Based on typical composable patterns and the file structure (`src/composables/cytoscape.ts`), the `useCytoscape` composable likely provides:

-   **`initCytoscape(container: Ref<HTMLElement | null>, options: CytoscapeOptions): Promise<void>`**:
    Initializes the Cytoscape instance within the provided DOM element container. `options` would be standard Cytoscape.js core options.
-   **`cyInstance: Ref<CytoscapeCore | null>`**: A Vue ref holding the Cytoscape core instance once initialized.
-   **`elements: Ref<ElementDefinition[]>`**: A reactive ref to manage the graph's nodes and edges. Changes to this ref should reflect in the graph.
-   **`layout: Ref<LayoutOptions>`**: A reactive ref for the current layout configuration. Changing this should re-layout the graph.
-   **`style: Ref<Stylesheet[]>`**: A reactive ref for the graph's stylesheet.
-   **`addNode(nodeData: ElementDefinition): void`**: Helper to add a node.
-   **`addEdge(edgeData: ElementDefinition): void`**: Helper to add an edge.
-   **`removeElement(elementId: string): void`**: Helper to remove an element.
-   **`layoutGraph(layoutOptions?: LayoutOptions): void`**: Programmatically re-applies a layout. Uses the current `layout.value` if no options are passed.
-   **`on(eventName: string, selector: string | undefined, handler: (event: CyEvent) => void): void`**: Attaches an event listener to the Cytoscape instance.
-   **`off(eventName: string, selector: string | undefined, handler: (event: CyEvent) => void): void`**: Detaches an event listener.
-   **`fit(padding?: number): void`**: Fits the graph to the viewport.
-   **`center(): void`**: Centers the graph in the viewport.

*(The exact API surface should be confirmed from the package's type definitions or source code).*

## Use Cases

-   Visualizing GraphAI execution flows in real-time or for debugging.
-   Building interactive workflow editors where users can create and modify GraphAI graphs.
-   Displaying complex data relationships fetched from a backend.
-   Creating monitoring dashboards that represent system states as graphs.

## Advanced Usage

-   **Custom Node/Edge Styles**: Define complex stylesheets based on data attributes (e.g., `node[type="input"]`, `edge[weight > 50]`).
-   **Dynamic Data Updates**: Fetch graph data from an API and update the `elements` ref to reflect changes.
-   **User Interactions**: Implement drag-and-drop, node creation/deletion through UI buttons that call `addNode`, `removeElement`, etc.
-   **Context Menus**: Add custom context menus on nodes or edges for specific actions.
-   **Saving/Loading Graphs**: Convert the current graph state (`cyInstance.value.json().elements`) to JSON for saving, and load JSON back into the graph.

## Troubleshooting

-   **Graph Not Rendering**: Ensure the `ref` for the container element is correctly assigned and the element is in the DOM with non-zero dimensions when `initCytoscape` is called (usually in `onMounted`).
-   **Layout Issues**: Verify that layout extensions like `cytoscape-klay` are correctly installed and registered if you are using them. Check layout options for correctness.
-   **Reactivity Problems**: If the graph doesn't update when `elements`, `layout`, or `style` refs change, ensure these refs are the ones provided by `useCytoscape` and that mutations are Vue-reactive.

Refer to the [Cytoscape.js documentation](https://js.cytoscape.org/) for detailed information on styling, layouts, and event handling, and the [Troubleshooting Guide](../../guides/troubleshooting.md) for more general debugging.