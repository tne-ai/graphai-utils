import { AgentFunction } from "graphai";
export type EventData = {
    onEnd: (data: unknown) => void;
    id: string;
    nodeId: string;
    agentId?: string;
    type: string;
    params: any;
};
export declare const eventAgentGenerator: (onStart: (id: string, data: EventData) => void) => {
    eventAgent: {
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
};
