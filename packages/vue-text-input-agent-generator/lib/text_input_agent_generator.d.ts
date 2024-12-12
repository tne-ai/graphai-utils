import { AgentFunction } from "graphai";
export declare const textInputAgentGenerator: () => {
    textInputAgent: AgentFunction;
    inputPromises: import("vue").Ref<{
        task: (message: string) => void;
        id: string;
        nodeId: string;
        agentId?: string;
        params: any;
    }[], {
        task: (message: string) => void;
        id: string;
        nodeId: string;
        agentId?: string;
        params: any;
    }[] | {
        task: (message: string) => void;
        id: string;
        nodeId: string;
        agentId?: string;
        params: any;
    }[]>;
    submit: (id: string, value: string, success?: () => void) => void;
};
