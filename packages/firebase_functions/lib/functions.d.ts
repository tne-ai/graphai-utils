import type { CallableRequest } from "firebase-functions/v2/https";
import type { AgentFunctionContext, AgentFunctionInfoDictionary, AgentFilterInfo } from "graphai";
export type StreamChunkCallback = (context: AgentFunctionContext, token: string) => void;
export declare const runAgentOnCall: (request: CallableRequest, agents: AgentFunctionInfoDictionary, options?: {
    agentFilters?: AgentFilterInfo[];
    streamCallback?: StreamChunkCallback;
    isDebug?: boolean;
}) => Promise<import("graphai").ResultData>;
