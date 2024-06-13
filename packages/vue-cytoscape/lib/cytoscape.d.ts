import { Ref, ComputedRef } from "vue";
import { GraphData, NodeState } from "graphai";
export declare const useCytoscape: (selectedGraph: ComputedRef<GraphData> | Ref<GraphData>) => {
    cytoscapeRef: Ref<any>;
    updateCytoscape: (nodeId: string, state: NodeState) => Promise<void>;
    resetCytoscape: () => void;
};
