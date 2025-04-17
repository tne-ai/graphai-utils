// express server example
import "dotenv/config";

import express from "express";
import type { AgentFunctionInfoDictionary, TransactionLog } from "graphai";

import * as agents from "@graphai/agents";

import {
  agentDispatcher,
  agentRunner,
  streamAgentDispatcher,
  nonStreamAgentDispatcher,
  agentsList,
  agentDoc,
  graphRunner,
  StreamChunkCallback,
  ContentCallback,
  updateAgentVerbose,
  completionRunner,
} from "@/index";

updateAgentVerbose(true);

import cors from "cors";

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
app.use(cors());

const streamChunkCallback: StreamChunkCallback = (context, token) => {
  const data = {
    type: "agent",
    nodeId: context.debugInfo.nodeId,
    agentId: context.debugInfo.agentId,
    token,
  };
  return JSON.stringify(data);
};

const streamCompletionChunkCallback: StreamChunkCallback = (context, token, status) => {
  const data = {
    id: "chatcmpl-123",
    object: "chat.completion.chunk",
    created: 1694268190,
    model: "gpt-4o-mini",
    system_fingerprint: "fp_44709d6fcb",
    choices: [
      {
        index: 0,
        delta: { content: "Hello" },
        logprobs: null,
        finish_reason: null,
      },
    ],
  };
  console.log("data:" + JSON.stringify(data) + "\n");
  if (status === "start") {
    const a = {
      id: "chatcmpl-123",
      object: "chat.completion.chunk",
      created: 1694268190,
      model: "gpt-4o-mini",
      system_fingerprint: "fp_44709d6fcb",
      choices: [
        { index: 0, delta: { role: "assistant", content: "" }, logprobs: null, finish_reason: null }
      ],
    };
    return "data: " +  JSON.stringify(a)  + "\n\n";
  }
  if (status === "end2") {
    return "data: [DONE]\n\n";
  }
  if (status === "end") {
    const c = {
      id: "chatcmpl-123",
      object: "chat.completion.chunk",
      created: 1694268190,
      model: "gpt-4o-mini",
      system_fingerprint: "fp_44709d6fcb",
      choices: [{ index: 0, delta: {}, logprobs: null, finish_reason: "stop" }],
    };
    return "data: " + JSON.stringify(c) + "\n\n";
  }
  const b = {
    id: "chatcmpl-123",
    object: "chat.completion.chunk",
    created: 1694268190,
    model: "gpt-4o-mini",
    system_fingerprint: "fp_44709d6fcb",
    choices: [{ index: 0, delta: { content: token }, logprobs: null, finish_reason: null }],
  };
  return "data: " + JSON.stringify(b) + "\n\n";
  
  //return "data:" + JSON.stringify(data);
};

const contentCallback: ContentCallback = (data) => {
  return JSON.stringify({
    type: "content",
    data,
  });
};

const onLogCallback = (log: TransactionLog, __isUpdate: boolean) => {
  console.log(log);
};

app.get(apiPrefix + "/:agentId", agentDoc(agentDictionary, hostName, apiPrefix));
app.get(apiPrefix + "/", agentsList(agentDictionary, hostName, apiPrefix));

// agent
app.post(apiPrefix + "/", agentRunner(agentDictionary));

// agent
app.post(apiPrefix + "/:agentId", agentDispatcher(agentDictionary));

app.post(apiPrefix + "/:agentId/stream", agentDispatcher(agentDictionary, [], streamChunkCallback));

// agent non stream
app.post(apiPrefix + "/nonstream/:agentId", nonStreamAgentDispatcher(agentDictionary));
// agent stream
app.post(apiPrefix + "/stream/:agentId", streamAgentDispatcher(agentDictionary));

// graph
app.post(apiGraphPrefix + "/", graphRunner(agentDictionary, [], streamChunkCallback, contentCallback, ""));

app.post(apiGraphPrefix + "/stream", graphRunner(agentDictionary, [], streamChunkCallback, contentCallback, "", onLogCallback));

app.post("/api/chat/completions", completionRunner(agentDictionary, [], streamCompletionChunkCallback, onLogCallback));

app.use((err: any, req: express.Request, res: express.Response, __next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500);
  res.json({});
});

const port = 8085;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
