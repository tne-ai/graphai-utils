// echoAgent client.
// npx ts-node -r tsconfig-paths/register test/client.ts

import { AgentFunctionContext } from "graphai";

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

const request2 = async (url: string, postData: any) => {
  const result = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(postData),
  });

  if (result.status === 200) {
    console.log(await result.json());
  } else {
    console.log(result.status);
    console.log(await result.text());
  }
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
    namedInputs: {},
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
    namedInputs: {},
    filterParams: {},
  });

  await request2("http://localhost:8085/api/graph/", {
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

  // 404
  await request2("http://localhost:8085/api/gra/", {
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

  await request2("http://localhost:8085/api/graph/", {
    graph: {
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

  await request2("http://localhost:8085/api/graph/", {
    graphData: 123,
  });
};

main();
