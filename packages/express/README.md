
## GraphAI express middleware.

## Install

```
yarn add @receptron/graphai_express
```

## Usage

```TypeScript

import express from "express";
import * as agents from "graphai/lib/experimental_agents";
import { agentDispatcher, streamAgentDispatcher, agentsList, agentDoc } from "@receptron/graphai_express";
import { AgentFunctionInfoDictionary } from "graphai";

const agentDictionary: AgentFunctionInfoDictionary = agents;
const hostName = "https://example.net";
const apiPrefix = "/api/agents";

app.get(apiPrefix + "/:agentId", agentDoc(agentDictionary, hostName, apiPrefix)); // each API(agent) document
app.get(apiPrefix + "/", agentsList(agentDictionary, hostName, apiPrefix));  // API(agent) list

//  non stream
app.post(apiPrefix + "/:agentId", agentDispatcher(agentDictionary)); // dispatch agents

//  stream
app.post(apiPrefix + "/stream/:agentId", streamAgentDispatcher(agentDictionary));

```


### Test from curl

```
curl -X POST -H "Content-Type: application/json" -d '{"params": {"message" : "hello"}}' http://localhost:8085/api/agents/echoAgent
```

### from GraphAI Client

T.B.D.


### for this middleware development

```
git clone https://github.com/receptron/graphai_utils
cd packages/express
yarn install
yarn run server # then run test express server
yarn run test_stream
```

