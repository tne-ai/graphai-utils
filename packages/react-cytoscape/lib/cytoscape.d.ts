import { GraphData } from "graphai";
export declare const inputs2dataSources: (inputs: any) => string[];
export declare const useCytoscape: (selectedGraph: GraphData) => {
    cytoscapeRef: any;
    updateCytoscape: any;
    resetCytoscape: () => void;
};
