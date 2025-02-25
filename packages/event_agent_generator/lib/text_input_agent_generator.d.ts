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
    textInputAgent: import("graphai").AgentFunctionInfo;
    submit: (id: string, value: string, success?: () => void) => void;
};
