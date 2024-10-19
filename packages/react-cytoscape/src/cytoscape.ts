import { useState, useRef, useEffect, useCallback } from "react";
import cytoscape, { Core, NodeSingular, NodeDefinition, EdgeDefinition, EdgeSingular } from "cytoscape";
import klay from "cytoscape-klay";
import { GraphData, NodeState, NodeData, sleep } from "graphai";

cytoscape.use(klay);
const layout = "klay";

const colorPriority = "#f80";
const colorStatic = "#88f";

const calcNodeWidth = (label: string) => {
  if (!label) return "50px";
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

const cytoscapeFromGraph = (graph_data: GraphData) => {
  const elements = Object.keys(graph_data.nodes || {}).reduce(
    (tmp, nodeId) => {
      const node: NodeData = graph_data.nodes[nodeId];
      const isStatic = "value" in node;
      const cyNode = {
        data: {
          id: nodeId,
          color: isStatic ? colorStatic : colorMap[NodeState.Waiting],
          isStatic,
        },
      };
      tmp.nodes.push(cyNode);
      tmp.map[nodeId] = cyNode;
      if ("inputs" in node) {
        const inputs = Array.isArray(node.inputs) ? node.inputs : Object.values(node.inputs || {});
        inputs.forEach((input: string) => {
          const { source, label } = parseInput(input);
          tmp.edges.push({
            data: { source, target: nodeId, label },
          });
        });
      }
      if ("update" in node && node.update) {
        const { source, label } = parseInput(node.update);
        tmp.edges.push({
          data: { source, target: nodeId, isUpdate: true, label },
        });
      }
      return tmp;
    },
    { nodes: [], edges: [], map: {} },
  );
  return { elements };
};

export const useCytoscape = (selectedGraph: GraphData) => {
  const [cyto, setCyto] = useState<Core | null>(0);
  let cy: Core | null = null;

  const [cytoscapeData, setCytoscapeData] = useState(() => cytoscapeFromGraph(selectedGraph ?? { nodes: {} }));
  const cytoscapeRef = useRef(null);

  const updateCytoscape = useCallback(
    async (nodeId: string, state: NodeState) => {
      if ([NodeState.Completed, NodeState.Waiting].includes(state)) {
        await sleep(100);
      }
      const elements = cytoscapeData.elements;
      elements.map[nodeId].data.color = colorMap[state];
      const nodeData = selectedGraph.nodes[nodeId] ?? {};
      if ("agent" in nodeData && state === NodeState.Queued && (nodeData.priority ?? 0) > 0) {
        // computed node
        elements.map[nodeId].data.color = colorPriority;
      } else if ("value" in nodeData && state === NodeState.Waiting) {
        // static node
        elements.map[nodeId].data.color = colorStatic;
      }

      setCytoscapeData({ elements });
      if (state === NodeState.Injected) {
        await sleep(100);
        elements.map[nodeId].data.color = colorStatic;
        setCytoscapeData({ elements });
      }
    },

    [cytoscapeData, selectedGraph],
  );

  const createCytoscape = () => {
    try {
      if (!cyto) {
        setCyto(
          cytoscape({
            container: cytoscapeRef.current,
            style: cyStyle,
            layout: { name: layout },
          }),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (cyto) {
      console.log(cyto);
      cyto.on("mouseup", storePositions);
      cyto.on("touchend", storePositions);
    }
  }, [cyto]);

  const updateGraphData = async () => {
    if (cyto) {
      cyto.elements().remove();
      cyto.add(cytoscapeData.elements);
      const name = cytoscapeData.elements.nodes.some((node) => node.position) ? "preset" : layout;
      cyto.layout({ name }).run();
      cyto.fit();
      if (name === layout) {
        await sleep(400);
        storePositions();
      }
    }
  };

  const storePositions = () => {
    if (cyto) {
      cyto.nodes().forEach((cynode: NodeSingular) => {
        const id = cynode.id();
        const pos = cynode.position();
        const node = cytoscapeData.elements.map[id];
        node.position = pos;
      });
    }
  };

  const resetCytoscape = () => {
    const elements = cytoscapeData.elements;
    Object.keys(elements.map).forEach((nodeId) => {
      const nodeData = selectedGraph.nodes[nodeId];
      elements.map[nodeId].data.color = "value" in nodeData ? colorStatic : colorMap[NodeState.Waiting];
    });
    setCytoscapeData({ elements });
  };

  useEffect(() => {
    if (cytoscapeRef.current) {
      createCytoscape();
      updateGraphData();
    }
  }, [createCytoscape, updateGraphData, cytoscapeRef]);

  useEffect(() => {
    if (selectedGraph) {
      setCytoscapeData(cytoscapeFromGraph(selectedGraph));
    }
  }, [selectedGraph]);

  return {
    cytoscapeRef,
    updateCytoscape,
    resetCytoscape,
  };
};
