# Package: @receptron/graphai_express

**Version**: `1.0.3` (Production Ready)

## Overview

`@receptron/graphai_express` is a powerful Express.js middleware that transforms your GraphAI workflows into robust HTTP APIs. Its primary feature is to make GraphAI servers compatible with the OpenAI API specification, allowing seamless integration with existing OpenAI clients and SDKs. It also supports custom API endpoints and advanced configurations for streaming, error handling, and request/response transformation.

This package is central to building backend services with GraphAI.

## Key Features

-   **OpenAI API Compatibility**: Automatically creates standard OpenAI paths (e.g., `/v1/chat/completions`, `/v1/embeddings`) when mounted.
-   **Express Middleware**: Easily integrates into new or existing Express.js applications.
-   **GraphAI Integration**: Executes GraphAI workflows based on incoming HTTP requests.
-   **Request Transformation**: Adapt HTTP request data (body, query, headers) into the format expected by your GraphAI workflow's entry node(s).
-   **Response Transformation**: Format the output from your GraphAI workflow before sending it as an HTTP response. Default formatting aims for OpenAI compatibility.
-   **Streaming Support**: Handles streaming responses from GraphAI workflows (e.g., from `openAIStreamAgent`) and can output Server-Sent Events (SSE).
-   **Error Handling**: Provides default error handling and allows for custom error handlers for GraphAI execution errors.
-   **Configuration**: Highly configurable via a `GraphAIExpressConfig` object.
-   **Dependencies**: Relies on `@graphai/agent_filters`, `cors`, `dotenv`, and `express`.

## Installation

```bash
npm install @receptron/graphai_express express graphai @graphai/vanilla
# or
yarn add @receptron/graphai_express express graphai @graphai/vanilla
```
You'll also need `graphai` and agents like `@graphai/vanilla` or `@graphai/agents` for your workflows.

## Core API & Usage

The main export is the `graphai_express` function, which is a factory for Express middleware.

```typescript
import express from 'express';
import { graphai_express, GraphAIExpressConfig } from '@receptron/graphai_express';
import { GraphAIConfig } from 'graphai'; // Your GraphAI workflow config type

const app = express();
app.use(express.json()); // Important for parsing JSON request bodies

// 1. Define your GraphAI Workflow Configuration
const myWorkflow: GraphAIConfig = {
  // ... your nodes, entry, exit points ...
  nodes: {
    userInput: { agent: "textInputAgent" }, // Example entry
    processor: { agent: "echoAgent", inputs: [":userInput"] }, // Example processing
    finalOutput: { agent: "textOutputAgent", inputs: [":processor"] } // Example exit
  },
  entry: "userInput",
  exit: "finalOutput"
};

// 2. Configure the graphai_express middleware
const graphaiExpressSettings: GraphAIExpressConfig = {
  graphConfig: myWorkflow, // The workflow to run
  
  // Crucial for adapting HTTP requests to your graph's input needs
  transformRequest: (req) => {
    // Example: If OpenAI client sends { messages: [...] }, and your graph's
    // textInputAgent expects a simple string or an object like { query: "..." }
    const lastMessage = req.body.messages?.slice(-1)[0]?.content;
    return { value: lastMessage || req.body.prompt || req.query.text }; // Data for textInputAgent
  },

  // Optional: Customize response (default is OpenAI compatible)
  // transformResponse: (graphResult, req) => {
  //   return { myCustomData: graphResult, executionTime: Date.now() - req.startTime };
  // },

  streaming: false, // Set to true if your graph's exit node returns a stream
  // streamingConfig: myStreamingWorkflow, // Optional: different config for streaming requests

  timeout: 30000, // Optional: Request timeout in milliseconds (default: 60000)

  // errorHandler: (err, req, res, defaultHandler) => { /* ... */ },
  // logger: console, // Optional: pino-compatible logger
  // openAICompatibleBasePath: "/custom/api/v1" // Default is /v1
};

// 3. Mount the middleware
app.use('/my-graphai-api', graphai_express(graphaiExpressSettings));
// This will create endpoints like:
// POST /my-graphai-api/v1/chat/completions
// POST /my-graphai-api/v1/embeddings
// etc.

app.listen(8085, () => {
  console.log('GraphAI Express server running on port 8085');
});
```

### `GraphAIExpressConfig` Options

-   `graphConfig?: GraphAIConfig | ((req: Request) => GraphAIConfig | Promise<GraphAIConfig>)`:
    The GraphAI workflow configuration to execute. Can be a static object or a function that returns a config based on the request (allowing dynamic graph selection).
-   `streaming?: boolean`: (Default: `false`) Set to `true` if the workflow is expected to produce a stream.
-   `streamingConfig?: GraphAIConfig | ((req: Request) => GraphAIConfig | Promise<GraphAIConfig>)`:
    Optional. A separate GraphAI configuration specifically for requests that indicate they want a streaming response (e.g., `stream: true` in OpenAI request body). If not provided, `graphConfig` is used for streaming requests too.
-   `transformRequest?: (req: Request) => Record<string, any> | Array<any> | Promise<Record<string, any> | Array<any>>`:
    A function to transform the incoming Express `Request` object into the input(s) expected by your GraphAI workflow's entry node(s). This is **critical** for adapting standard HTTP requests (like those from OpenAI SDKs) to your specific graph's input structure. The return value is passed to `graph.run()`.
-   `transformResponse?: (graphAIResult: any, req: Request, res: Response) => any | Promise<any>`:
    A function to transform the result from your GraphAI workflow's exit node before it's sent as an HTTP response. If not provided, a default OpenAI-compatible formatter is used (e.g., wrapping string results in a chat completion message structure).
-   `streamResponseHandler?: (stream: ReadableStream | AsyncIterable<any>, req: Request, res: Response) => Promise<void>`:
    Optional. A custom handler for processing and sending streaming responses if the default SSE (Server-Sent Events) formatting is not desired or if your graph's stream output needs special handling.
-   `errorHandler?: (err: Error, req: Request, res: Response, defaultErrorHandler: (err: Error, req: Request, res: Response) => void) => void`:
    Custom error handler for errors occurring during GraphAI execution or within the middleware.
-   `timeout?: number`: (Default: `60000`) Timeout in milliseconds for the GraphAI workflow execution.
-   `logger?: Logger`: A Pino-compatible logger instance (e.g., `console`).
-   `openAICompatibleBasePath?: string`: (Default: `/v1`) The base path segment under which OpenAI-compatible routes like `chat/completions` are created.
-   `disableOpenAICompatibleRoutes?: boolean`: (Default: `false`) If `true`, disables the automatic creation of OpenAI-compatible routes. Useful if you only want to define custom routes.
-   `customRoutes?: Array<{ method: 'get' | 'post' | 'put' | 'delete' | 'patch'; path: string; graphConfig?: GraphAIConfig; handler?: (req: Request, res: Response, graphAI: GraphAI) => Promise<void>; }>`:
    Define custom HTTP routes that can execute specific GraphAI workflows or custom handlers.

## Use Cases

-   Creating backend APIs for LLM-powered applications.
-   Building OpenAI-compatible proxy servers with custom logic or agent routing.
-   Exposing complex data processing workflows as HTTP services.
-   Developing AI-driven microservices.

## Advanced Usage

### Dynamic Graph Selection
Use the functional form of `graphConfig` or `streamingConfig` to select different GraphAI workflows based on request properties (e.g., path, headers, body parameters like `model`).

```typescript
// getGraphConfig: (req) => {
//   if (req.body.model && req.body.model.startsWith("image-")) {
//     return loadImageProcessingWorkflow();
//   }
//   return defaultTextProcessingWorkflow();
// }
```

### Custom Routes
For non-OpenAI-compatible endpoints or specialized tasks:
```typescript
// customRoutes: [
//   {
//     method: 'post',
//     path: '/custom/process-data',
//     graphConfig: myDataProcessingWorkflow, // Specific workflow for this route
//     // transformRequest and transformResponse can also be route-specific if needed
//   },
//   {
//     method: 'get',
//     path: '/custom/status/:jobId',
//     handler: async (req, res, graphAIInstance) => { // graphAIInstance is pre-configured
//       // Custom logic, maybe not even running a full graph
//       const status = await getJobStatus(req.params.jobId);
//       res.json({ status });
//     }
//   }
// ]
```

### Streaming with Server-Sent Events (SSE)
When `streaming: true` is enabled and the GraphAI workflow's exit node returns a stream (e.g., from `openAIStreamAgent`), `graphai_express` will by default format the output as Server-Sent Events, compatible with OpenAI's streaming API. Each chunk from the stream is typically wrapped in a JSON structure.

## Troubleshooting

-   **404 Errors**: Check your base path for mounting `graphai_express` and the `openAICompatibleBasePath`. Ensure the requested path matches (e.g., `POST /your-mount-path/v1/chat/completions`).
-   **Incorrect Input to Graph**: Log the output of your `transformRequest` function and the input received by your graph's first agent. This is the most common area for issues.
-   **CORS Errors**: Ensure `cors` middleware is configured correctly in your Express app if requests come from a different origin.
-   **Timeout**: If requests time out, increase the `timeout` in `GraphAIExpressConfig` or optimize your GraphAI workflow.

Refer to the [Troubleshooting Guide](../../guides/troubleshooting.md) for more general debugging tips.