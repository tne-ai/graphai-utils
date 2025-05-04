# Package: @receptron/graphai_firebase_functions

**Version**: `1.0.1` (Production Ready)

## Overview

`@receptron/graphai_firebase_functions` is a utility package designed to seamlessly integrate GraphAI workflows with Firebase Cloud Functions. It provides a way to expose your GraphAI graphs as HTTP-triggered serverless functions, similar to how `@receptron/graphai_express` works for Express.js applications.

This package is essential for developers looking to build scalable, serverless backend APIs powered by GraphAI on the Google Cloud Platform via Firebase.

## Key Features

-   **Firebase Functions Integration**: Easily wrap GraphAI workflows into handlers for HTTP-triggered Firebase Functions.
-   **Express-like Interface**: The configuration and usage pattern closely mirrors `@receptron/graphai_express`, making it familiar for developers who have used that package.
-   **OpenAI API Compatibility**: Can be configured to expose GraphAI workflows as OpenAI-compatible endpoints, just like the Express version.
-   **Request/Response Transformation**: Allows customization of incoming requests before they hit the GraphAI engine and outgoing responses before they are sent back to the client.
-   **Streaming Support**: Can handle streaming outputs from GraphAI workflows for real-time applications.
-   **Error Handling**: Provides mechanisms for custom error handling within the Firebase Function context.
-   **Dependencies**: Relies on `@graphai/agent_filters`, suggesting capabilities for filtering or modifying agent behavior within the Firebase environment.

## Installation

This package is typically installed within the `functions` directory of a Firebase project.

```bash
# Navigate to your Firebase project's functions directory
cd functions

npm install @receptron/graphai_firebase_functions graphai @graphai/vanilla @graphai/agents
# or
yarn add @receptron/graphai_firebase_functions graphai @graphai/vanilla @graphai/agents
```
You will also need `firebase-functions` and `firebase-admin` which are usually included when you initialize Firebase Functions in a project.

## Core API & Usage

The main export is `graphai_firebase`, a function that takes a configuration object and returns an HTTP request handler suitable for Firebase Functions.

```typescript
// In functions/src/index.ts (or your main Firebase Functions file)
import * as functions from 'firebase-functions';
import { graphai_firebase, GraphAIFirebaseFunctionConfig } from '@receptron/graphai_firebase_functions';
import { GraphAIConfig } from 'graphai'; // Your GraphAI workflow config type

// 1. Define your GraphAI Workflow Configuration
const myFirebaseWorkflow: GraphAIConfig = {
  // ... your nodes, entry, exit points ...
  nodes: {
    userInput: { agent: "textInputAgent" },
    processor: { agent: "echoAgent", inputs: [":userInput"] },
    finalOutput: { agent: "textOutputAgent", inputs: [":processor"] }
  },
  entry: "userInput",
  exit: "finalOutput"
};

// 2. Configure the graphai_firebase handler
const graphaiFirebaseSettings: GraphAIFirebaseFunctionConfig = {
  graphConfig: myFirebaseWorkflow,
  
  // Adapt Firebase HTTP Request to what your graph's entry node expects
  transformRequest: (req: functions.https.Request) => {
    // req.body is automatically parsed by Firebase for JSON content types
    // req.query contains query parameters
    // Example: if graph expects { data: ... }
    return { data: req.body.message || req.query.message }; 
  },

  // Optional: Customize response (default aims for OpenAI compatibility if applicable)
  // transformResponse: (graphResult, req: functions.https.Request) => {
  //   return { result: graphResult, processedAt: Date.now() };
  // },

  streaming: false, // Set to true if your graph's exit node returns a stream
  // streamingConfig: myStreamingWorkflowForFirebase, // Optional for streaming

  // errorHandler: (err, req, res, defaultHandler) => {
  //   functions.logger.error("GraphAI Firebase Error:", err, { structuredData: true });
  //   defaultHandler(err, req, res); // Call default or send custom response
  // },
  
  // logger: functions.logger, // Pass Firebase logger (optional, might be used by default)
  // cors: true // Or specific origins, or handle via Firebase Hosting rewrites
};

// 3. Export your Firebase Function
export const myGraphAIEndpoint = functions.https.onRequest(
  graphai_firebase(graphaiFirebaseSettings)
);

// Example with runtime options (memory, timeout, region)
// export const myGraphAIEndpointWithOptions = functions
//   .region('us-central1')
//   .runWith({ timeoutSeconds: 120, memory: '1GB' })
//   .https.onRequest(graphai_firebase(graphaiFirebaseSettings));

```

### `GraphAIFirebaseFunctionConfig` Options

This configuration object is very similar to `GraphAIExpressConfig` from `@receptron/graphai_express`. Key options include:

-   `graphConfig?: GraphAIConfig | ((req: functions.https.Request) => GraphAIConfig | Promise<GraphAIConfig>)`:
    The GraphAI workflow or a function to get it.
-   `streaming?: boolean`: Enable streaming.
-   `streamingConfig?: GraphAIConfig | ((req: functions.https.Request) => GraphAIConfig | Promise<GraphAIConfig>)`:
    Specific config for streaming requests.
-   `transformRequest?: (req: functions.https.Request) => Record<string, any> | Array<any> | Promise<Record<string, any> | Array<any>>`:
    Crucial for adapting the Firebase `Request` object (which is Express-like) to your GraphAI workflow's input.
-   `transformResponse?: (graphAIResult: any, req: functions.https.Request, res: functions.Response) => any | Promise<any>`:
    Customize the response sent back to the client.
-   `streamResponseHandler?: (stream: ReadableStream | AsyncIterable<any>, req: functions.https.Request, res: functions.Response) => Promise<void>`:
    Custom handler for streaming responses.
-   `errorHandler?: (err: Error, req: functions.https.Request, res: functions.Response, defaultErrorHandler: Function) => void`:
    Custom error handling.
-   `logger?: functions.logger | CompatibleLogger`: Pino-compatible logger; Firebase's `functions.logger` can be used.
-   `cors?: boolean | string | string[]`: Configuration for CORS handling. Can be `true` (allow all), a specific origin string, or an array of origins. Often, CORS is better handled at a higher level (e.g., API Gateway or Firebase Hosting rewrites if frontend and backend are on the same effective origin).
-   OpenAI compatibility options like `openAICompatibleBasePath`, `disableOpenAICompatibleRoutes` are also likely present, mirroring the Express version.

## Use Cases

-   Building serverless backend APIs powered by GraphAI.
-   Creating OpenAI-compatible endpoints hosted on Firebase for scalability and ease of deployment.
-   Processing data from Firebase triggers (e.g., Firestore, Storage, Pub/Sub) by invoking these HTTP functions internally or having the trigger directly run a GraphAI instance.
-   Integrating GraphAI logic into existing Firebase applications.

## Integration with Firebase Hosting

A common pattern is to serve a frontend application (Vue, React, etc.) via Firebase Hosting and then use Hosting rewrites to direct API calls to your GraphAI Firebase Functions.

**Example `firebase.json` rewrite:**
```json
{
  "hosting": {
    "public": "dist", // Your frontend build output
    "rewrites": [
      {
        "source": "/api/**", // All calls to /api/...
        "function": "myGraphAIEndpoint" // Will be routed to this function
      }
    ]
  },
  "functions": {
    "source": "functions" // Location of your functions code
  }
}
```
With this, your frontend can call `/api/v1/chat/completions`, and it will be routed to the `myGraphAIEndpoint` function, which will then process it via `graphai_firebase`.

## Agent Filters (`@graphai/agent_filters`)

The dependency on `@graphai/agent_filters` suggests that this package might provide or integrate mechanisms to filter or modify the behavior of agents running within the Firebase Functions environment. This could be for:
-   Security: Restricting certain agent actions.
-   Logging: Adding specific logging for agent executions.
-   Context Injection: Providing Firebase-specific context to agents.

The exact usage of agent filters would depend on how `graphai_firebase` incorporates them. It might be an implicit part of its execution or configurable via options.

## Deployment

Deploy your functions from your project's root directory:
```bash
firebase deploy --only functions
# Or to deploy a specific function:
# firebase deploy --only functions:myGraphAIEndpoint
```

## Troubleshooting

-   **Permissions Errors**: Ensure your Firebase Function's service account has the necessary IAM permissions if it interacts with other Google Cloud services (e.g., calling external APIs, accessing other GCP resources). For outbound network requests (like calling OpenAI), your Firebase project needs to be on the Blaze (pay-as-you-go) plan.
-   **Cold Starts**: Serverless functions can have "cold starts." Optimize your function's bundle size and initialization logic. Consider setting `minInstances` for frequently accessed functions if latency is critical (this has cost implications).
-   **Logging**: Use `functions.logger.info()`, `functions.logger.error()`, etc., for logging. View logs in the Firebase Console -> Functions -> Logs.
-   **CORS**: If calling from a browser on a different domain, ensure CORS is handled correctly either in `graphaiFirebaseSettings.cors` or via Firebase Hosting rewrites.

Refer to the [Firebase Integration Tutorial](../../tutorials/firebase-integration.md) for a more comprehensive example and the [Troubleshooting Guide](../../guides/troubleshooting.md) for general debugging.