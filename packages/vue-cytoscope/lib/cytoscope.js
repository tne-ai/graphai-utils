"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCytoscope = void 0;
var vue_1 = require("vue");
var graphai_1 = require("graphai");
var cytoscape_1 = __importDefault(require("cytoscape"));
var cytoscape_klay_1 = __importDefault(require("cytoscape-klay"));
cytoscape_1.default.use(cytoscape_klay_1.default);
var layout = "klay";
var colorPriority = "#f80";
var colorStatic = "#88f";
var calcNodeWidth = function (label) {
    if (label === null || label === undefined) {
        return "50px";
    }
    return Math.max(50, label.length * 8) + "px";
};
var cyStyle = [
    {
        selector: "node",
        style: {
            "background-color": "data(color)",
            label: "data(id)",
            shape: function (ele) { return (ele.data("isStatic") ? "rectangle" : "roundrectangle"); },
            width: function (ele) { return calcNodeWidth(ele.data("id")); },
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
var colorMap = (_a = {},
    _a[graphai_1.NodeState.Waiting] = "#888",
    _a[graphai_1.NodeState.Completed] = "#000",
    _a[graphai_1.NodeState.Executing] = "#0f0",
    _a[graphai_1.NodeState.Queued] = "#ff0",
    _a[graphai_1.NodeState.Injected] = "#00f",
    _a[graphai_1.NodeState.TimedOut] = "#f0f",
    _a[graphai_1.NodeState.Failed] = "#f00",
    _a[graphai_1.NodeState.Skipped] = "#0ff",
    _a);
var parseInput = function (input) {
    // WARNING: Assuming the first character is always ":"
    var ids = input.slice(1).split(".");
    var source = ids.shift() || "";
    var label = ids.length ? ids.join(".") : undefined;
    return { source: source, label: label };
};
var cytoscapeFromGraph = function (graph_data) {
    var elements = Object.keys(graph_data.nodes).reduce(function (tmp, nodeId) {
        var node = graph_data.nodes[nodeId];
        var isStatic = "value" in node;
        var cyNode = {
            data: {
                id: nodeId,
                color: isStatic ? colorStatic : colorMap[graphai_1.NodeState.Waiting],
                isStatic: isStatic,
            },
        };
        tmp.nodes.push(cyNode);
        tmp.map[nodeId] = cyNode;
        if ("inputs" in node) {
            // computed node
            var inputs = Array.isArray(node.inputs) ? node.inputs : Object.values(node.inputs || {});
            (inputs !== null && inputs !== void 0 ? inputs : []).forEach(function (input) {
                var _a = parseInput(input), source = _a.source, label = _a.label;
                tmp.edges.push({
                    data: {
                        source: source,
                        target: nodeId,
                        label: label,
                    },
                });
            });
        }
        if ("update" in node && node.update) {
            // static node
            var _a = parseInput(node.update), source = _a.source, label = _a.label;
            tmp.edges.push({
                data: {
                    source: source,
                    target: nodeId,
                    isUpdate: true,
                    label: label,
                },
            });
        }
        return tmp;
    }, { nodes: [], edges: [], map: {} });
    return { elements: elements };
};
var useCytoscope = function (selectedGraph) {
    var cy = null;
    var cytoscopeData = (0, vue_1.ref)(cytoscapeFromGraph(selectedGraph.value));
    var cytoscopeRef = (0, vue_1.ref)();
    var updateCytoscope = function (nodeId, state) { return __awaiter(void 0, void 0, void 0, function () {
        var elements, graph, nodeData;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(state === graphai_1.NodeState.Completed)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, graphai_1.sleep)(100)];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    elements = cytoscopeData.value.elements;
                    elements.map[nodeId].data.color = colorMap[state];
                    graph = selectedGraph.value;
                    nodeData = graph.nodes[nodeId];
                    if ("agent" in nodeData && state === graphai_1.NodeState.Queued && ((_a = nodeData.priority) !== null && _a !== void 0 ? _a : 0) > 0) {
                        // computed node
                        elements.map[nodeId].data.color = colorPriority;
                    }
                    else {
                        if ("value" in nodeData && state === graphai_1.NodeState.Waiting) {
                            // static node
                            elements.map[nodeId].data.color = colorStatic;
                        }
                    }
                    cytoscopeData.value = { elements: elements };
                    if (!(state === graphai_1.NodeState.Injected)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, graphai_1.sleep)(100)];
                case 3:
                    _b.sent();
                    elements.map[nodeId].data.color = colorStatic;
                    cytoscopeData.value = { elements: elements };
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var createCytoscope = function () {
        try {
            cy = (0, cytoscape_1.default)({
                container: cytoscopeRef.value,
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
    var updateGraphData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var name_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!cy) return [3 /*break*/, 2];
                    cy.elements().remove();
                    cy.add(cytoscopeData.value.elements);
                    name_1 = cytoscopeData.value.elements.nodes.reduce(function (prevName, node) {
                        if (node.position) {
                            return "preset";
                        }
                        return prevName;
                    }, layout);
                    console.log("layout", name_1);
                    cy.layout({ name: name_1 }).run();
                    cy.fit();
                    if (!(name_1 === layout)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, graphai_1.sleep)(400)];
                case 1:
                    _a.sent();
                    storePositions();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var storePositions = function () {
        console.log("storePositions");
        if (cy) {
            cy.nodes().forEach(function (cynode) {
                var id = cynode.id();
                var pos = cynode.position();
                var node = cytoscopeData.value.elements.map[id];
                node.position = pos;
            });
        }
    };
    var resetCytoscope = function () {
        var elements = cytoscopeData.value.elements;
        Object.keys(elements.map).forEach(function (nodeId) {
            var graph = selectedGraph.value;
            var nodeData = graph.nodes[nodeId];
            elements.map[nodeId].data.color = "value" in nodeData ? colorStatic : colorMap[graphai_1.NodeState.Waiting];
        });
        cytoscopeData.value = { elements: elements };
    };
    (0, vue_1.watch)(cytoscopeData, function () {
        console.log("updated");
        updateGraphData();
    });
    (0, vue_1.watch)(selectedGraph, function () {
        cytoscopeData.value = cytoscapeFromGraph(selectedGraph.value);
    });
    (0, vue_1.onMounted)(function () {
        createCytoscope();
        updateGraphData();
    });
    return {
        cytoscopeRef: cytoscopeRef,
        updateCytoscope: updateCytoscope,
        resetCytoscope: resetCytoscope,
    };
};
exports.useCytoscope = useCytoscope;
