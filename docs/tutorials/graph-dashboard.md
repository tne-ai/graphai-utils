# Build an Interactive Graph Dashboard

Create a dynamic dashboard for visualizing and interacting with GraphAI workflows using Vue.js or React, powered by `@receptron/graphai_vue_cytoscape` or `@receptron/graphai_react_cytoscape`.

## 🎯 What You'll Build

- **Real-time graph visualization** of AI workflows
- **Interactive controls** to add nodes, edges, and modify layouts
- **Node inspection panel** to view details of selected elements
- **Integration with a backend** to load and save graph structures
- **Custom styling** for nodes and edges based on type or status

## 📋 Prerequisites

- **Node.js 16+** installed
- Basic knowledge of **Vue.js (Composition API)** or **React (Hooks)**
- Familiarity with **GraphAI concepts** (nodes, agents, workflows)
- A running **GraphAI server** (optional, can use mock data) - see [Chat Server Tutorial](chat-server.md)

⏱️ **Estimated time**: 45-60 minutes

## 🛠️ Step 1: Project Setup

Choose your framework and set up the project.

=== "Vue.js"

    ```bash
    # Create a new Vue project
    npm create vue@latest graphai-vue-dashboard
    cd graphai-vue-dashboard
    
    # Install dependencies
    npm install @receptron/graphai_vue_cytoscape cytoscape cytoscape-klay
    ```
    
    Select "No" for TypeScript, JSX, Vue Router, Pinia, Vitest, E2E Testing, ESLint, Prettier for a minimal setup, or configure as needed.

=== "React"

    ```bash
    # Create a new React project
    npx create-react-app graphai-react-dashboard --template typescript
    cd graphai-react-dashboard
    
    # Install dependencies
    npm install @receptron/graphai_react_cytoscape cytoscape cytoscape-klay
    npm install @types/cytoscape @types/cytoscape-klay --save-dev
    ```

## 🛠️ Step 2: Basic Graph Component

Create a reusable component for graph visualization.

=== "Vue.js (`src/components/GraphDisplay.vue`)"

    ```vue
    <template>
      <div class="graph-display">
        <div ref="cytoscapeContainer" class="cytoscape-instance"></div>
      </div>
    </template>
    
    <script setup>
    import { ref, onMounted, watch, defineProps, toRefs } from 'vue';
    import { useCytoscape } from '@receptron/graphai_vue_cytoscape';
    
    const props = defineProps({
      elements: {
        type: Array,
        default: () => []
      },
      layoutName: {
        type: String,
        default: 'klay'
      },
      styleOptions: {
        type: Array,
        default: () => defaultStyles
      }
    });
    
    const { elements, layoutName, styleOptions } = toRefs(props);
    
    const cytoscapeContainer = ref(null);
    const { initCytoscape, cyInstance, layoutGraph } = useCytoscape();
    
    const defaultStyles = [
      {
        selector: 'node',
        style: {
          'background-color': '#3b82f6',
          'label': 'data(label)',
          'text-valign': 'center',
          'color': 'white',
          'font-size': '10px',
          'width': '80px',
          'height': '40px',
          'shape': 'round-rectangle'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#94a3b8',
          'target-arrow-color': '#94a3b8',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      }
    ];
    
    onMounted(async () => {
      if (cytoscapeContainer.value) {
        await initCytoscape(cytoscapeContainer.value, {
          elements: elements.value,
          style: styleOptions.value,
          layout: {
            name: layoutName.value,
            ...(layoutName.value === 'klay' && { klay: { direction: 'RIGHT', spacing: 50 }})
          }
        });
      }
    });
    
    watch(elements, (newElements) => {
      if (cyInstance.value) {
        cyInstance.value.elements().remove();
        cyInstance.value.add(newElements);
        layoutGraph({ name: layoutName.value, ...(layoutName.value === 'klay' && { klay: { direction: 'RIGHT', spacing: 50 }}) });
      }
    }, { deep: true });
    
    // Expose methods if needed
    // defineExpose({ cy: cyInstance, relayout: layoutGraph });
    </script>
    
    <style scoped>
    .graph-display {
      width: 100%;
      height: 500px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .cytoscape-instance {
      width: 100%;
      height: 100%;
    }
    </style>
    ```

=== "React (`src/components/GraphDisplay.tsx`)"

    ```tsx
    import React, { useRef, useEffect } from 'react';
    import { useCytoscape } from '@receptron/graphai_react_cytoscape';
    import cytoscape, { ElementDefinition, LayoutOptions, Stylesheet } from 'cytoscape';
    import klay from 'cytoscape-klay';
    
    cytoscape.use(klay);
    
    interface GraphDisplayProps {
      elements: ElementDefinition[];
      layoutName?: string;
      styleOptions?: Stylesheet[];
    }
    
    const defaultStyles: Stylesheet[] = [
      {
        selector: 'node',
        style: {
          backgroundColor: '#3b82f6',
          label: 'data(label)',
          textValign: 'center',
          color: 'white',
          fontSize: '10px',
          width: '80px',
          height: '40px',
          shape: 'round-rectangle'
        }
      },
      {
        selector: 'edge',
        style: {
          width: 2,
          lineColor: '#94a3b8',
          targetArrowColor: '#94a3b8',
          targetArrowShape: 'triangle',
          curveStyle: 'bezier'
        }
      }
    ];
    
    const GraphDisplay: React.FC<GraphDisplayProps> = ({
      elements,
      layoutName = 'klay',
      styleOptions = defaultStyles
    }) => {
      const cytoscapeContainer = useRef<HTMLDivElement>(null);
      const { initCytoscape, cyInstance, layoutGraph } = useCytoscape();
    
      useEffect(() => {
        if (cytoscapeContainer.current) {
          initCytoscape(cytoscapeContainer.current, {
            elements: elements,
            style: styleOptions,
            layout: {
              name: layoutName,
              ...(layoutName === 'klay' && { klay: { direction: 'RIGHT', spacing: 50 }})
            } as LayoutOptions
          });
        }
      }, []); // Initialize only once
    
      useEffect(() => {
        if (cyInstance) {
          cyInstance.elements().remove();
          cyInstance.add(elements);
          layoutGraph({ name: layoutName, ...(layoutName === 'klay' && { klay: { direction: 'RIGHT', spacing: 50 }}) });
        }
      }, [elements, cyInstance, layoutGraph, layoutName]);
    
      return (
        <div style={{ width: '100%', height: '500px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <div ref={cytoscapeContainer} style={{ width: '100%', height: '100%' }} />
        </div>
      );
    };
    
    export default GraphDisplay;
    ```

## 🛠️ Step 3: Dashboard Layout

Create the main dashboard page.

=== "Vue.js (`src/App.vue`)"

    ```vue
    <template>
      <div id="app-dashboard">
        <header>
          <h1>GraphAI Workflow Dashboard</h1>
        </header>
        <main>
          <div class="controls-panel">
            <h2>Controls</h2>
            <button @click="addNode">Add Node</button>
            <button @click="addEdge" :disabled="graphElements.filter(el => el.group === 'nodes').length < 2">Add Edge</button>
            <button @click="loadSampleData">Load Sample</button>
            <button @click="clearGraph">Clear Graph</button>
          </div>
          <div class="graph-panel">
            <GraphDisplay :elements="graphElements" ref="graphDisplayComponent" />
          </div>
          <div class="info-panel">
            <h2>Node Info</h2>
            <div v-if="selectedNode">
              <p><strong>ID:</strong> {{ selectedNode.id }}</p>
              <p><strong>Label:</strong> {{ selectedNode.label }}</p>
              <p><strong>Type:</strong> {{ selectedNode.type || 'N/A' }}</p>
            </div>
            <div v-else>
              <p>Select a node to see its details.</p>
            </div>
          </div>
        </main>
      </div>
    </template>
    
    <script setup>
    import { ref, onMounted } from 'vue';
    import GraphDisplay from './components/GraphDisplay.vue';
    
    const graphElements = ref([]);
    const selectedNode = ref(null);
    const graphDisplayComponent = ref(null); // To access GraphDisplay's Cytoscape instance
    
    let nodeCounter = 0;
    
    const addNode = () => {
      nodeCounter++;
      const newNodeId = `node${nodeCounter}`;
      graphElements.value = [
        ...graphElements.value,
        { group: 'nodes', data: { id: newNodeId, label: `Node ${nodeCounter}` } }
      ];
    };
    
    const addEdge = () => {
      const nodes = graphElements.value.filter(el => el.group === 'nodes');
      if (nodes.length >= 2) {
        const source = nodes[Math.floor(Math.random() * nodes.length)].data.id;
        let target = nodes[Math.floor(Math.random() * nodes.length)].data.id;
        while (target === source && nodes.length > 1) { // Ensure target is different if possible
          target = nodes[Math.floor(Math.random() * nodes.length)].data.id;
        }
        if (target !== source) {
          graphElements.value = [
            ...graphElements.value,
            { group: 'edges', data: { source, target, id: `edge${source}-${target}` } }
          ];
        }
      }
    };
    
    const loadSampleData = () => {
      nodeCounter = 3;
      graphElements.value = [
        { group: 'nodes', data: { id: 'node1', label: 'Input Agent', type: 'input' } },
        { group: 'nodes', data: { id: 'node2', label: 'Processing Agent', type: 'process' } },
        { group: 'nodes', data: { id: 'node3', label: 'Output Agent', type: 'output' } },
        { group: 'edges', data: { source: 'node1', target: 'node2', id: 'e1-2' } },
        { group: 'edges', data: { source: 'node2', target: 'node3', id: 'e2-3' } }
      ];
    };
    
    const clearGraph = () => {
      graphElements.value = [];
      selectedNode.value = null;
      nodeCounter = 0;
    };
    
    onMounted(() => {
      loadSampleData();
      // Setup event listener for node selection
      // This requires the GraphDisplay component to expose its Cytoscape instance (cy.value)
      // and the 'on' method from useCytoscape.
      // For simplicity, this part is omitted here but shown in the Add Visualization quick start.
      // A more robust way is to emit an event from GraphDisplay on node tap.
    });
    
    // Placeholder for node selection logic
    // In a real app, GraphDisplay would emit an event on node tap:
    // e.g., @node-tap="(nodeData) => selectedNode.value = nodeData"
    // And GraphDisplay would have:
    // onMounted(async () => { ... cy.on('tap', 'node', (evt) => emit('node-tap', evt.target.data())); });
    
    </script>
    
    <style>
    #app-dashboard {
      font-family: Avenir, Helvetica, Arial, sans-serif;
      color: #2c3e50;
      padding: 20px;
    }
    header {
      text-align: center;
      margin-bottom: 20px;
    }
    main {
      display: grid;
      grid-template-columns: 200px 1fr 250px;
      gap: 20px;
      height: calc(100vh - 150px); /* Adjust based on header/footer */
    }
    .controls-panel, .info-panel {
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .graph-panel {
      /* GraphDisplay component will fill this */
    }
    button {
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 10px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    button:hover:not(:disabled) {
      background-color: #2563eb;
    }
    </style>
    ```

=== "React (`src/App.tsx`)"

    ```tsx
    import React, { useState, useEffect, useCallback } from 'react';
    import GraphDisplay from './components/GraphDisplay';
    import { ElementDefinition } from 'cytoscape';
    import './App.css';
    
    interface NodeData {
      id: string;
      label: string;
      type?: string;
    }
    
    const App: React.FC = () => {
      const [graphElements, setGraphElements] = useState<ElementDefinition[]>([]);
      const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
      const [nodeCounter, setNodeCounter] = useState(0);
    
      const addNode = useCallback(() => {
        setNodeCounter(prev => {
          const newCount = prev + 1;
          const newNodeId = `node${newCount}`;
          setGraphElements(prevElements => [
            ...prevElements,
            { group: 'nodes', data: { id: newNodeId, label: `Node ${newCount}` } }
          ]);
          return newCount;
        });
      }, []);
    
      const addEdge = useCallback(() => {
        const nodes = graphElements.filter(el => el.group === 'nodes');
        if (nodes.length >= 2) {
          const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
          let targetNode = nodes[Math.floor(Math.random() * nodes.length)];
          while (targetNode.data.id === sourceNode.data.id && nodes.length > 1) {
            targetNode = nodes[Math.floor(Math.random() * nodes.length)];
          }
          if (targetNode.data.id !== sourceNode.data.id) {
            setGraphElements(prevElements => [
              ...prevElements,
              { group: 'edges', data: { source: sourceNode.data.id, target: targetNode.data.id, id: `edge${sourceNode.data.id}-${targetNode.data.id}` } }
            ]);
          }
        }
      }, [graphElements]);
    
      const loadSampleData = useCallback(() => {
        setNodeCounter(3);
        setGraphElements([
          { group: 'nodes', data: { id: 'node1', label: 'Input Agent', type: 'input' } },
          { group: 'nodes', data: { id: 'node2', label: 'Processing Agent', type: 'process' } },
          { group: 'nodes', data: { id: 'node3', label: 'Output Agent', type: 'output' } },
          { group: 'edges', data: { source: 'node1', target: 'node2', id: 'e1-2' } },
          { group: 'edges', data: { source: 'node2', target: 'node3', id: 'e2-3' } }
        ]);
      }, []);
    
      const clearGraph = useCallback(() => {
        setGraphElements([]);
        setSelectedNode(null);
        setNodeCounter(0);
      }, []);
    
      useEffect(() => {
        loadSampleData();
      }, [loadSampleData]);
    
      // Node selection would typically be handled by events from GraphDisplay
      // For simplicity, this is not fully implemented here.
      // The GraphDisplay component would need to expose its Cytoscape instance or emit events.
      // Example: cy.on('tap', 'node', (event) => setSelectedNode(event.target.data()));
    
      return (
        <div className="app-dashboard">
          <header>
            <h1>GraphAI Workflow Dashboard</h1>
          </header>
          <main>
            <div className="controls-panel">
              <h2>Controls</h2>
              <button onClick={addNode}>Add Node</button>
              <button onClick={addEdge} disabled={graphElements.filter(el => el.group === 'nodes').length < 2}>Add Edge</button>
              <button onClick={loadSampleData}>Load Sample</button>
              <button onClick={clearGraph}>Clear Graph</button>
            </div>
            <div className="graph-panel">
              <GraphDisplay elements={graphElements} />
            </div>
            <div className="info-panel">
              <h2>Node Info</h2>
              {selectedNode ? (
                <>
                  <p><strong>ID:</strong> {selectedNode.id}</p>
                  <p><strong>Label:</strong> {selectedNode.label}</p>
                  <p><strong>Type:</strong> {selectedNode.type || 'N/A'}</p>
                </>
              ) : (
                <p>Select a node to see its details.</p>
              )}
            </div>
          </main>
        </div>
      );
    };
    
    export default App;
    ```
    
    And `src/App.css`:
    ```css
    .app-dashboard {
      font-family: sans-serif;
      color: #2c3e50;
      padding: 20px;
    }
    header {
      text-align: center;
      margin-bottom: 20px;
    }
    main {
      display: grid;
      grid-template-columns: 200px 1fr 250px;
      gap: 20px;
      height: calc(100vh - 150px); /* Adjust as needed */
    }
    .controls-panel, .info-panel {
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .controls-panel button {
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 10px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .controls-panel button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    .controls-panel button:hover:not(:disabled) {
      background-color: #2563eb;
    }
    ```

## 🛠️ Step 4: Custom Styling and Interactivity

Enhance the `GraphDisplay` component to support custom styles and node selection.

### Custom Styles based on Node Type

Update the `defaultStyles` or pass `styleOptions` to `GraphDisplay` with selectors for different node types:

```javascript
// Example style for input nodes
{
  selector: 'node[type="input"]',
  style: { 'background-color': '#10b981', 'shape': 'diamond' }
}
// Example style for process nodes
{
  selector: 'node[type="process"]',
  style: { 'background-color': '#f59e0b', 'shape': 'ellipse' }
}
```

### Node Selection Handling

Modify `GraphDisplay` to emit an event or use a callback when a node is tapped.

=== "Vue.js (GraphDisplay.vue)"

    ```vue
    <script setup>
    // ... existing imports
    import { defineEmits } from 'vue'; // Add this
    
    const emit = defineEmits(['node-tap']); // Add this
    
    // ...
    
    onMounted(async () => {
      if (cytoscapeContainer.value) {
        await initCytoscape(/* ... */);
        if (cyInstance.value) { // Add this block
          cyInstance.value.on('tap', 'node', (event) => {
            emit('node-tap', event.target.data());
          });
          cyInstance.value.on('tap', (event) => {
            if (event.target === cyInstance.value) { // Clicked on background
              emit('node-tap', null);
            }
          });
        }
      }
    });
    </script>
    ```
    
    Then in `App.vue`:
    ```vue
    <GraphDisplay :elements="graphElements" @node-tap="handleNodeSelection" />
    
    <script setup>
    // ...
    const handleNodeSelection = (nodeData) => {
      selectedNode.value = nodeData;
    };
    </script>
    ```

=== "React (GraphDisplay.tsx)"

    ```tsx
    interface GraphDisplayProps {
      // ... existing props
      onNodeTap?: (nodeData: NodeData | null) => void;
    }
    
    const GraphDisplay: React.FC<GraphDisplayProps> = ({
      // ... existing props
      onNodeTap
    }) => {
      // ...
      useEffect(() => {
        if (cyInstance && onNodeTap) {
          cyInstance.on('tap', 'node', (event) => {
            onNodeTap(event.target.data() as NodeData);
          });
          cyInstance.on('tap', (event) => {
            if (event.target === cyInstance) {
              onNodeTap(null);
            }
          });
          // Cleanup
          return () => {
            if (cyInstance) {
              cyInstance.removeListener('tap');
            }
          };
        }
      }, [cyInstance, onNodeTap]);
      // ...
    };
    ```
    
    Then in `App.tsx`:
    ```tsx
    const handleNodeSelection = (nodeData: NodeData | null) => {
      setSelectedNode(nodeData);
    };
    
    return (
      // ...
      <GraphDisplay elements={graphElements} onNodeTap={handleNodeSelection} />
      // ...
    );
    ```

## 🛠️ Step 5: Backend Integration (Optional)

Fetch graph data from your GraphAI server.

```javascript
// Example fetch function (place in a service or App component)
async function fetchGraphData() {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('http://localhost:8085/api/workflow/my-workflow'); 
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    // Transform data to Cytoscape elements format if necessary
    // Example: data might be { nodes: [...], edges: [...] }
    // Ensure it matches { group: 'nodes', data: { id: ..., label: ... } }
    // and { group: 'edges', data: { source: ..., target: ... } }
    return data.elements || []; 
  } catch (error) {
    console.error("Failed to fetch graph data:", error);
    return []; // Return empty or sample data on error
  }
}

// Call this function in onMounted (Vue) or useEffect (React)
// and update graphElements.value / setGraphElements
```

## ✅ Step 6: Run and Test

```bash
# Vue.js
npm run dev

# React
npm start
```

Open your browser to the specified port (usually `localhost:5173` for Vue/Vite or `localhost:3000` for React).
Test adding nodes, edges, loading sample data, and selecting nodes to see their info.

## 🎉 Congratulations!

You've built an interactive GraphAI dashboard with:

✅ **Dynamic graph visualization** using Cytoscape.js  
✅ **Controls** for manipulating the graph  
✅ **Node information panel** for inspecting elements  
✅ **Framework-specific components** (Vue or React)  
✅ **Foundation for backend integration**

## 🚀 Next Steps

### Enhance Your Dashboard

- **Save/Load Workflows**: Implement functionality to save the current graph to a backend and load existing workflows.
- **Real-time Updates**: Use WebSockets to reflect changes in the graph from other users or backend processes.
- **Advanced Styling**: Implement more sophisticated styling based on node status (e.g., running, completed, error).
- **Context Menus**: Add right-click context menus on nodes for actions like "Edit", "Delete", "Run Agent".
- **Zoom/Pan Controls**: Add UI buttons for common graph navigation actions.
- **Undo/Redo**: Implement an action history for undo/redo capabilities.

### Explore More Tutorials

- **[Chat Server](chat-server.md)**: Build the backend this dashboard could connect to.
- **[Agent Generator](agent-generator.md)**: Create a UI for building the agents that run in these workflows.
- **[Firebase Integration](firebase-integration.md)**: Deploy your dashboard and backend to the cloud.

## 📚 Reference Materials

- **[Vue Cytoscape Package](../reference/packages/vue-cytoscape.md)**
- **[React Cytoscape Package](../reference/packages/react-cytoscape.md)**
- **[Cytoscape.js Documentation](https://js.cytoscape.org/)**
- **[Klay Layout Algorithm](https://github.com/cytoscape/cytoscape.js-klay)**