import { AgentFunction } from "graphai";
export declare const textInputAgentGenerator: (inputPromises: {
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
        agent: AgentFunction<any, any, any>;
        mock: AgentFunction<any, any, any>;
    };
    submit: (id: string, value: string, success?: () => void) => void;
};
