import "dotenv/config";
import express from "express";

import { agentDispatcher, agentsList, agentDoc } from "@/express";

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

app.post(apiPrefix + "/:agentId", agentDispatcher);
app.get(apiPrefix + "/:agentId", agentDoc(hostName, apiPrefix));
app.get(apiPrefix + "/", agentsList(hostName, apiPrefix));

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
