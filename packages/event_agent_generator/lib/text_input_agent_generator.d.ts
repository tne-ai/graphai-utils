import { AgentFunction } from "graphai";
export type InputEvents = {
    task: (message: string) => void;
    id: string;
    nodeId: string;
    agentId?: string;
    params: any;
}[];
export declare const textInputAgentGenerator: (inputEvents: {
    task: (message: string) => void;
    id: string;
    nodeId: string;
    agentId?: string;
    params: any;
}[]) => {
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
        agent: AgentFunction<any, any, any, any>;
        mock: AgentFunction<any, any, any, any>;
    };
    submit: (id: string, value: string, success?: () => void) => void;
};
