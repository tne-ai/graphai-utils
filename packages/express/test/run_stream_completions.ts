// streamMockAgent client.
// npx ts-node -r tsconfig-paths/register test/test_stream_completions.ts

import test from "node:test";

import { DefaultEndOfStreamDelimiter } from "@/type";

async function* streamChatCompletion(url: string, postData: any) {
  const completion = await fetch(url, {
    headers: {
      "Content-Type": "text/event-stream",
    },
    method: "POST",
    body: JSON.stringify(postData),
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

const streamingRequest = async (url: string, postData: any, messages: string[]) => {
  const generator = streamChatCompletion(url, postData);

  for await (const token of generator) {
    // callback to stream filter
    if (token) {
      messages.push(token);
      if (messages.join("").indexOf(DefaultEndOfStreamDelimiter) === -1) {
        console.log(token);
      }
    }
  }
  const last = messages[messages.length - 1] as any;
  console.log(last);
};

const body = {
  model: "gpt-4.1",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "How can I travel to Mars?",
        },
      ],
    },
  ],
  max_tokens: 300,
};

test("test stream echo agent graph 1", async () => {
  // stream dispatcher
  const messages: string[] = [];
  await streamingRequest("http://localhost:8085/api/chat/completions", body, messages);
});
