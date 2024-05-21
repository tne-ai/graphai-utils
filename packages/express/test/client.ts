// echoAgent client.
// npx ts-node -r tsconfig-paths/register test/client.ts

import { AgentFunctionContext } from "graphai/lib/type";

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

  console.log(await result.json());
};

const main = async () => {
  await request("http://localhost:8085/api/agents/echoAgent", {
    params: {
      message: "this is test",
    },
    inputs: [],
    debugInfo: {
      verbose: false,
      nodeId: "123",
      retry: 2,
    },
    filterParams: {},
  });
  await request("http://localhost:8085/api/agents/nonstream/echoAgent", {
    params: {
      message: "this is test",
    },
    inputs: [],
    debugInfo: {
      verbose: false,
      nodeId: "123",
      retry: 2,
    },
    filterParams: {},
  });
};

main();
