// express server example
import "dotenv/config";

import express from "express";
import type { AgentFunctionInfoDictionary } from "graphai";

import * as agents from "@graphai/agents";

import { agentDispatcher, streamAgentDispatcher, nonStreamAgentDispatcher, agentsList, agentDoc } from "@/express";

const agentDictionary: AgentFunctionInfoDictionary = agents;

const hostName = "https://example.net";
const apiPrefix = "/api/agents";

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

//  non stream
app.post(apiPrefix + "/nonstream/:agentId", nonStreamAgentDispatcher(agentDictionary));
//  stream
app.post(apiPrefix + "/stream/:agentId", streamAgentDispatcher(agentDictionary));

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
