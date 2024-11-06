import { Ref, ComputedRef } from "vue";
import { GraphData, NodeState } from "graphai";
import { DataSource } from "graphai/lib/type";
export declare const inputs2dataSources: (inputs: any) => string[];
export declare const dataSourceNodeIds: (sources: DataSource[]) => string[];
export declare const useCytoscape: (selectedGraph: ComputedRef<GraphData> | Ref<GraphData>) => {
    cytoscapeRef: Ref<any, any>;
    updateCytoscape: (nodeId: string, state: NodeState) => Promise<void>;
    resetCytoscape: () => void;
};
