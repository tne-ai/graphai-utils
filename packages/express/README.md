
## GraphAI express middleware.

## Usage

```

import express from "express";
import { agentDispatcher, agentsList, agentDoc } from "@/express";

const hostName = "https://example.net";
const apiPrefix = "/api/agents";

app.post(apiPrefix + "/:agentId", agentDispatcher); // dispatch agents
app.get(apiPrefix + "/:agentId", agentDoc(hostName, apiPrefix)); // each API(agent) document
app.get(apiPrefix + "/", agentsList(hostName, apiPrefix));  // API(agent) list

```


### from curl.

T.B.D.

### from GraphAI Client

T.B.D.
