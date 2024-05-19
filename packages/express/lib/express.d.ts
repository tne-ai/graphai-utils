import express from "./express";
export declare const agentDoc: (hostName?: string, urlPath?: string) => (req: express.Request, res: express.Response) => Promise<void>;
export declare const agentDispatcher: (req: express.Request, res: express.Response) => Promise<void>;
export declare const agentsList: (hostName?: string, urlPath?: string) => (req: express.Request, res: express.Response) => Promise<void>;
