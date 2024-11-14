'use strict';

var vue = require('vue');
var graphai = require('graphai');
var cytoscape = require('cytoscape');
var klay = require('cytoscape-klay');

cytoscape.use(klay);
const layout = "klay";
const colorPriority = "#f80";
const colorStatic = "#88f";
const calcNodeWidth = (label) => {
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
            shape: (ele) => (ele.data("isStatic") ? "rectangle" : "roundrectangle"),
            width: (ele) => calcNodeWidth(ele.data("id")),
            color: "#fff",
            height: "30px",
            "text-valign": "center",
            "text-halign": "center",
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
            "curve-style": "straight",
            "text-background-color": "#ffffff",
            "text-background-opacity": 0.8,
            "text-background-shape": "rectangle",
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
            "curve-style": "unbundled-bezier",
            "target-arrow-color": "#ddd",
        },
    },
];
const colorMap = {
    [graphai.NodeState.Waiting]: "#888",
    [graphai.NodeState.Completed]: "#000",
    [graphai.NodeState.Executing]: "#0f0",
    ["executing-server"]: "#FFC0CB",
    [graphai.NodeState.Queued]: "#ff0",
    [graphai.NodeState.Injected]: "#00f",
    [graphai.NodeState.TimedOut]: "#f0f",
    [graphai.NodeState.Failed]: "#f00",
    [graphai.NodeState.Skipped]: "#0ff",
};
const parseInput = (input) => {
    // WARNING: Assuming the first character is always ":"
    const ids = input.slice(1).split(".");
    const source = ids.shift() || "";
    const label = ids.length ? ids.join(".") : undefined;
    return { source, label };
};
const inputs2dataSources = (inputs) => {
    if (Array.isArray(inputs)) {
        return inputs.map((inp) => inputs2dataSources(inp)).flat();
    }
    if (graphai.isObject(inputs)) {
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
const dataSourceNodeIds = (sources) => {
    return sources.filter((source) => source.nodeId).map((source) => source.nodeId);
};
const cytoscapeFromGraph = (graph_data) => {
    const elements = Object.keys(graph_data.nodes || {}).reduce((tmp, nodeId) => {
        const node = graph_data.nodes[nodeId];
        const isStatic = "value" in node;
        const cyNode = {
            data: {
                id: nodeId,
                color: isStatic ? colorStatic : colorMap[graphai.NodeState.Waiting],
                isStatic,
            },
        };
        tmp.nodes.push(cyNode);
        tmp.map[nodeId] = cyNode;
        if ("inputs" in node) {
            // computed node
            inputs2dataSources(node.inputs).forEach((input) => {
                if (input[0] === ":") {
                    const { source, label } = parseInput(input);
                    tmp.edges.push({
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
            tmp.edges.push({
                data: {
                    source,
                    target: nodeId,
                    isUpdate: true,
                    label,
                },
            });
        }
        return tmp;
    }, { nodes: [], edges: [], map: {} });
    return { elements };
};
const useCytoscape = (selectedGraph) => {
    let cy = null;
    const cytoscapeData = vue.ref(cytoscapeFromGraph(selectedGraph.value ?? { nodes: {} }));
    const cytoscapeRef = vue.ref();
    const zoomingEnabled = vue.ref(true);
    const updateCytoscape = async (nodeId, state) => {
        if ([graphai.NodeState.Completed, graphai.NodeState.Waiting].includes(state)) {
            await graphai.sleep(100);
        }
        const elements = cytoscapeData.value.elements;
        elements.map[nodeId].data.color = colorMap[state];
        const graph = selectedGraph.value;
        const nodeData = (graph?.nodes ?? {})[nodeId] ?? [];
        if ("agent" in nodeData && state === graphai.NodeState.Queued && (nodeData.priority ?? 0) > 0) {
            // computed node
            elements.map[nodeId].data.color = colorPriority;
        }
        else if ("value" in nodeData && state === graphai.NodeState.Waiting) {
            // static node
            elements.map[nodeId].data.color = colorStatic;
        }
        cytoscapeData.value = { elements };
        if (state === graphai.NodeState.Injected) {
            await graphai.sleep(100);
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
        }
        catch (error) {
            console.error(error);
            // store.commit("setCytoscape", null);
            // error_msg.value = `${error}`;
        }
    };
    const updateGraphData = async () => {
        if (cy) {
            cy.elements().remove();
            cy.add(cytoscapeData.value.elements);
            const name = cytoscapeData.value.elements.nodes.reduce((prevName, node) => {
                if (node.position) {
                    return "preset";
                }
                return prevName;
            }, layout);
            console.log("layout", name);
            cy.layout({ name }).run();
            cy.fit();
            if (name === layout) {
                await graphai.sleep(400);
                storePositions();
            }
        }
    };
    const storePositions = () => {
        console.log("storePositions");
        if (cy) {
            cy.nodes().forEach((cynode) => {
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
            elements.map[nodeId].data.color = "value" in nodeData ? colorStatic : colorMap[graphai.NodeState.Waiting];
        });
        cytoscapeData.value = { elements };
    };
    vue.watch(cytoscapeData, () => {
        console.log("updated");
        updateGraphData();
    });
    vue.watch(selectedGraph, () => {
        cytoscapeData.value = cytoscapeFromGraph(selectedGraph.value);
    });
    vue.onMounted(() => {
        createCytoscape();
        updateGraphData();
    });
    const layoutCytoscape = (key) => {
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
    const loadLayout = (key) => {
        const savedLayoutData = localStorage.getItem("layoutData-" + key);
        if (savedLayoutData) {
            const positions = JSON.parse(savedLayoutData);
            positions.forEach((data) => {
                if (cy) {
                    const node = cy.getElementById(data.id);
                    if (node) {
                        node.position(data.position);
                    }
                }
            });
        }
    };
    vue.watch(zoomingEnabled, (value) => {
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

exports.dataSourceNodeIds = dataSourceNodeIds;
exports.inputs2dataSources = inputs2dataSources;
exports.useCytoscape = useCytoscape;
//# sourceMappingURL=bundle.cjs.js.map
