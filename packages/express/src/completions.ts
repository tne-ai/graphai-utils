import { GraphAI } from "graphai";
import express from "express";
import { streamAgentFilterGenerator } from "@graphai/agent_filters";

import type { AgentFunctionInfoDictionary, AgentFilterInfo, TransactionLog } from "graphai";
import type { ConfigDataDictionary } from "graphai/lib/type";
import type { StreamChunkCallback } from "./type";

const graphData = {
  version: 0.5,
  nodes: {
    messages: {
      value: [],
    },
    llm: {
      agent: "openAIAgent",
      params: {
        stream: true,
        isResult: true,
      },
      inputs: {
        messages: ":messages",
      },
      isResult: true,
    },
  },
};

export const completionRunner = (
  agentDictionary: AgentFunctionInfoDictionary,
  agentFilters: AgentFilterInfo[] = [],
  streamChunkCallback?: StreamChunkCallback,
  onLogCallback = (__log: TransactionLog, __isUpdate: boolean) => {},
) => {
  const stream = streamGraphRunner(agentDictionary, agentFilters, streamChunkCallback, onLogCallback);
  const nonStream = nonStreamGraphRunner(agentDictionary, agentFilters, onLogCallback);

  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isStreaming = (req.headers["content-type"] || "").startsWith("text/event-stream") || true; // TODO
    if (isStreaming) {
      return await stream(req, res, next);
    }
    return await nonStream(req, res, next);
  };
};

const streamGraphRunner = (
  agentDictionary: AgentFunctionInfoDictionary,
  agentFilters: AgentFilterInfo[] = [],
  streamChunkCallback?: StreamChunkCallback,
  onLogCallback = (__log: TransactionLog, __isUpdate: boolean) => {},
) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      const streamCallback: StreamChunkCallback = (context, token) => {
        if (token) {
          if (streamChunkCallback) {
            res.write(streamChunkCallback(context, token, "payload"));
          } else {
            res.write(token);
          }
        }
      };
      const streamAgentFilter = {
        name: "streamAgentFilter",
        agent: streamAgentFilterGenerator<string>(streamCallback),
      };
      const filterList = [...agentFilters, streamAgentFilter];

      if (streamChunkCallback) {
        res.write(streamChunkCallback({} as any, "", "start"));
      }
      const dispatcher = streamGraphRunnerInternal(agentDictionary, filterList, onLogCallback);
      await dispatcher(req);

      if (streamChunkCallback) {
        res.write(streamChunkCallback({} as any, "", "end"));
        res.write(streamChunkCallback({} as any, "", "end2"));
      }
      return res.end();
    } catch (e) {
      next(e);
    }
  };
};

const nonStreamGraphRunner = (
  agentDictionary: AgentFunctionInfoDictionary,
  agentFilters: AgentFilterInfo[] = [],
  onLogCallback = (__log: TransactionLog, __isUpdate: boolean) => {},
) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const dispatcher = streamGraphRunnerInternal(agentDictionary, agentFilters, onLogCallback);
      const result = await dispatcher(req);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  };
};

// internal function
const streamGraphRunnerInternal = (
  agentDictionary: AgentFunctionInfoDictionary,
  agentFilters: AgentFilterInfo[] = [],
  onLogCallback = (__log: TransactionLog, __isUpdate: boolean) => {},
) => {
  return async (req: express.Request & { config?: ConfigDataDictionary }) => {
    const { messages } = req.body;
    const { config } = req;

    const graphai = new GraphAI(graphData, agentDictionary, { agentFilters, config: config ?? {} });
    // injectValue
    graphai.injectValue("messages", messages);
    graphai.onLogCallback = onLogCallback;
    const result = await graphai.run();
    return result;
  };
};
