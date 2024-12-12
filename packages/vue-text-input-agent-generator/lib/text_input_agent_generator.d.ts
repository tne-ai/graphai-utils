import { AgentFunction } from "graphai";
export declare const textInputAgentGenerator: () => {
    textInputAgent: {
        name: string;
        samples: {
            inputs: never[];
            params: {};
            result: {};
        }[];
        description: string;
        category: never[];
        author: string;
        repository: string;
        license: string;
        agent: AgentFunction<any, any, any>;
        mock: AgentFunction<any, any, any>;
    };
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
