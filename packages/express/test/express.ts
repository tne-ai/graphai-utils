// express server example
import "dotenv/config";

import express from "express";
import type { AgentFunctionInfoDictionary } from "graphai";

import * as agents from "@graphai/agents";

import { agentDispatcher, agentRunner, streamAgentDispatcher, nonStreamAgentDispatcher, agentsList, agentDoc, graphRunner, StreamChunkCallback } from "@/index";

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

const streamChunkCallback: StreamChunkCallback = (context, token) => {
  const data = {
    nodeId: context.debugInfo.nodeId,
    agentId: context.debugInfo.agentId,
    token,
  };
  return JSON.stringify(data);
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
app.post(apiGraphPrefix + "/", graphRunner(agentDictionary));

app.post(apiGraphPrefix + "/stream", graphRunner(agentDictionary, [], streamChunkCallback));

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
