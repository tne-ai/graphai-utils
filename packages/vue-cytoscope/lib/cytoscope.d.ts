import { Ref, ComputedRef } from "vue";
import { GraphData, NodeState } from "graphai";
export declare const useCytoscope: (selectedGraph: ComputedRef<GraphData> | Ref<GraphData>) => {
    cytoscopeRef: Ref<any>;
    updateCytoscope: (nodeId: string, state: NodeState) => Promise<void>;
    resetCytoscope: () => void;
};
