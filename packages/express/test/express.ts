// express server example
import "dotenv/config";
import express from "express";

import { agentDispatcher, streamAgentDispatcher, agentsList, agentDoc } from "@/express";

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
app.post(apiPrefix + "/:agentId", agentDispatcher());
app.get(apiPrefix + "/:agentId", agentDoc(hostName, apiPrefix));
app.get(apiPrefix + "/", agentsList(hostName, apiPrefix));

//  stream
app.post(apiPrefix + "/stream/:agentId", streamAgentDispatcher());

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
