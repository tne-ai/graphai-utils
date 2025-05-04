// express server example
import "dotenv/config";

import express from "express";
import type { AgentFunctionInfoDictionary, TransactionLog } from "graphai";

import * as agents from "@graphai/agents";
import { llmGraphData, graphDictonary } from "./graph_data";

import {
  agentDispatcher,
  agentRunner,
  streamAgentDispatcher,
  nonStreamAgentDispatcher,
  agentsList,
  agentDoc,
  graphRunner,
  StreamChunkCallback,
  ContentCallback,
  updateAgentVerbose,
  completionRunner,
  modelList,
} from "@/index";

updateAgentVerbose(true);

import cors from "cors";

const agentDictionary: AgentFunctionInfoDictionary = agents;

const hostName = "https://example.net";
const apiPrefix = "/api/agents";
const apiGraphPrefix = "/api/graph";

export const app = express();

app.use(
  express.json({
    type(__req) {
      return true;
    },
  }),
);
app.use(cors());

const streamChunkCallback: StreamChunkCallback = (context, token) => {
  const data = {
    type: "agent",
    nodeId: context.debugInfo.nodeId,
    agentId: context.debugInfo.agentId,
    token,
  };
  return JSON.stringify(data);
};

const contentCallback: ContentCallback = (data) => {
  return JSON.stringify({
    type: "content",
    data,
  });
};

const onLogCallback = (log: TransactionLog, __isUpdate: boolean) => {
  console.log(log);
};

const model2graphData = (__model: string) => {
  return llmGraphData;
};

app.get(apiPrefix + "/:agentId", agentDoc(agentDictionary, hostName, apiPrefix));
app.get(apiPrefix + "/", agentsList(agentDictionary, hostName, apiPrefix));

// agent
app.post(apiPrefix + "/", agentRunner(agentDictionary));

// agent
app.post(apiPrefix + "/:agentId", agentDispatcher(agentDictionary));

app.post(apiPrefix + "/:agentId/stream", agentDispatcher(agentDictionary, [], streamChunkCallback));

// agent non stream
app.post(apiPrefix + "/nonstream/:agentId", nonStreamAgentDispatcher(agentDictionary));
// agent stream
app.post(apiPrefix + "/stream/:agentId", streamAgentDispatcher(agentDictionary));

// graph
app.post(apiGraphPrefix + "/", graphRunner(agentDictionary, [], streamChunkCallback, contentCallback, ""));

app.post(apiGraphPrefix + "/stream", graphRunner(agentDictionary, [], streamChunkCallback, contentCallback, "", onLogCallback));

app.post("/v1/api/chat/completions", completionRunner(agentDictionary, model2graphData, [], onLogCallback));
app.get("/v1/api/models", modelList(graphDictonary));

app.use((err: any, req: express.Request, res: express.Response, __next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500);
  res.json({});
});

const port = process.env.PORT || 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
