
## GraphAI firebase function stream runner

## Install

```
yarn add @receptron/graphai_firebase_functions
```

## Usage

```TypeScript
import { openAIAgent } from "@graphai/openai_agent";
import { CallableRequest, CallableResponse, HttpsError } from "firebase-functions/v2/https";
import type { AgentFunctionContext, AgentFunctionInfoDictionary } from "graphai";

import { StreamChunkCallback, runAgentOnCall } from "@receptron/graphai_firebase_functions";

const agentDictionary: AgentFunctionInfoDictionary = {
  openAIAgent,
};

export const agentRunner = async (request: CallableRequest, response?: CallableResponse) => {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }

  const streamCallback: StreamChunkCallback = (context: AgentFunctionContext, token: string) => {
    response?.sendChunk({
      delta: token,
      type: "agent",
      nodeId: context.debugInfo.nodeId,
      agentId: context.debugInfo.agentId,
    });
  };

  return await runAgentOnCall(request, agentDictionary, { streamCallback });
};
```