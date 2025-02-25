export type EventData = {
    onEnd: (data: unknown) => void;
    id: string;
    nodeId: string;
    agentId?: string;
    type: string;
    params: any;
    namedInputs: any;
};
export declare const eventAgentGenerator: (onStart: (id: string, data: EventData) => void) => {
    eventAgent: import("graphai").AgentFunctionInfo;
};
