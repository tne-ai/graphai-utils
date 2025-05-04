# Package: @receptron/graphai_react_cytoscape

**Version**: `0.0.5` (Early Development)

## Overview

`@receptron/graphai_react_cytoscape` provides React hooks and potentially components to integrate Cytoscape.js for interactive graph visualization within React applications. It aims to simplify the rendering and management of GraphAI workflows or other graph data structures in a React-centric way.

This package is suitable for developers building UIs in React that require displaying, editing, or interacting with graphs, such as workflow editors, data relationship visualizers, or monitoring dashboards. It supports ES Module format.

## Key Features

-   **React Hooks**: Likely provides a custom hook (e.g., `useCytoscape`) for managing the Cytoscape instance and its lifecycle within functional React components.
-   **Cytoscape.js Integration**: Leverages Cytoscape.js for powerful graph rendering and manipulation.
-   **Layout Support**: Supports various Cytoscape.js layouts, including `cytoscape-klay` for hierarchical arrangements.
-   **Component-Based**: Fits naturally into React's component model.
-   **Event Handling**: Allows attaching event listeners to the Cytoscape instance for user interactions.
-   **TypeScript Support**: Includes type definitions for enhanced development experience.

## Installation

```bash
npm install @receptron/graphai_react_cytoscape cytoscape cytoscape-klay react@^18 react-dom@^18
# For TypeScript projects, also install types:
npm install -D @types/cytoscape @types/cytoscape-klay @types/react @types/react-dom
# or
yarn add @receptron/graphai_react_cytoscape cytoscape cytoscape-klay react@^18 react-dom@^18
# For TypeScript projects:
yarn add -D @types/cytoscape @types/cytoscape-klay @types/react @types/react-dom
```
-   `cytoscape`: Core Cytoscape.js library (peer dependency).
-   `cytoscape-klay`: Klay layout algorithm (peer dependency, optional if not using Klay).
-   `react`, `react-dom`: React libraries (peer dependencies).

The main export is `lib/cytoscape.js` and types are in `lib/cytoscape.d.ts`.

## Core API & Usage

The primary usage pattern involves a custom React hook, likely named `useCytoscape`.

```tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCytoscape } from '@receptron/graphai_react_cytoscape';
import type { Core as CytoscapeCore, ElementDefinition, LayoutOptions, Stylesheet, EventObject } from 'cytoscape';
// Ensure klay layout is registered if used
import cytoscape from 'cytoscape';
import klay from 'cytoscape-klay';
cytoscape.use(klay);


interface NodeData { // Define a type for your node data if needed
  id: string;
  label: string;
  type?: string;
}

const MyGraphComponent: React.FC = () => {
  const cytoscapeContainerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  const initialElements: ElementDefinition[] = [
    { group: 'nodes', data: { id: 'n1', label: 'Node A' } },
    { group: 'nodes', data: { id: 'n2', label: 'Node B' } },
    { group: 'edges', data: { id: 'e1-2', source: 'n1', target: 'n2' } }
  ];

  const [graphElements, setGraphElements] = useState<ElementDefinition[]>(initialElements);

  const cytoscapeOptions = {
    style: [
      { selector: 'node', style: { backgroundColor: '#3182ce', label: 'data(label)', color: 'white', textValign: 'center' } },
      { selector: 'edge', style: { width: 2, lineColor: '#718096', targetArrowColor: '#718096', targetArrowShape: 'triangle' } },
      { selector: 'node:selected', style: { backgroundColor: '#e53e3e' } }
    ] as Stylesheet[],
    layout: {
      name: 'klay',
      klay: { direction: 'DOWN', spacing: 50 },
      fit: true,
      padding: 20
    } as LayoutOptions,
  };

  // Use the custom hook
  const { 
    initCytoscape, 
    cyInstance,     // The Cytoscape core instance
    elements,       // Internal elements state from the hook (if provided)
    layout,         // Internal layout state from the hook (if provided)
    style,          // Internal style state from the hook (if provided)
    addNode, 
    addEdge, 
    removeElement,
    layoutGraph,    // Function to re-apply layout
    on,             // Function to attach event listeners
    off             // Function to detach event listeners
  } = useCytoscape(); // The exact API of the hook needs to be confirmed from package


  useEffect(() => {
    if (cytoscapeContainerRef.current) {
      // Initialize Cytoscape
      // The hook might manage elements internally, or expect them to be passed and updated.
      // Assuming initCytoscape takes the container and initial options:
      initCytoscape(cytoscapeContainerRef.current, {
        elements: graphElements, // Pass current elements
        style: cytoscapeOptions.style,
        layout: cytoscapeOptions.layout,
        // wheelSensitivity: 0.3, // Other Cytoscape core options
      });
    }
  }, [initCytoscape]); // initCytoscape should be stable from the hook

  // Effect for handling event listeners
  useEffect(() => {
    if (cyInstance) {
      const handleNodeTap = (event: EventObject) => {
        const tappedNode = event.target;
        setSelectedNode(tappedNode.data() as NodeData);
        console.log('React: Node tapped:', tappedNode.id(), tappedNode.data());
      };

      const handleBgTap = (event: EventObject) => {
        if (event.target === cyInstance) {
          setSelectedNode(null);
        }
      };
      
      on('tap', 'node', handleNodeTap);
      on('tap', handleBgTap); // Tap on background

      return () => { // Cleanup listeners
        off('tap', 'node', handleNodeTap);
        off('tap', handleBgTap);
      };
    }
  }, [cyInstance, on, off]);

  // Effect for updating graph when external elements change
   useEffect(() => {
    if (cyInstance) {
      cyInstance.elements().remove(); // Clear existing
      cyInstance.add(graphElements);  // Add new/updated
      if (graphElements.length > 0) {
        layoutGraph(cytoscapeOptions.layout); // Re-apply layout
      }
    }
  }, [graphElements, cyInstance, layoutGraph, cytoscapeOptions.layout]);


  const handleAddNode = useCallback(() => {
    const newNodeId = `n${Date.now()}`;
    const newNode: ElementDefinition = { 
      group: 'nodes', 
      data: { id: newNodeId, label: `Node ${graphElements.filter(e=>e.group === 'nodes').length + 1}` } 
    };
    // If the hook manages elements internally:
    // addNode(newNode); 
    // If managing elements externally via useState:
    setGraphElements(prev => [...prev, newNode]);
  }, [graphElements]); // addNode if it's stable

  return (
    <div className="graph-component-wrapper">
      <button onClick={handleAddNode}>Add Node</button>
      <div ref={cytoscapeContainerRef} style={{ width: '100%', height: '500px', border: '1px solid #e2e8f0' }} />
      {selectedNode && (
        <div className="selected-node-info">
          <h3>Selected: {selectedNode.label}</h3>
          <pre>{JSON.stringify(selectedNode, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default MyGraphComponent;
```

### `useCytoscape` Hook API (Conceptual)

The `useCytoscape` hook is expected to provide functionalities similar to its Vue counterpart:

-   **`initCytoscape(container: HTMLElement, options: CytoscapeOptions): void`**:
    Initializes the Cytoscape instance.
-   **`cyInstance: CytoscapeCore | null`**: The Cytoscape core instance.
-   **`elements` / `setElements`**: Could provide internal state management for elements or expect external management (as in the example above with `useState`).
-   **`layout` / `setLayout`**: Similar for layout configuration.
-   **`style` / `setStyle`**: Similar for style configuration.
-   **`addNode(nodeData: ElementDefinition): void`**: Helper to add a node.
-   **`addEdge(edgeData: ElementDefinition): void`**: Helper to add an edge.
-   **`removeElement(elementId: string): void`**: Helper to remove an element.
-   **`layoutGraph(layoutOptions?: LayoutOptions): void`**: Programmatically re-applies a layout.
-   **`on(eventName: string, selector: string | undefined, handler: (event: EventObject) => void): void`**: Attaches an event listener.
-   **`off(eventName: string, selector: string | undefined, handler: (event: EventObject) => void): void`**: Detaches an event listener.
-   **`fit(padding?: number): void`**: Fits the graph to the viewport.
-   **`center(): void`**: Centers the graph.

*(The exact API surface should be verified from the package's type definitions or source code).*

## Use Cases

-   Visualizing complex GraphAI workflows in React-based admin panels or dashboards.
-   Building interactive graph editors for creating or modifying GraphAI configurations.
-   Displaying data relationships and dependencies in data-intensive React applications.
-   Creating real-time monitoring UIs where graph elements change based on system events.

## Advanced Usage

-   **State Management Integration**: Integrate with React state management libraries like Redux, Zustand, or Jotai to manage graph data and interactions globally.
-   **Performance Optimization**:
    -   Use `React.memo` for the graph component.
    -   Memoize callbacks and props using `useCallback` and `useMemo`.
    -   For very large graphs, consider techniques like windowing or server-side rendering of static parts if applicable.
-   **Custom Components as Nodes**: While Cytoscape primarily renders on a canvas, advanced integrations might involve overlaying React components for complex node representations (can be challenging).
-   **Server-Side Rendering (SSR)**: Basic SSR of the graph container might be possible, but Cytoscape itself is a client-side library. Full SSR of the graph image would require a server-side canvas solution.

## Troubleshooting

-   **"cytoscape.use is not a function" / Layout not found**: Ensure `cytoscape.use(klay);` (or other layout extensions) is called globally before Cytoscape is initialized if the package doesn't handle registration internally.
-   **Graph Not Rendering**: Check that `cytoscapeContainerRef.current` is a valid DOM element with dimensions when `initCytoscape` is called. Ensure `elements` array is correctly formatted.
-   **Multiple Cytoscape Instances**: Be careful with component re-renders and `useEffect` dependencies to avoid creating multiple Cytoscape instances on the same DOM element. The hook should manage the instance's lifecycle.

Refer to the [Cytoscape.js documentation](https://js.cytoscape.org/) for comprehensive details on its capabilities and the [Troubleshooting Guide](../../guides/troubleshooting.md) for general debugging.