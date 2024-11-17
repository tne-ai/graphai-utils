import { Ref, ref, onMounted, watch, ComputedRef } from "vue";
import { GraphData, NodeState, NodeData, sleep, isObject } from "graphai";

import { DataSource } from "graphai/lib/type";

import cytoscape, { Core, NodeSingular, NodeDefinition, EdgeDefinition, EdgeSingular, Position } from "cytoscape";
import klay from "cytoscape-klay";

cytoscape.use(klay);
const layout = "klay";

const colorPriority = "#f80";
const colorStatic = "#88f";

const calcNodeWidth = (label: string) => {
  if (label === null || label === undefined) {
    return "50px";
  }
  return Math.max(50, label.length * 8) + "px";
};

const cyStyle = [
  {
    selector: "node",
    style: {
      "background-color": "data(color)",
      label: "data(id)",
      shape: (ele: NodeSingular) => (ele.data("isStatic") ? "rectangle" : "roundrectangle"),
      width: (ele: EdgeSingular) => calcNodeWidth(ele.data("id")),
      color: "#fff",
      height: "30px",
      "text-valign": "center" as const,
      "text-halign": "center" as const,
      "font-size": "12px",
    },
  },
  {
    selector: "edge",
    style: {
      width: 3,
      "line-color": "#888",
      "target-arrow-color": "#888",
      "target-arrow-shape": "triangle",
      "curve-style": "straight" as const,
      "text-background-color": "#ffffff",
      "text-background-opacity": 0.8,
      "text-background-shape": "rectangle" as const,
      "font-size": "10px",
    },
  },
  {
    selector: "edge[label]",
    style: {
      label: "data(label)",
    },
  },
  {
    selector: "edge[isUpdate]",
    style: {
      color: "#ddd",
      "line-color": "#ddd",
      "line-style": "dashed",
      "curve-style": "unbundled-bezier" as const,
      "target-arrow-color": "#ddd",
    },
  },
];

const colorMap = {
  [NodeState.Waiting]: "#888",
  [NodeState.Completed]: "#000",
  [NodeState.Executing]: "#0f0",
  ["executing-server"]: "#FFC0CB",
  [NodeState.Queued]: "#ff0",
  [NodeState.Injected]: "#00f",
  [NodeState.TimedOut]: "#f0f",
  [NodeState.Failed]: "#f00",
  [NodeState.Skipped]: "#0ff",
};

const parseInput = (input: string) => {
  // WARNING: Assuming the first character is always ":"
  const ids = input.slice(1).split(".");
  const source = ids.shift() || "";
  const label = ids.length ? ids.join(".") : undefined;
  return { source, label };
};

export const inputs2dataSources = (inputs: any): string[] => {
  if (Array.isArray(inputs)) {
    return inputs.map((inp) => inputs2dataSources(inp)).flat();
  }
  if (isObject(inputs)) {
    return Object.values(inputs)
      .map((input) => inputs2dataSources(input))
      .flat();
  }
  if (typeof inputs === "string") {
    const templateMatch = Array.from(inputs.matchAll(/\${(:[^}]+)}/g)).map((m) => m[1]);
    if (templateMatch.length > 0) {
      return inputs2dataSources(templateMatch);
    }
  }
  return inputs;
};

export const dataSourceNodeIds = (sources: DataSource[]): string[] => {
  return sources.filter((source: DataSource) => source.nodeId).map((source) => source.nodeId!);
};

const node2cyNode = (node: NodeData, nodeId: string) => {
  const isStatic = "value" in node;
  const cyNode = {
    data: {
      id: nodeId,
      color: isStatic ? colorStatic : colorMap[NodeState.Waiting],
      isStatic,
    },
  };
  return cyNode;
};

const node2cyEdge = (node: NodeData, nodeId: string) => {
  const edges: EdgeDefinition[] = [];
  if ("inputs" in node) {
    // computed node
    inputs2dataSources(node.inputs).forEach((input: string) => {
      if (input[0] === ":") {
        const { source, label } = parseInput(input);
        edges.push({
          data: {
            source,
            target: nodeId,
            label,
          },
        });
      }
    });
  }
  if ("update" in node && node.update) {
    // static node
    const { source, label } = parseInput(node.update);
    edges.push({
      data: {
        source,
        target: nodeId,
        isUpdate: true,
        label,
      },
    });
  }
  return edges;
};

const cytoscapeFromGraph = (_graph_data: GraphData) => {
  const elements: {
    nodes: NodeDefinition[];
    edges: EdgeDefinition[];
    map: Record<string, NodeDefinition>;
  } = { nodes: [], edges: [], map: {} };

  const toGraph = (graph_data: GraphData) => {
    Object.keys(graph_data.nodes || {}).forEach((nodeId) => {
      const node: NodeData = graph_data.nodes[nodeId];
      const cyNode = node2cyNode(node, nodeId);
      elements.nodes.push(cyNode);
      elements.map[nodeId] = cyNode;

      node2cyEdge(node, nodeId).forEach((edge) => {
        elements.edges.push(edge);
      });
      // nested
      if ("agent" in node && node.agent === "nestedAgent") {
        
        const graph = typeof node.graph === "string" ? JSON.parse(node.graph) : { ...node.graph };
        Object.keys(node.inputs).forEach((key) => {
          graph.nodes[key] = { value: "dummy" };
        });
        toGraph(graph);
      }
    });
  };
  toGraph(_graph_data);

  return { elements };
};

export const useCytoscape = (selectedGraph: ComputedRef<GraphData> | Ref<GraphData>) => {
  let cy: null | Core = null;

  const cytoscapeData = ref(cytoscapeFromGraph(selectedGraph.value ?? { nodes: {} }));
  const cytoscapeRef = ref();
  const zoomingEnabled = ref(true);

  const updateCytoscape = async (nodeId: string, state: NodeState) => {
    if ([NodeState.Completed, NodeState.Waiting].includes(state)) {
      await sleep(100);
    }
    const elements = cytoscapeData.value.elements;
    elements.map[nodeId].data.color = colorMap[state];
    const graph = selectedGraph.value;
    const nodeData = (graph?.nodes ?? {})[nodeId] ?? [];
    if ("agent" in nodeData && state === NodeState.Queued && (nodeData.priority ?? 0) > 0) {
      // computed node
      elements.map[nodeId].data.color = colorPriority;
    } else if ("value" in nodeData && state === NodeState.Waiting) {
      // static node
      elements.map[nodeId].data.color = colorStatic;
    }

    cytoscapeData.value = { elements };
    if (state === NodeState.Injected) {
      await sleep(100);
      elements.map[nodeId].data.color = colorStatic;
      cytoscapeData.value = { elements };
    }
  };

  const createCytoscape = () => {
    try {
      cy = cytoscape({
        container: cytoscapeRef.value,
        style: cyStyle,
        layout: {
          name: layout,
          // fit: true,
          // padding: 30,
          // avoidOverlap: true,
        },
      });
      cy.on("mouseup", storePositions);
      cy.on("touchend", storePositions);
      // cy.on("select", "node", callback);
      // cy.on("select", "edge", callback);
      //store.commit("setCytoscape", cy);
    } catch (error) {
      console.error(error);
      // store.commit("setCytoscape", null);
      // error_msg.value = `${error}`;
    }
  };
  const updateGraphData = async () => {
    if (cy) {
      cy.elements().remove();
      cy.add(cytoscapeData.value.elements);
      const name = cytoscapeData.value.elements.nodes.reduce((prevName: string, node: NodeDefinition) => {
        if (node.position) {
          return "preset";
        }
        return prevName;
      }, layout);
      console.log("layout", name);
      cy.layout({ name }).run();
      cy.fit();
      if (name === layout) {
        await sleep(400);
        storePositions();
      }
    }
  };

  const storePositions = () => {
    console.log("storePositions");
    if (cy) {
      cy.nodes().forEach((cynode: NodeSingular) => {
        const id = cynode.id();
        const pos = cynode.position();
        const node = cytoscapeData.value.elements.map[id];
        node.position = pos;
      });
    }
  };

  const resetCytoscape = () => {
    const elements = cytoscapeData.value.elements;
    Object.keys(elements.map).forEach((nodeId) => {
      const graph = selectedGraph.value;
      const nodeData = graph.nodes[nodeId];
      elements.map[nodeId].data.color = "value" in nodeData ? colorStatic : colorMap[NodeState.Waiting];
    });
    cytoscapeData.value = { elements };
  };

  watch(cytoscapeData, () => {
    console.log("updated");
    updateGraphData();
  });

  watch(selectedGraph, () => {
    cytoscapeData.value = cytoscapeFromGraph(selectedGraph.value);
  });

  onMounted(() => {
    createCytoscape();
    updateGraphData();
  });

  const layoutCytoscape = (key: string) => {
    if (cy) {
      const positions = cy.nodes().map((node) => {
        return {
          id: node.id(),
          position: node.position(),
        };
      });
      console.log(JSON.stringify(positions));
      localStorage.setItem("layoutData-" + key, JSON.stringify(positions));
    }
  };

  const loadLayout = (key: string) => {
    const savedLayoutData = localStorage.getItem("layoutData-" + key);
    if (savedLayoutData) {
      const positions = JSON.parse(savedLayoutData);
      positions.forEach((data: { id: string; position: Position }) => {
        if (cy) {
          const node = cy.getElementById(data.id);
          if (node) {
            node.position(data.position);
          }
        }
      });
    }
  };

  watch(zoomingEnabled, (value) => {
    if (cy) {
      cy.zoomingEnabled(value);
    }
  });

  return {
    cytoscapeRef,
    updateCytoscape,
    resetCytoscape,

    layoutCytoscape,
    loadLayout,

    zoomingEnabled,
  };
};
