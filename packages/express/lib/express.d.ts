import express from "./express";
import { AgentFilterInfo } from "graphai/lib/type";
export declare const agentsList: (hostName?: string, urlPath?: string) => (req: express.Request, res: express.Response) => Promise<void>;
export declare const agentDoc: (hostName?: string, urlPath?: string) => (req: express.Request, res: express.Response) => Promise<void>;
export declare const agentDispatcher: (agentFilters?: AgentFilterInfo[]) => (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
export declare const streamAgentDispatcher: (agentFilters?: AgentFilterInfo[]) => (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
