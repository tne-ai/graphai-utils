import express from "./express";
import type { AgentFunctionInfoDictionary, AgentFilterInfo } from "graphai";
export declare const agentsList: (agentDictionary: AgentFunctionInfoDictionary, hostName?: string, urlPath?: string) => (req: express.Request, res: express.Response) => Promise<void>;
export declare const agentDoc: (agentDictionary: AgentFunctionInfoDictionary, hostName?: string, urlPath?: string) => (req: express.Request, res: express.Response) => Promise<void>;
export declare const agentDispatcher: (agentDictionary: AgentFunctionInfoDictionary, agentFilters?: AgentFilterInfo[]) => (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
export declare const nonStreamAgentDispatcher: (agentDictionary: AgentFunctionInfoDictionary, agentFilters?: AgentFilterInfo[]) => (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
export declare const streamAgentDispatcher: (agentDictionary: AgentFunctionInfoDictionary, agentFilters?: AgentFilterInfo[]) => (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
