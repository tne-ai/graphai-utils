// express server example
import "dotenv/config";

import express from "express";
import type { AgentFunctionInfoDictionary } from "graphai";

import * as agents from "@graphai/agents";

import { agentDispatcher, agentRunner, streamAgentDispatcher, nonStreamAgentDispatcher, agentsList, agentDoc, graphRunner } from "@/index";

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

app.post(apiPrefix + "/:agentId", agentDispatcher(agentDictionary));

app.get(apiPrefix + "/:agentId", agentDoc(agentDictionary, hostName, apiPrefix));
app.get(apiPrefix + "/", agentsList(agentDictionary, hostName, apiPrefix));

app.post(apiPrefix + "/", agentRunner(agentDictionary));

//  non stream
app.post(apiPrefix + "/nonstream/:agentId", nonStreamAgentDispatcher(agentDictionary));
//  stream
app.post(apiPrefix + "/stream/:agentId", streamAgentDispatcher(agentDictionary));

app.post(apiGraphPrefix + "/", graphRunner(agentDictionary));

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
