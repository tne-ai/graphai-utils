
## GraphAI express middleware.

## Install

```
yarn add @receptron/graphai_express
```

## Usage

```TypeScript

import express from "express";
import * as agents from "@graphai/agents";
import { agentDispatcher, nonStreamAgentDispatcher, streamAgentDispatcher, agentsList, agentDoc, graphRunner} from "@receptron/graphai_express";
import { AgentFunctionInfoDictionary } from "graphai";

const agentDictionary: AgentFunctionInfoDictionary = agents;
const hostName = "https://example.net";
const apiAgentPrefix = "/api/agents";
const apiGraphPrefix = "/api/graph";

app.get(apiAgentPrefix + "/:agentId", agentDoc(agentDictionary, hostName, apiAgentPrefix)); // each API(agent) document
app.get(apiAgentPrefix + "/", agentsList(agentDictionary, hostName, apiAgentPrefix));  // API(agent) list

// non stream and stream agent server
app.post(apiAgentPrefix + "/:agentId", agentDispatcher(agentDictionary));

// non stream agent server
app.post(apiAgentPrefix + "/nonstream/:agentId", nonStreamAgentDispatcher(agentDictionary));

// stream agent server
app.post(apiAgentPrefix + "/stream/:agentId", streamAgentDispatcher(agentDictionary));

// non stream and stream agent server
app.post(apiGraphPrefix + "/", graphRunner(agentDictionary));


```

### Run Test server

```
yarn run server
```


### Test from curl

```
curl -X POST -H "Content-Type: application/json" -d '{"params": {"message" : "hello"}}' http://localhost:8085/api/agents/echoAgent
```

### from GraphAI Client

```
npx ts-node  test/stream_graph.ts
```

### for this middleware development

```
git clone https://github.com/receptron/graphai_utils
cd packages/express
yarn install
yarn run server # then run test express server
yarn run test_stream
```

