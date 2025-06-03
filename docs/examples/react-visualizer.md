# Example: React Flow Visualizer

This example demonstrates building an interactive graph visualization and workflow editor using React and the `@receptron/graphai_react_cytoscape` package.

## Features Demonstrated

-   **`@receptron/graphai_react_cytoscape`**: Using the React hook for Cytoscape integration.
-   **React (Hooks & TypeScript)**: Building functional components.
-   **Dynamic Graph Rendering**: Displaying and updating graph data.
-   **Interactivity**: Adding/removing nodes and edges, selecting elements.
-   **Layout Management**: Applying different Cytoscape layouts.
-   **Node Detail Display**: Showing information about the currently selected node.

## Prerequisites

-   Node.js 16+
-   npm or yarn
-   Basic understanding of React and TypeScript.

## Code

### 1. Project Setup

```bash
# Create a new React project with TypeScript
npx create-react-app graphai-react-visualizer --template typescript
cd graphai-react-visualizer

# Install dependencies
npm install @receptron/graphai_react_cytoscape cytoscape cytoscape-klay
npm install @types/cytoscape @types/cytoscape-klay --save-dev 
# (cytoscape-klay types might be bundled or need separate install)
```

### 2. Graph Display Component (`src/components/GraphDisplay.tsx`)

A reusable component for rendering the Cytoscape graph.

```tsx
import React, { useRef, useEffect, memo } from 'react';
import { useCytoscape } from '@receptron/graphai_react_cytoscape';
import cytoscape, { ElementDefinition, LayoutOptions, Stylesheet, Core } from 'cytoscape';
import klay from 'cytoscape-klay';

cytoscape.use(klay); // Register Klay layout

export interface NodeData {
  id: string;
  label: string;
  type?: string;
  params?: Record<string, any>;
}

interface GraphDisplayProps {
  elements: ElementDefinition[];
  layoutConfig?: LayoutOptions;
  styleDefinition?: Stylesheet[];
  onNodeTap?: (nodeData: NodeData | null) => void;
  onGraphReady?: (cyInstance: Core) => void;
  containerStyle?: React.CSSProperties;
}

const defaultGraphStyles: Stylesheet[] = [
  { selector: 'node', style: { backgroundColor: '#2563eb', label: 'data(label)', color: 'white', textValign: 'center', fontSize: '10px', width: '100px', height: '50px', shape: 'round-rectangle', borderWidth: 1.5, borderColor: '#1d4ed8' } },
  { selector: 'edge', style: { width: 2, lineColor: '#475569', targetArrowColor: '#475569', targetArrowShape: 'triangle', curveStyle: 'bezier' } },
  { selector: 'node:selected', style: { backgroundColor: '#e11d48', borderColor: '#be123c' } },
];

const GraphDisplay: React.FC<GraphDisplayProps> = ({
  elements,
  layoutConfig = { name: 'klay', klay: { direction: 'DOWN', spacing: 60 }, fit: true, padding: 20 } as LayoutOptions,
  styleDefinition = defaultGraphStyles,
  onNodeTap,
  onGraphReady,
  containerStyle = { width: '100%', height: '650px' }
}) => {
  const cytoscapeContainerRef = useRef<HTMLDivElement>(null);
  const { initCytoscape, cyInstance, layoutGraph, on, off } = useCytoscape();

  useEffect(() => {
    if (cytoscapeContainerRef.current) {
      initCytoscape(cytoscapeContainerRef.current, {
        elements: elements,
        style: styleDefinition,
        layout: layoutConfig,
      });
    }
  }, [initCytoscape]); // Initialize only once

  useEffect(() => {
    if (cyInstance) {
      // Update elements
      cyInstance.elements().remove();
      cyInstance.add(elements);
      layoutGraph(layoutConfig);

      // Setup event listeners
      const handleNodeTap = (event: cytoscape.EventObject) => {
        onNodeTap?.(event.target.data() as NodeData);
      };
      const handleBgTap = (event: cytoscape.EventObject) => {
        if (event.target === cyInstance) onNodeTap?.(null);
      };

      on('tap', 'node', handleNodeTap);
      on('tap', handleBgTap);
      
      onGraphReady?.(cyInstance);

      // Cleanup listeners on component unmount or if cyInstance changes
      return () => {
        off('tap', 'node', handleNodeTap);
        off('tap', handleBgTap);
      };
    }
  }, [elements, layoutConfig, cyInstance, on, off, onNodeTap, onGraphReady, layoutGraph]);


  return (
    <div style={{ ...containerStyle, border: '1px solid #d1d5db', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
      <div ref={cytoscapeContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default memo(GraphDisplay); // Memoize for performance
```

### 3. Main Application (`src/App.tsx`)

```tsx
import React, { useState, useCallback, useEffect } from 'react';
import GraphDisplay, { NodeData } from './components/GraphDisplay';
import { ElementDefinition, LayoutOptions } from 'cytoscape';
import './App.css'; // We'll create this for styling

const App: React.FC = () => {
  const [graphElements, setGraphElements] = useState<ElementDefinition[]>([]);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<NodeData | null>(null);
  const [nodeIdCounter, setNodeIdCounter] = useState(0);
  const [selectedLayoutName, setSelectedLayoutName] = useState<string>('klay');

  const currentLayoutConfig = React.useMemo((): LayoutOptions => {
    const baseConfig = { fit: true, padding: 30 };
    switch (selectedLayoutName) {
      case 'klay':
        return { ...baseConfig, name: 'klay', klay: { direction: 'TB', spacing: 75, nodePlacement: 'BRANDES_KOEPF' }, animate: true, animationDuration: 500 };
      case 'cose':
        return { ...baseConfig, name: 'cose', idealEdgeLength: 120, nodeOverlap: 25, animate: true, animationDuration: 500 };
      case 'grid':
        return { ...baseConfig, name: 'grid', animate: true, animationDuration: 500 };
      case 'circle':
        return { ...baseConfig, name: 'circle', animate: true, animationDuration: 500 };
      default:
        return { ...baseConfig, name: 'klay', klay: { direction: 'TB', spacing: 75 } };
    }
  }, [selectedLayoutName]);

  const handleAddNode = useCallback(() => {
    setNodeIdCounter(prev => {
      const newId = prev + 1;
      const newNode: ElementDefinition = {
        group: 'nodes',
        data: { id: `n${newId}`, label: `Node ${newId}`, type: newId % 2 === 0 ? 'action' : 'trigger' }
      };
      setGraphElements(prevElements => [...prevElements, newNode]);
      return newId;
    });
  }, []);

  const handleAddEdge = useCallback(() => {
    const nodes = graphElements.filter(el => el.group === 'nodes');
    if (nodes.length >= 2) {
      const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
      let targetNode = nodes[Math.floor(Math.random() * nodes.length)];
      while (targetNode.data.id === sourceNode.data.id && nodes.length > 1) {
        targetNode = nodes[Math.floor(Math.random() * nodes.length)];
      }
      if (sourceNode.data.id !== targetNode.data.id) {
        const newEdge: ElementDefinition = {
          group: 'edges',
          data: { id: `e${sourceNode.data.id}-${targetNode.data.id}`, source: sourceNode.data.id, target: targetNode.data.id }
        };
        setGraphElements(prevElements => [...prevElements, newEdge]);
      }
    }
  }, [graphElements]);

  const handleNodeTap = useCallback((nodeData: NodeData | null) => {
    setSelectedNodeInfo(nodeData);
  }, []);

  const loadSampleWorkflow = useCallback(() => {
    setNodeIdCounter(3);
    setGraphElements([
      { group: 'nodes', data: { id: 'n1', label: 'Webhook Trigger', type: 'trigger', params: { url: '/event' } } },
      { group: 'nodes', data: { id: 'n2', label: 'Data Transform', type: 'action', params: { script: 'return data.value * 2;' } } },
      { group: 'nodes', data: { id: 'n3', label: 'Send Notification', type: 'action', params: { service: 'slack' } } },
      { group: 'edges', data: { id: 'e1-2', source: 'n1', target: 'n2' } },
      { group: 'edges', data: { id: 'e2-3', source: 'n2', target: 'n3' } }
    ]);
    setSelectedNodeInfo(null);
  }, []);

  const clearGraph = useCallback(() => {
    setGraphElements([]);
    setSelectedNodeInfo(null);
    setNodeIdCounter(0);
  }, []);

  useEffect(() => {
    loadSampleWorkflow();
  }, [loadSampleWorkflow]);

  return (
    <div className="react-visualizer-app">
      <header className="app-header-react">
        <h1>GraphAI React Visualizer Example</h1>
      </header>
      <div className="dashboard-main-react">
        <aside className="sidebar-react controls-sidebar-react">
          <h2>Controls</h2>
          <button onClick={handleAddNode}>Add Node</button>
          <button onClick={handleAddEdge} disabled={graphElements.filter(el => el.group === 'nodes').length < 2}>Add Edge</button>
          <hr />
          <label htmlFor="layout-selector">Layout:</label>
          <select id="layout-selector" value={selectedLayoutName} onChange={e => setSelectedLayoutName(e.target.value)}>
            <option value="klay">Klay</option>
            <option value="cose">CoSE</option>
            <option value="grid">Grid</option>
            <option value="circle">Circle</option>
          </select>
          <hr />
          <button onClick={loadSampleWorkflow}>Load Sample</button>
          <button onClick={clearGraph}>Clear Graph</button>
        </aside>
        <main className="graph-area-react">
          <GraphDisplay
            elements={graphElements}
            layoutConfig={currentLayoutConfig}
            onNodeTap={handleNodeTap}
          />
        </main>
        <aside className="sidebar-react info-sidebar-react">
          <h2>Selected Node</h2>
          {selectedNodeInfo ? (
            <div className="node-info-react">
              <p><strong>ID:</strong> {selectedNodeInfo.id}</p>
              <p><strong>Label:</strong> {selectedNodeInfo.label}</p>
              {selectedNodeInfo.type && <p><strong>Type:</strong> {selectedNodeInfo.type}</p>}
              {selectedNodeInfo.params && (
                <>
                  <strong>Params:</strong>
                  <pre>{JSON.stringify(selectedNodeInfo.params, null, 2)}</pre>
                </>
              )}
            </div>
          ) : (
            <p>Click on a node to view its details.</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default App;
```

### 4. Styling (`src/App.css`)

```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #eef2f7; /* Light blue-gray background */
  color: #334155; /* Slate gray text */
}

.react-visualizer-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header-react {
  background-color: #0f172a; /* Very dark blue/slate */
  color: white;
  padding: 1rem 1.5rem;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}
.app-header-react h1 { margin: 0; font-size: 1.6rem; }

.dashboard-main-react {
  display: grid;
  grid-template-columns: 260px 1fr 300px; /* Sidebar | Main Graph | Info Sidebar */
  gap: 1.25rem;
  padding: 1.25rem;
  flex-grow: 1;
  overflow: hidden;
}

.sidebar-react {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
}

.sidebar-react h2 {
  margin-top: 0;
  font-size: 1.3rem;
  color: #1e293b; /* Darker slate */
  border-bottom: 1px solid #e2e8f0; /* Lighter gray border */
  padding-bottom: 0.8rem;
  margin-bottom: 1.25rem;
}

.controls-sidebar-react button,
.controls-sidebar-react select {
  display: block;
  width: 100%;
  padding: 0.7rem 0.9rem;
  margin-bottom: 0.85rem;
  border: 1px solid #cbd5e1; /* Cool gray border */
  border-radius: 0.375rem;
  background-color: #fff;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.controls-sidebar-react select {
  cursor: pointer;
}
.controls-sidebar-react button {
  background-color: #2563eb; /* Primary blue */
  color: white;
  cursor: pointer;
  font-weight: 500;
}
.controls-sidebar-react button:hover:not(:disabled) {
  background-color: #1d4ed8; /* Darker primary blue */
}
.controls-sidebar-react button:disabled {
  background-color: #94a3b8; /* Muted slate */
  cursor: not-allowed;
}
.controls-sidebar-react hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1.25rem 0;
}
.controls-sidebar-react label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: #475569; /* Medium slate */
  font-weight: 500;
}

.graph-area-react {
  min-height: 0; /* Critical for child to take proper height in grid/flex */
}

.node-info-react p {
  margin: 0.6rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}
.node-info-react strong {
  color: #334155; /* Dark slate */
}
.node-info-react pre {
  background-color: #f1f5f9; /* Lightest slate */
  padding: 0.8rem;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  margin-top: 0.6rem;
  color: #0f172a;
}
```

### 5. Running the Visualizer

```bash
npm start
```
Open `http://localhost:3000` in your browser. You should see the React-based dashboard.

## Key Concepts

-   **`useCytoscape` Hook**: Provides `initCytoscape`, `cyInstance`, `layoutGraph`, `on`, and `off` for managing the Cytoscape instance within a React functional component.
-   **State Management**: React's `useState` and `useCallback` are used for managing graph elements, selected node information, and actions.
-   **`useEffect` Hook**: Used for initializing the graph, updating elements, and managing event listeners' lifecycle.
-   **Component-Based Structure**: The `GraphDisplay` component encapsulates the Cytoscape rendering logic, making `App.tsx` cleaner.
-   **TypeScript**: Provides type safety for props, state, and Cytoscape elements.

## Customization and Further Steps

-   **API Integration**: Fetch workflow data from a GraphAI backend and update `graphElements`.
-   **Save Functionality**: Send changes made in the visualizer back to an API to save the workflow.
-   **Advanced Node Styling**: Customize node appearances based on `data.type` or other properties using more detailed Cytoscape stylesheets.
-   **Edge Handling**: Implement adding edges between specific nodes, or editing edge properties.
-   **Context Menus**: Add right-click menus on nodes/edges for operations like "Edit", "Delete".
-   **Error Boundaries**: Wrap components in React Error Boundaries for better error handling.

This React example provides a robust starting point for building sophisticated workflow visualization and editing tools for GraphAI.