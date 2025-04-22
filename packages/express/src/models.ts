import express from "express";
import type { GraphDictionary } from "./type";

export const modelList = (modelDictionary: GraphDictionary) => {
  return async (req: express.Request, res: express.Response) => {
    const data = Object.keys(modelDictionary).map((id) => {
      const model = modelDictionary[id];
      return {
        id,
        object: "model",
        created: 1686935002,
        owned_by: "graphai",
      };
    });
    res.json({ object: "list", data });
  };
};
