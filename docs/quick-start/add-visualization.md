# Add Graph Visualization

Transform your GraphAI applications with beautiful, interactive graph visualizations using our Vue.js and React components powered by Cytoscape.js.

## Overview

GraphAI Utils provides specialized visualization components for both Vue.js and React applications:

- **`@receptron/graphai_vue_cytoscape`** - Vue 3 composable for graph visualization
- **`@receptron/graphai_react_cytoscape`** - React component for graph visualization
- **Cytoscape.js integration** with advanced layouts (Klay hierarchical layout)
- **Interactive features** - zoom, pan, node selection, and custom styling

## Vue.js Integration

### Installation

```bash
npm install @receptron/graphai_vue_cytoscape vue@^3.5.13
```

### Basic Usage

```vue
<template>
  <div class="graph-container">
    <div ref="cytoscapeRef" style="width: 100%; height: 500px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCytoscape } from '@receptron/graphai_vue_cytoscape';

const cytoscapeRef = ref(null);

// Sample graph data
const graphData = {
  nodes: [
    { data: { id: 'input', label: 'User Input' } },
    { data: { id: 'process', label: 'AI Processing' } },
    { data: { id: 'output', label: 'Response' } }
  ],
  edges: [
    { data: { source: 'input', target: 'process' } },
    { data: { source: 'process', target: 'output' } }
  ]
};

// Initialize Cytoscape
const { initCytoscape, addNode, addEdge, layout } = useCytoscape();

onMounted(async () => {
  await initCytoscape(cytoscapeRef.value, {
    elements: [...graphData.nodes, ...graphData.edges],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#0ea5e9',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': '#ffffff',
          'font-size': '12px',
          'width': 80,
          'height': 40
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#64748b',
          'target-arrow-color': '#64748b',
          'target-arrow-shape': 'triangle'
        }
      }
    ],
    layout: {
      name: 'klay',
      klay: {
        direction: 'RIGHT',
        spacing: 50
      }
    }
  });
});
</script>
```

### Advanced Vue Example

```vue
<template>
  <div class="workflow-visualizer">
    <div class="controls">
      <button @click="addRandomNode">Add Node</button>
      <button @click="resetLayout">Reset Layout</button>
      <button @click="exportGraph">Export</button>
    </div>
    
    <div 
      ref="cytoscapeContainer" 
      class="cytoscape-container"
      style="width: 100%; height: 600px; border: 1px solid #e2e8f0;"
    ></div>
    
    <div class="node-info" v-if="selectedNode">
      <h3>{{ selectedNode.label }}</h3>
      <p>ID: {{ selectedNode.id }}</p>
      <p>Type: {{ selectedNode.type }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCytoscape } from '@receptron/graphai_vue_cytoscape';

const cytoscapeContainer = ref(null);
const selectedNode = ref(null);

const { 
  initCytoscape, 
  addNode, 
  addEdge, 
  layout, 
  on,
  cy
} = useCytoscape();

onMounted(async () => {
  await initCytoscape(cytoscapeContainer.value, {
    elements: [
      // Initial workflow nodes
      { data: { id: 'start', label: 'Start', type: 'input' } },
      { data: { id: 'agent1', label: 'Text Processor', type: 'agent' } },
      { data: { id: 'agent2', label: 'AI Model', type: 'agent' } },
      { data: { id: 'end', label: 'Output', type: 'output' } },
      
      // Connections
      { data: { source: 'start', target: 'agent1' } },
      { data: { source: 'agent1', target: 'agent2' } },
      { data: { source: 'agent2', target: 'end' } }
    ],
    
    style: [
      {
        selector: 'node[type="input"]',
        style: {
          'background-color': '#10b981',
          'shape': 'round-rectangle'
        }
      },
      {
        selector: 'node[type="agent"]',
        style: {
          'background-color': '#3b82f6',
          'shape': 'rectangle'
        }
      },
      {
        selector: 'node[type="output"]',
        style: {
          'background-color': '#f59e0b',
          'shape': 'round-rectangle'
        }
      },
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': '#ffffff',
          'font-weight': 'bold',
          'font-size': '10px',
          'width': 120,
          'height': 60
        }
      }
    ],
    
    layout: {
      name: 'klay',
      klay: {
        direction: 'DOWN',
        spacing: 40
      }
    }
  });

  // Handle node selection
  on('tap', 'node', (event) => {
    const node = event.target;
    selectedNode.value = {
      id: node.id(),
      label: node.data('label'),
      type: node.data('type')
    };
  });
});

const addRandomNode = () => {
  const id = `node_${Date.now()}`;
  addNode({
    data: {
      id,
      label: `Node ${id.slice(-4)}`,
      type: 'agent'
    }
  });
};

const resetLayout = () => {
  layout({
    name: 'klay',
    klay: { direction: 'DOWN', spacing: 40 }
  });
};

const exportGraph = () => {
  const elements = cy.elements().jsons();
  console.log('Graph data:', elements);
  // Download or save the graph data
};
</script>

<style scoped>
.workflow-visualizer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
}

.controls button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.controls button:hover {
  background-color: #2563eb;
}

.node-info {
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}
</style>
```

## React Integration

### Installation

```bash
npm install @receptron/graphai_react_cytoscape react@^18.3.1
```

### Basic Usage

```jsx
import React, { useRef, useEffect } from 'react';
import { useCytoscape } from '@receptron/graphai_react_cytoscape';

function GraphVisualization() {
  const containerRef = useRef(null);
  const { initCytoscape } = useCytoscape();

  const graphData = {
    nodes: [
      { data: { id: 'input', label: 'Input Node' } },
      { data: { id: 'process', label: 'Process Node' } },
      { data: { id: 'output', label: 'Output Node' } }
    ],
    edges: [
      { data: { source: 'input', target: 'process' } },
      { data: { source: 'process', target: 'output' } }
    ]
  };

  useEffect(() => {
    if (containerRef.current) {
      initCytoscape(containerRef.current, {
        elements: [...graphData.nodes, ...graphData.edges],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#3b82f6',
              'label': 'data(label)',
              'text-valign': 'center',
              'color': 'white',
              'font-size': '12px',
              'width': 100,
              'height': 50
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#64748b',
              'target-arrow-shape': 'triangle'
            }
          }
        ],
        layout: { name: 'klay' }
      });
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '500px' }}
    />
  );
}

export default GraphVisualization;
```

### Interactive React Component

```jsx
import React, { useRef, useEffect, useState } from 'react';
import { useCytoscape } from '@receptron/graphai_react_cytoscape';

function InteractiveGraph() {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeCount, setNodeCount] = useState(3);
  
  const { initCytoscape, addNode, addEdge, cy, on } = useCytoscape();

  useEffect(() => {
    if (containerRef.current) {
      initCytoscape(containerRef.current, {
        elements: [
          { data: { id: '1', label: 'Start' } },
          { data: { id: '2', label: 'Process' } },
          { data: { id: '3', label: 'End' } },
          { data: { source: '1', target: '2' } },
          { data: { source: '2', target: '3' } }
        ],
        
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#0ea5e9',
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'color': '#ffffff',
              'font-size': '10px',
              'width': 80,
              'height': 40,
              'border-width': 2,
              'border-color': '#0284c7'
            }
          },
          {
            selector: 'node:selected',
            style: {
              'background-color': '#dc2626',
              'border-color': '#b91c1c'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#64748b',
              'target-arrow-color': '#64748b',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier'
            }
          }
        ],
        
        layout: {
          name: 'klay',
          klay: {
            direction: 'RIGHT',
            spacing: 60
          }
        }
      });

      // Handle node selection
      on('tap', 'node', (event) => {
        const node = event.target;
        setSelectedNode({
          id: node.id(),
          label: node.data('label')
        });
      });

      // Deselect when clicking background
      on('tap', (event) => {
        if (event.target === cy) {
          setSelectedNode(null);
        }
      });
    }
  }, []);

  const handleAddNode = () => {
    const newId = (nodeCount + 1).toString();
    addNode({
      data: {
        id: newId,
        label: `Node ${newId}`
      }
    });
    setNodeCount(nodeCount + 1);
  };

  const handleConnectNodes = () => {
    if (selectedNode) {
      const newId = (nodeCount + 1).toString();
      addNode({
        data: {
          id: newId,
          label: `Node ${newId}`
        }
      });
      addEdge({
        data: {
          source: selectedNode.id,
          target: newId
        }
      });
      setNodeCount(nodeCount + 1);
    }
  };

  return (
    <div className="interactive-graph">
      <div className="controls">
        <button onClick={handleAddNode}>
          Add Node
        </button>
        <button 
          onClick={handleConnectNodes}
          disabled={!selectedNode}
        >
          Connect from Selected
        </button>
      </div>
      
      {selectedNode && (
        <div className="selection-info">
          Selected: {selectedNode.label} (ID: {selectedNode.id})
        </div>
      )}
      
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '500px',
          border: '1px solid #e2e8f0',
          borderRadius: '0.375rem'
        }}
      />
    </div>
  );
}

export default InteractiveGraph;
```

## Styling & Customization

### Custom Node Styles

```javascript
const customStyles = [
  {
    selector: 'node[type="input"]',
    style: {
      'background-color': '#10b981',
      'shape': 'round-rectangle',
      'border-width': 2,
      'border-color': '#059669'
    }
  },
  {
    selector: 'node[type="agent"]',
    style: {
      'background-color': '#3b82f6',
      'shape': 'rectangle'
    }
  },
  {
    selector: 'node[type="output"]',
    style: {
      'background-color': '#f59e0b',
      'shape': 'diamond'
    }
  }
];
```

### Layout Options

```javascript
// Hierarchical layout (recommended)
const klayLayout = {
  name: 'klay',
  klay: {
    direction: 'DOWN', // or 'RIGHT', 'UP', 'LEFT'
    spacing: 40,
    algorithm: 'layered'
  }
};

// Force-directed layout
const coseLayout = {
  name: 'cose',
  idealEdgeLength: 100,
  nodeOverlap: 20,
  refresh: 20
};

// Grid layout
const gridLayout = {
  name: 'grid',
  rows: 3,
  cols: 3
};
```

## Integration with GraphAI Server

Connect your visualization to your GraphAI server:

```javascript
// Fetch graph data from your GraphAI server
async function loadGraphFromServer() {
  try {
    const response = await fetch('/api/graph-structure');
    const graphData = await response.json();
    
    // Transform server data to Cytoscape format
    const elements = [
      ...graphData.nodes.map(node => ({
        data: {
          id: node.id,
          label: node.agent || node.id,
          type: node.inputs ? 'agent' : 'input'
        }
      })),
      ...graphData.edges.map(edge => ({
        data: {
          source: edge.from,
          target: edge.to
        }
      }))
    ];
    
    return elements;
  } catch (error) {
    console.error('Failed to load graph:', error);
    return [];
  }
}

// Use in your component
onMounted(async () => {
  const elements = await loadGraphFromServer();
  await initCytoscape(containerRef.value, {
    elements,
    // ... other options
  });
});
```

## Next Steps

- **[Complete Tutorial](../tutorials/graph-dashboard.md)** - Build a full dashboard with graphs
- **[Deploy Visualization](deployment.md)** - Deploy your visualized application
- **[React Examples](../examples/react-visualizer.md)** - More React visualization examples
- **[Vue Examples](../examples/vue-dashboard.md)** - Advanced Vue dashboard patterns