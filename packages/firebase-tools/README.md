# GraphAI Firebase web tools


Call agents with streaming support by combining Firebase Functions with @receptron/graphai_firebase_functions.

## Install

```
yarn add @receptron/firebase-tools
```

## Usage

```TypeScript
  import { buildFirebaseStreamFilter } from "@receptron/firebase-tools";
  
  const { firebaseStreamFilter } = buildFirebaseStreamFilter(firebaseApp, "asia-northeast1", "agent");

  const agentFilters: AgentFilterInfo[] = [
    {
      name: "streamAgentFilter",
      agent: streamAgentFilter,
    },
    {
      name: "firebaseStreamFilter",
      agent: firebaseStreamFilter,
      agentIds: ["openAIAgent"],
    }
  ];
  const graphai = new GraphAI(
    graphData,
    agents,
    {
      agentFilters,
    }
  );
```
