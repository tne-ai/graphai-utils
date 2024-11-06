
// streamMockAgent client.
// npx ts-node -r tsconfig-paths/register test/stream_client.ts

import test from "node:test";
// import assert from "node:assert";

import { AgentFunctionContext } from "graphai";

import { DefaultEndOfStreamDelimiter } from "@/type";

async function* streamChatCompletion(url: string, postData: AgentFunctionContext & { agentId?: string }) {
  const { params, inputs, debugInfo, filterParams, agentId } = postData;
  const postBody = { params, inputs, debugInfo, filterParams, agentId };

  const completion = await fetch(url, {
    headers: {
      "Content-Type": "text/event-stream",
    },
    method: "POST",
    body: JSON.stringify(postBody),
  });

  const reader = completion.body?.getReader();

  if (completion.status !== 200 || !reader) {
    throw new Error("Request failed");
  }

  const decoder = new TextDecoder("utf-8");
  let done = false;
  while (!done) {
    const { done: readDone, value } = await reader.read();
    if (readDone) {
      done = readDone;
      reader.releaseLock();
    } else {
      const token = decoder.decode(value, { stream: true });
      yield token;
    }
  }
}

const streamingRequest = async (url: string, postData: AgentFunctionContext & { agentId?: string }) => {
  const generator = streamChatCompletion(url, postData);

  const messages = [];
  for await (const token of generator) {
    // callback to stream filter
    if (token) {
      messages.push(token);
      if (messages.join("").indexOf(DefaultEndOfStreamDelimiter) === -1) {
        console.log(token);
      }
    }
  }

  const payload_data = messages.join("").split(DefaultEndOfStreamDelimiter)[1];
  if (payload_data) {
    const data = JSON.parse(payload_data);
    console.log(data);
  }
};

test("test stream echo agent/client 1", async () => {
  // stream dispatcher
  await streamingRequest("http://localhost:8085/api/agents/stream/streamMockAgent", {
    params: {
      message: "this is test",
    },
    inputs: [],
    debugInfo: {
      verbose: false,
      nodeId: "123",
      retry: 2,
    },
    namedInputs: {},
    filterParams: {},
  });
});

test("test stream echo agent/client 2", async () => {
  // dispatcher
  await streamingRequest("http://localhost:8085/api/agents/streamMockAgent", {
    params: {
      message: "this is test",
    },
    inputs: [],
    debugInfo: {
      verbose: false,
      nodeId: "123",
      retry: 2,
    },
    namedInputs: {},
    filterParams: {},
  });
});

test("test stream echo agent/client 3", async () => {
  // dispatcher
  await streamingRequest("http://localhost:8085/api/agents/streamMockAgent/stream", {
    params: {
      message: "this is test",
    },
    inputs: [],
    debugInfo: {
      verbose: false,
      nodeId: "123",
      retry: 2,
    },
    namedInputs: {},
    filterParams: {},
  });
});

test("test stream echo agent/client 4", async () => {
  // runner
  await streamingRequest("http://localhost:8085/api/agents", {
    agentId: "streamMockAgent",
    params: {
      message: "this is test",
    },
    inputs: [],
    debugInfo: {
      verbose: false,
      nodeId: "123",
      retry: 2,
    },
    namedInputs: {},
    filterParams: {},
  });
});
