// echoAgent client.
// npx ts-node -r tsconfig-paths/register test/client.ts

import { AgentFunctionContext } from "graphai";

import test from "node:test";
import assert from "node:assert";

const request = async (url: string, postData: AgentFunctionContext) => {
  const { params, inputs, debugInfo, filterParams } = postData;
  const postBody = { params, inputs, debugInfo, filterParams };

  const result = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(postBody),
  });
  return await result.json();
};

const request2 = async (url: string, postData: any) => {
  const result = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(postData),
  });

  if (result.status === 200) {
    return await result.json();
  } else {
    return result.status;
    // return await result.text();
  }
};

test("test stream echo agent", async () => {
  const res = await request("http://localhost:8085/api/agents/echoAgent", {
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
  assert.deepStrictEqual(res, { message: "this is test" });
});

test("test nonstream echo agent", async () => {
  const res = await request("http://localhost:8085/api/agents/nonstream/echoAgent", {
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
  assert.deepStrictEqual(res, { message: "this is test" });
});

test("test graph", async () => {
  const res = await request2("http://localhost:8085/api/graph/", {
    graphData: {
      version: 0.5,
      nodes: {
        echo: {
          isResult: true,
          agent: "echoAgent",
          params: {
            message: "hello",
          },
        },
      },
    },
  });
  assert.deepStrictEqual(res, { echo: { message: "hello" } });
});

test("test 404", async () => {
  // 404
  const res = await request2("http://localhost:8085/api/gra/", {
    graphData: {
      version: 0.5,
      nodes: {
        echo: {
          agent: "echoAgent",
          params: {
            message: "hello",
          },
        },
      },
    },
  });
  assert.equal(res, 404);
});

test("test 500", async () => {
  const res = await request2("http://localhost:8085/api/graph/", {
    graphData: 123,
  });
  assert.equal(res, 500);
});
