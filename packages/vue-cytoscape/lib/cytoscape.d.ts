import { Ref, ComputedRef } from "vue";
import { GraphData, TransactionLog } from "graphai";
import { DataSource } from "graphai/lib/type";
export declare const inputs2dataSources: (inputs: any) => string[];
export declare const dataSourceNodeIds: (sources: DataSource[]) => string[];
export declare const useCytoscape: (selectedGraph: ComputedRef<GraphData> | Ref<GraphData>) => {
    cytoscapeRef: Ref<any, any>;
    updateCytoscape: (log: TransactionLog) => Promise<void>;
    resetCytoscape: () => void;
    layoutCytoscape: (key: string) => void;
    loadLayout: (key: string) => void;
    zoomingEnabled: Ref<boolean, boolean>;
};
