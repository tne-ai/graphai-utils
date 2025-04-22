import express from "express";
import type { GraphDictionary } from "./type";
export declare const modelList: (modelDictionary: GraphDictionary) => (req: express.Request, res: express.Response) => Promise<void>;
