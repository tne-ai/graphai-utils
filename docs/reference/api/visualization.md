# API Reference: Visualization Packages

This page details the conceptual API for the visualization packages:
-   `@receptron/graphai_vue_cytoscape`
-   `@receptron/graphai_react_cytoscape`

Both packages aim to provide a similar core functionality centered around a `useCytoscape` composable (for Vue) or hook (for React) to integrate Cytoscape.js.

## `useCytoscape()` (Composable/Hook)

This is the primary export for interacting with Cytoscape.

**Returns**: An object containing reactive state and methods to manage a Cytoscape instance.

```typescript
import { Ref } from 'vue'; // For Vue
// import { MutableRefObject, Dispatch, SetStateAction } from 'react'; // For React
import type { 
    Core as CytoscapeCore, 
    ElementDefinition, 
    LayoutOptions, 
    Stylesheet,
    EventObject as CyEventObject // Cytoscape's EventObject
} from 'cytoscape';

// Define a generic event type if the packages don't export one
// For Vue, CyEvent might be a specific type from the package
// For React, EventObject from 'cytoscape' is often used directly

interface UseCytoscapeReturn {
  // Core Cytoscape Instance
  // Vue: cyInstance: Ref<CytoscapeCore | null>;
  // React: cyInstance: CytoscapeCore | null; (or a ref: MutableRefObject<CytoscapeCore | null>)
  cyInstance: any; // Use specific type based on Vue/React version of package

  // Initialization
  initCytoscape: (
    container: HTMLElement, // DOM element to mount Cytoscape
    options: { // Initial Cytoscape options
      elements?: ElementDefinition[];
      style?: Stylesheet[];
      layout?: LayoutOptions;
      [key: string]: any; // Allow other Cytoscape core options
    }
  ) => Promise<void>; // Vue version might be async due to onMounted

  // Reactive State (Conceptual - API might vary slightly between Vue/React versions)
  // These might be directly manipulated or updated via methods.
  // Vue: elements: Ref<ElementDefinition[]>;
  // Vue: layoutConfig: Ref<LayoutOptions>;
  // Vue: styleRules: Ref<Stylesheet[]>;
  // React: Might return [elements, setElements] = useState(), etc., or expect props.

  // Graph Manipulation Methods
  addNode: (node: ElementDefinition) => void;
  addEdge: (edge: ElementDefinition) => void;
  removeElement: (elementId: string | cytoscape.CollectionArgument) => void;
  updateElementData: (elementId: string, data: Record<string, any>) => void;
  setElements: (elements: ElementDefinition[]) => void; // Replace all elements

  // Layout Methods
  layoutGraph: (layoutOptions?: LayoutOptions) => void; // Re-runs the layout

  // Style Methods
  setStyle: (stylesheet: Stylesheet[]) => void; // Replace entire stylesheet
  updateStyle: (selector: string, style: cytoscape.Css.Node | cytoscape.Css.Edge) => void;

  // Viewport Methods
  fit: (padding?: number) => void;
  center: (elements?: cytoscape.CollectionArgument) => void;
  zoom: (level?: number) => number | void;

  // Event Handling
  on: (
    eventName: cytoscape. ОбычноEventName | cytoscape.CollectionEventName | string, // e.g., 'tap', 'select'
    selector: string | undefined, // e.g., 'node', 'edge.myClass' or undefined for core events
    handler: (event: CyEventObject) => void
  ) => void;
  off: (
    eventName: cytoscape.UsuallyEventName | cytoscape.CollectionEventName | string,
    selector: string | undefined,
    handler: (event: CyEventObject) => void
  ) => void;
  
  // Utility / Cleanup (Conceptual)
  // destroy?: () => void; // To properly destroy the Cytoscape instance
}
```

### Key Return Properties & Methods:

-   **`cyInstance`**:
    -   The core Cytoscape.js instance. This allows direct access to the full Cytoscape API if needed.
    -   In Vue, this is typically a `Ref<CytoscapeCore | null>`.
    -   In React, this might be the instance itself or a `MutableRefObject<CytoscapeCore | null>`.

-   **`initCytoscape(container, options)`**:
    -   `container`: The HTML DOM element where Cytoscape should be rendered.
    -   `options`: An object containing initial Cytoscape configuration:
        -   `elements`: An array of `ElementDefinition` (nodes and edges).
            -   Node: `{ group: 'nodes', data: { id: 'n1', label: 'Node 1', ... }, classes: 'myClass' }`
            -   Edge: `{ group: 'edges', data: { id: 'e1', source: 'n1', target: 'n2', ... } }`
        -   `style`: An array of `Stylesheet` objects defining the appearance of graph elements.
            ```typescript
            // const stylesheet = [
            //   { selector: 'node', style: { 'background-color': 'blue', 'label': 'data(label)' } },
            //   { selector: 'edge.highlighted', style: { 'line-color': 'red' } }
            // ];
            ```
        -   `layout`: A `LayoutOptions` object defining the initial layout algorithm and its parameters.
            ```typescript
            // const layoutOptions = { 
            //   name: 'klay', 
            //   klay: { direction: 'DOWN', spacing: 50 },
            //   fit: true, // Whether to fit the graph to the viewport after layout
            //   padding: 20 
            // };
            ```
        -   Other standard Cytoscape core options (e.g., `minZoom`, `maxZoom`, `wheelSensitivity`).

-   **Reactive State Management (Conceptual - specific API may differ)**:
    -   The Vue composable likely exposes `Ref`s for `elements`, `layoutConfig`, and `styleRules` that, when modified, automatically update the graph.
    -   The React hook might expect these as props and re-render/update Cytoscape on prop changes, or provide state setters (`setElements`, `setLayoutConfig`, etc.).

-   **Graph Manipulation Methods**:
    -   `addNode(node)`: Adds a single node.
    -   `addEdge(edge)`: Adds a single edge.
    -   `removeElement(elementId | cytoscape.CollectionArgument)`: Removes element(s) by ID or a Cytoscape collection.
    -   `updateElementData(elementId, data)`: Updates the `data` of an existing element.
    -   `setElements(elements)`: Clears existing elements and adds the new set.

-   **Layout Methods**:
    -   `layoutGraph(layoutOptions?)`: Re-runs a layout. If `layoutOptions` is not provided, it might use the current layout configuration associated with the hook/composable.

-   **Style Methods**:
    -   `setStyle(stylesheet)`: Replaces the entire stylesheet of the graph.
    -   `updateStyle(selector, style)`: Updates the style for elements matching the selector.

-   **Viewport Methods**:
    -   `fit(padding?)`: Fits all elements into the viewport.
    -   `center(elements?)`: Centers the specified elements or the entire graph.
    -   `zoom(level?)`: Sets or gets the current zoom level.

-   **Event Handling**:
    -   `on(eventName, selector?, handler)`: Attaches an event listener to Cytoscape events (e.g., `tap`, `select`, `drag`).
        -   `eventName`: Standard Cytoscape event names.
        -   `selector`: Optional Cytoscape selector (e.g., `'node'`, `'edge[weight > 50]'`) to target specific elements. If `undefined`, applies to core events.
        -   `handler`: Callback function `(event: CyEventObject) => void`.
    -   `off(...)`: Detaches event listeners. It's crucial to call this during component unmount (e.g., in `onUnmounted` for Vue, `useEffect` cleanup for React) to prevent memory leaks.

## Type Definitions (Conceptual)

The packages should export relevant types for better development experience.

-   `CyElementDefinition`: Alias for `cytoscape.ElementDefinition`.
-   `CyLayoutOptions`: Alias for `cytoscape.LayoutOptions`.
-   `CyStylesheet`: Alias for `cytoscape.Stylesheet`.
-   `CyNodeData`, `CyEdgeData`: Specific interfaces for the `data` property of nodes and edges if your application has a common structure.
-   `CyEvent`: Type for Cytoscape event objects passed to handlers.

## Common Usage Pattern

**Vue 3 (`setup` script):**
```vue
// <template><div ref="cyRef"></div></template>
// <script setup lang="ts">
// import { ref, onMounted } from 'vue';
// import { useCytoscape } from '@receptron/graphai_vue_cytoscape';

// const cyRef = ref<HTMLDivElement | null>(null);
// const { initCytoscape, addNode, on, cyInstance } = useCytoscape();

// onMounted(async () => {
//   if (cyRef.value) {
//     await initCytoscape(cyRef.value, { /* initial options */ });
//     on('tap', 'node', (evt) => console.log('Node tapped:', evt.target.id()));
//   }
// });
// </script>
```

**React (Functional Component):**
```tsx
// import React, { useRef, useEffect } from 'react';
// import { useCytoscape } from '@receptron/graphai_react_cytoscape';

// const MyGraphView: React.FC = () => {
//   const cyRef = useRef<HTMLDivElement>(null);
//   const { initCytoscape, addNode, on, cyInstance } = useCytoscape();

//   useEffect(() => {
//     if (cyRef.current) {
//       initCytoscape(cyRef.current, { /* initial options */ });
//     }
//   }, [initCytoscape]); // initCytoscape should be stable

//   useEffect(() => {
//     if (cyInstance) {
//       const tapHandler = (evt) => console.log('Node tapped:', evt.target.id());
//       on('tap', 'node', tapHandler);
//       return () => off('tap', 'node', tapHandler); // Cleanup
//     }
//   }, [cyInstance, on, off]);

//   return <div ref={cyRef} style={{ width: '100%', height: '500px' }} />;
// };
```

This API reference is conceptual based on common patterns for such utilities. Always refer to the specific package's exported types and any accompanying documentation for the most accurate details. The [Vue Dashboard Example](../../examples/vue-dashboard.md) and [React Visualizer Example](../../examples/react-visualizer.md) provide practical implementations.