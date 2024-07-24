import { GraphAI } from "graphai";
import express from "express";

import type { AgentFunctionInfoDictionary, AgentFilterInfo, AgentFunctionContext } from "graphai";
import { streamAgentFilterGenerator } from "@graphai/agent_filters";

export const graphRunner = (agentDictionary: AgentFunctionInfoDictionary, agentFilters: AgentFilterInfo[] = []) => {
  const stream = streamGraphRunner(agentDictionary, agentFilters);
  const nonStream = nonStreamGraphRunner(agentDictionary, agentFilters);

  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isStreaming = (req.headers["content-type"] || "").startsWith("text/event-stream");
    if (isStreaming) {
      return await stream(req, res, next);
    }
    return await nonStream(req, res, next);
  };
};

export const streamGraphRunner = (agentDictionary: AgentFunctionInfoDictionary, agentFilters: AgentFilterInfo[] = []) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");

      const callback = (context: AgentFunctionContext, token: string) => {
        if (token) {
          res.write(token);
        }
      };
      const streamAgentFilter = {
        name: "streamAgentFilter",
        agent: streamAgentFilterGenerator<string>(callback),
      };
      const filterList = [...agentFilters, streamAgentFilter];

      const dispatcher = streamGraphRunnerInternal(agentDictionary, filterList);
      const result = await dispatcher(req, res);

      const json_data = JSON.stringify(result);
      res.write("___END___");
      res.write(json_data);
      return res.end();
    } catch (e) {
      next(e);
    }
  };
};

export const nonStreamGraphRunner = (agentDictionary: AgentFunctionInfoDictionary, agentFilters: AgentFilterInfo[] = []) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const dispatcher = streamGraphRunnerInternal(agentDictionary, agentFilters);
      const result = await dispatcher(req, res);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  };
};

// internal function
const streamGraphRunnerInternal = (agentDictionary: AgentFunctionInfoDictionary, agentFilters: AgentFilterInfo[] = []) => {
  return async (req: express.Request, __res: express.Response) => {
    const { graphData } = req.body;

    const graphai = new GraphAI(graphData, agentDictionary, { agentFilters });
    const result = await graphai.run(true);
    return result;
  };
};
