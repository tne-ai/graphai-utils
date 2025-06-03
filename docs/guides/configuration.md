# Configuration Guide

This guide explains how to configure various GraphAI Utils packages for different scenarios. Proper configuration is key to leveraging the full power of these tools.

## Core GraphAI Configuration (`GraphAIConfig`)

All GraphAI applications, whether using Express, Firebase, or visualization tools, rely on a central `GraphAIConfig` object. This object defines your AI workflow.

```typescript
import { GraphAIConfig } from 'graphai';

const myWorkflowConfig: GraphAIConfig = {
  // version: 0.2, // Optional: specify config version for advanced features
  globals: { // Optional: global values accessible by all nodes
    defaultModel: "gpt-3.5-turbo",
    commonErrorMessage: "An error occurred."
  },
  nodes: {
    nodeId1: {
      agent: "agentName", // Registered agent function ID
      params: { /* static parameters for the agent */ },
      inputs: [":anotherNodeId", /* or named inputs */ { inputName: ":sourceNodeId.property" }],
      // Optional properties:
      // retry: 3,
      // timeout: 5000, // in milliseconds
      // bypass: "${globals.someCondition}", // Conditional bypass
      // onError: { /* error handling configuration */ },
      // nestedGraph: { /* sub-graph configuration */ }
    },
    // ... more nodes
  },
  // Optional: Define entry and exit points if not implicitly clear
  // entry: "nodeIdStart", 
  // exit: "nodeIdEnd"
};
```

-   **`globals`**: Values accessible throughout the graph via `${globals.key}`.
-   **`nodes`**: The core of the workflow. Each key is a unique node ID.
    -   `agent`: The string ID of a registered agent function.
    -   `params`: Static configuration passed to the agent. Can use `${...}` for dynamic values from inputs or globals.
    -   `inputs`: An array or object specifying data sources for the agent.
        -   Positional: `":nodeId"` (output of `nodeId`), `":$0"` (graph's 0th input).
        -   Named: `{ myInputName: ":nodeId.someProperty" }`.
        -   Static: `{ staticValue: "hello" }`.
    -   `retry`, `timeout`, `bypass`, `onError`, `nestedGraph`: Advanced node controls.

## `@receptron/graphai_express` Configuration

This package transforms GraphAI into an Express middleware, often for OpenAI API compatibility.

```typescript
import { graphai_express, GraphAIExpressConfig } from '@receptron/graphai_express';
import { Request } from 'express'; // For typing transformRequest

const expressGraphConfig: GraphAIExpressConfig = {
  // Option 1: Single graph for all requests
  graphConfig: myWorkflowConfig, 

  // Option 2: Dynamic graph based on request (e.g., model name)
  // getGraphConfig: (req: Request) => {
  //   if (req.body.model === "special-model") return specialWorkflowConfig;
  //   return defaultWorkflowConfig;
  // },

  // Enable streaming if your graph's exit node produces a stream
  streaming: true, 
  // Provide a specific graph config for streaming if different
  // streamingConfig: myStreamingWorkflowConfig, 
  // getStreamingConfig: (req: Request) => myStreamingWorkflowConfig,

  // Transform incoming HTTP request to fit your graph's entry node
  transformRequest: (req: Request) => {
    // Example for OpenAI chat completions
    const { messages, model, temperature, max_tokens, stream } = req.body;
    const lastUserMessage = messages?.filter((m: any) => m.role === 'user').pop();
    return {
      // This object is passed as input to the graph's entry node(s)
      // or as the $0 input if the graph takes a single object.
      // For textInputAgent, you might pass:
      // { value: lastUserMessage?.content }
      // Or for functionInputAgent:
      // [lastUserMessage?.content, { model, temperature, stream }]
      
      // Example structure for a graph expecting specific inputs:
      prompt: lastUserMessage?.content,
      options: { model, temperature, max_tokens, stream },
      allMessages: messages 
    };
  },

  // Transform GraphAI's output before sending HTTP response (optional)
  // graphai_express provides default OpenAI-compatible formatting.
  transformResponse: (graphAIResult: any, req: Request) => {
    // If graphAIResult is a string, it becomes content of assistant's message.
    // If it's an object, it might be merged or used directly.
    return {
      // custom_field: "my_value",
      ...graphAIResult // if graphAIResult is already in desired final shape
    };
  },
  
  // Custom error handler for errors from GraphAI execution
  errorHandler: (err, req, res, defaultHandler) => {
    console.error("GRAPHAI EXECUTION ERROR:", err);
    // Call defaultHandler or implement custom response
    defaultHandler(err, req, res); 
  },

  // Timeout for GraphAI execution (milliseconds)
  timeout: 30000,

  // Base path for OpenAI-compatible routes (default: "/v1")
  // openAICompatibleBasePath: "/custom/api/v1",

  // Logger (pino compatible, e.g., console)
  // logger: console,
};

// Usage: app.use('/my-graphai-api', graphai_express(expressGraphConfig));
```

Key configurations:
-   `graphConfig` or `getGraphConfig`: Defines the workflow.
-   `streaming`, `streamingConfig`: For streaming responses.
-   `transformRequest`: Adapts HTTP request for GraphAI. **Crucial for compatibility.**
-   `transformResponse`: Modifies GraphAI output for HTTP response.
-   `errorHandler`: Custom error handling.

## `@receptron/graphai_firebase_functions` Configuration

Similar to `graphai_express`, but tailored for Firebase Functions.

```typescript
import { graphai_firebase, GraphAIFirebaseFunctionConfig } from '@receptron/graphai_firebase_functions';
// import * as functions from "firebase-functions"; // For typing req, res

const firebaseGraphConfig: GraphAIFirebaseFunctionConfig = {
  graphConfig: myWorkflowConfig,
  // getGraphConfig: (req: functions.https.Request) => myWorkflowConfig,
  
  streaming: false, // Enable if graph supports streaming
  // streamingConfig: myStreamingWorkflowConfig,

  transformRequest: (req: functions.https.Request) => {
    // Firebase req.body is already parsed if Content-Type is JSON
    // Adapt req.body or req.query to what your GraphAIConfig expects
    return req.body; // Example: pass entire JSON body
  },

  // transformResponse: (graphAIResult: any, req: functions.https.Request) => {
  //   return { data: graphAIResult };
  // },

  // errorHandler: (err, req, res, defaultHandler) => {
  //   functions.logger.error("Firebase GraphAI Error", err);
  //   defaultHandler(err, req, res);
  // },

  // Firebase specific options
  // cors: true, // Or specific origins
};

// Usage: export const myFunction = functions.https.onRequest(graphai_firebase(firebaseGraphConfig));
```
Configuration is very similar to `graphai_express`, but `req` and `res` objects are Firebase's.

## Visualization Packages Configuration

`@receptron/graphai_vue_cytoscape` and `@receptron/graphai_react_cytoscape`.

Configuration is primarily done via props passed to the Vue composable or React hook/component.

### Common Configuration Options (passed to `initCytoscape`):

```typescript
// For Vue: const { initCytoscape } = useCytoscape();
// For React: const { initCytoscape } = useCytoscape();

const cytoscapeConfig = {
  container: htmlElementRef, // Ref to the DOM element for Cytoscape
  elements: [ // Graph data: nodes and edges
    { group: 'nodes', data: { id: 'n1', label: 'Node 1', type: 'input' } /*, ...other props */ },
    { group: 'edges', data: { id: 'e1', source: 'n1', target: 'n2' } /*, ...other props */ }
  ],
  style: [ // Stylesheet for nodes, edges, etc.
    { selector: 'node', style: { 'background-color': 'blue', 'label': 'data(label)' } },
    { selector: 'node[type="input"]', style: { 'background-color': 'green' } },
    { selector: 'edge', style: { 'line-color': 'gray', 'target-arrow-shape': 'triangle' } }
  ],
  layout: { // Layout algorithm
    name: 'klay', // e.g., klay, cose, grid, circle
    // Layout-specific options:
    klay: { direction: 'DOWN', spacing: 50 }, 
    // cose: { idealEdgeLength: 100 },
    fit: true, // Whether to fit the viewport to the graph
    padding: 30 
  },
  // Interaction options:
  zoom: 1,
  minZoom: 0.1,
  maxZoom: 3,
  zoomingEnabled: true,
  userZoomingEnabled: true,
  panningEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: false,
  // ... many more Cytoscape.js options
};

// await initCytoscape(htmlElementRef.value, cytoscapeConfig); // Vue example
// initCytoscape(htmlElementRef.current, cytoscapeConfig); // React example
```

-   **`elements`**: Array of node and edge definitions.
    -   Node: `{ group: 'nodes', data: { id: 'uniqueId', label: 'Display Label', ...customData } }`
    -   Edge: `{ group: 'edges', data: { id: 'uniqueEdgeId', source: 'sourceNodeId', target: 'targetNodeId', ...customData } }`
-   **`style`**: Cytoscape stylesheet to define appearance. Uses selectors similar to CSS.
-   **`layout`**: Defines how nodes are arranged. Common layouts:
    -   `klay`: Hierarchical layout (good for workflows). Requires `cytoscape-klay`.
    -   `cose`: Force-directed layout.
    -   `grid`, `circle`, `breadthfirst`, `concentric`.
-   Interaction options control zooming, panning, selection behavior.

Refer to the [Cytoscape.js documentation](https://js.cytoscape.org/) for all available options.

## `@receptron/stream_utils` Configuration

This package likely provides utility functions or classes rather than a single configuration object. Configuration would depend on the specific utility being used.

Example (conceptual, API may vary):
```typescript
import { StreamParser, StreamTransformer } from '@receptron/stream_utils';

// If it provides a class-based parser for SSE:
// const sseParser = new StreamParser({ format: 'sse' });
// for await (const event of sseParser.parse(myReadableStream)) { /* ... */ }

// If it provides a transformation function:
// const myTransformedStream = StreamTransformer.map(myReadableStream, chunk => {
//   return JSON.parse(chunk.toString()).data;
// });
```
Check the package's own documentation or type definitions for specific configuration of its utilities.

## `@receptron/event_agent_generator` Configuration

This package is described as "Vue-based tools for generating GraphAI agents". Configuration might involve:

-   **Providing Agent Schemas**: Inputting JSON schemas that define the parameters and structure of different agent types.
-   **UI Configuration**: Customizing the look and feel or behavior of the generator UI (if it's a component).
-   **Output Configuration**: Defining how the generated agent JSON should be formatted or where it should be sent.

Example (conceptual, if it's a Vue component):
```vue
<template>
  <AgentGeneratorComponent
    :agent-schemas="myAgentSchemas"
    @agent-generated="handleGeneratedAgent"
  />
</template>

<script setup>
// const myAgentSchemas = { /* ... JSON schema for agents ... */ };
// const handleGeneratedAgent = (agentJson) => { /* ... */ };
</script>
```

## General Configuration Tips

-   **Environment Variables**: For sensitive data (API keys) or environment-specific settings (URLs, ports), use environment variables (`process.env.MY_VARIABLE`).
    -   Use `.env` files locally with a library like `dotenv`.
    -   Configure environment variables directly in your deployment platform (Firebase Functions config, Docker environment, etc.).
-   **Modularity**: Keep configurations in separate files (e.g., `config/graphai.ts`, `config/express.ts`) and import them.
-   **Validation**: For complex configurations, consider using a schema validation library (like Zod or Joi) to validate your config objects at startup.
-   **Logging**: Configure and use logging effectively to understand how your configurations are being applied and to debug issues. GraphAI's `log` object in agent context and `logger` in `graphai_express` are useful.

This guide covers the main configuration aspects. For detailed options for each package or for Cytoscape.js, always refer to their specific documentation and type definitions.