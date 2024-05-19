
## GraphAI express middleware.

## Install

```
yarn add @receptron/graphai_express
```

## Usage

```TypeScript

import express from "express";
import { agentDispatcher, streamAgentDispatcher, agentsList, agentDoc } from "@receptron/graphai_express";

const hostName = "https://example.net";
const apiPrefix = "/api/agents";

app.get(apiPrefix + "/:agentId", agentDoc(hostName, apiPrefix)); // each API(agent) document
app.get(apiPrefix + "/", agentsList(hostName, apiPrefix));  // API(agent) list

//  non stream
app.post(apiPrefix + "/:agentId", agentDispatcher()); // dispatch agents

//  stream
app.post(apiPrefix + "/stream/:agentId", streamAgentDispatcher());

```


### from curl.

T.B.D.

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

