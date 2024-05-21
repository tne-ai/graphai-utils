// express server example
import "dotenv/config";

import express from "express";
import * as agents from "graphai/lib/experimental_agents";

import { agentDispatcher, streamAgentDispatcher, agentsList, agentDoc } from "@/express";

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

//  non stream
app.post(apiPrefix + "/:agentId", agentDispatcher(agentDictionary));
app.get(apiPrefix + "/:agentId", agentDoc(agentDictionary, hostName, apiPrefix));
app.get(apiPrefix + "/", agentsList(agentDictionary, hostName, apiPrefix));

//  stream
app.post(apiPrefix + "/stream/:agentId", streamAgentDispatcher(agentDictionary));

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
