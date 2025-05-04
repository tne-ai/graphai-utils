# API Reference: @receptron/graphai_express

This page details the API for the `@receptron/graphai_express` package.

## `graphai_express(config: GraphAIExpressConfig): ExpressMiddleware`

This is the main function exported by the package. It's a factory that returns an Express middleware function.

-   **`config`**: `GraphAIExpressConfig` - An object containing the configuration for the middleware.
-   **Returns**: `ExpressMiddleware` - An Express middleware function that can be used with `app.use()`.

### `GraphAIExpressConfig` Interface

```typescript
import { Request, Response } from 'express';
import { GraphAIConfig, GraphAI, Logger as GraphAILogger } from 'graphai'; // Assuming Logger type from graphai
import { Readable } from 'stream'; // For streamResponseHandler

// Define a compatible logger type if not directly from graphai
type CompatibleLogger = Pick<GraphAILogger, 'debug' | 'info' | 'warn' | 'error'>;

export interface GraphAIExpressConfig {
  // Core GraphAI workflow configuration
  graphConfig?: GraphAIConfig | ((req: Request) => GraphAIConfig | Promise<GraphAIConfig>);
  
  // Configuration for streaming requests
  streaming?: boolean; // Default: false
  streamingConfig?: GraphAIConfig | ((req: Request) => GraphAIConfig | Promise<GraphAIConfig>);

  // Request and response transformation functions
  transformRequest?: (req: Request) => Record<string, any> | Array<any> | Promise<Record<string, any> | Array<any>>;
  transformResponse?: (graphAIResult: any, req: Request, res: Response) => any | Promise<any>;
  
  // Custom handler for streaming responses
  streamResponseHandler?: (
    stream: Readable | AsyncIterable<any>, // Type of stream produced by graph's exit node
    req: Request, 
    res: Response
  ) => Promise<void>;

  // Error handling
  errorHandler?: (
    err: Error, 
    req: Request, 
    res: Response, 
    defaultErrorHandler: (err: Error, req: Request, res: Response) => void
  ) => void;

  // Operational settings
  timeout?: number; // In milliseconds, default: 60000
  logger?: CompatibleLogger; // Pino-compatible logger, e.g., console or Firebase logger

  // OpenAI API compatibility settings
  openAICompatibleBasePath?: string; // Default: "/v1"
  disableOpenAICompatibleRoutes?: boolean; // Default: false

  // Custom route definitions
  customRoutes?: Array<{
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'all';
    path: string;
    graphConfig?: GraphAIConfig | ((req: Request) => GraphAIConfig | Promise<GraphAIConfig>); // Route-specific graph
    streaming?: boolean; // Route-specific streaming toggle
    streamingConfig?: GraphAIConfig | ((req: Request) => GraphAIConfig | Promise<GraphAIConfig>); // Route-specific streaming graph
    transformRequest?: (req: Request) => any | Promise<any>; // Route-specific
    transformResponse?: (graphAIResult: any, req: Request, res: Response) => any | Promise<any>; // Route-specific
    // Handler for full custom logic, receives a pre-configured GraphAI instance
    handler?: (
        req: Request, 
        res: Response, 
        // Provides a GraphAI instance configured with the route's graphConfig (if any)
        // or the main graphConfig. This allows running graphs manually within the handler.
        graphAI: GraphAI 
    ) => Promise<void>;
  }>;
}
```

#### Key `GraphAIExpressConfig` Properties:

-   **`graphConfig`**:
    -   Type: `GraphAIConfig | ((req: Request) => GraphAIConfig | Promise<GraphAIConfig>)`
    -   Description: The primary GraphAI workflow configuration. Can be a static object or a function that dynamically returns a configuration based on the incoming request. This allows for routing to different graphs based on request parameters, headers, etc.
    -   Required: Yes, unless all interactions are through `customRoutes` that define their own `graphConfig` or `handler`.

-   **`streaming`**:
    -   Type: `boolean`
    -   Default: `false`
    -   Description: If `true`, enables streaming mode for responses. The GraphAI workflow specified by `streamingConfig` (or `graphConfig` if `streamingConfig` is not provided) must have an exit node that produces a stream (e.g., `ReadableStream` or `AsyncIterable`).

-   **`streamingConfig`**:
    -   Type: `GraphAIConfig | ((req: Request) => GraphAIConfig | Promise<GraphAIConfig>)`
    -   Description: An optional, separate GraphAI workflow configuration specifically for requests that indicate a desire for streaming (e.g., `stream: true` in an OpenAI request body). If not provided, `graphConfig` is used for both streaming and non-streaming requests.

-   **`transformRequest`**:
    -   Type: `(req: Request) => any | Promise<any>`
    -   Description: A function that takes the Express `Request` object and transforms it into the input(s) expected by the entry node(s) of your GraphAI workflow. The return value of this function is passed to `graph.run()`. This is crucial for adapting standard HTTP request formats (like OpenAI's) to your specific graph's input needs.
    -   Example: Extracting a user's message from `req.body.messages` and returning it as a simple string or a structured object.

-   **`transformResponse`**:
    -   Type: `(graphAIResult: any, req: Request, res: Response) => any | Promise<any>`
    -   Description: An optional function to transform the result from your GraphAI workflow's exit node before it's sent as an HTTP response. If not provided, a default formatter is used, which attempts to create OpenAI-compatible responses (e.g., wrapping a string result in a chat completion message structure).

-   **`streamResponseHandler`**:
    -   Type: `(stream: Readable | AsyncIterable<any>, req: Request, res: Response) => Promise<void>`
    -   Description: Optional. A custom function to handle the stream produced by your GraphAI workflow when `streaming: true`. If provided, this function is responsible for piping/writing the stream data to the `Response` object. This allows for custom stream formatting (e.g., different SSE structure, NDJSON, etc.) if the default SSE handling is not suitable.

-   **`errorHandler`**:
    -   Type: `(err: Error, req: Request, res: Response, defaultErrorHandler: Function) => void`
    -   Description: A custom error handler for errors that occur during the execution of the GraphAI workflow or within the `graphai_express` middleware itself. It receives the error, request, response, and the default error handling function (which you can choose to call).

-   **`timeout`**:
    -   Type: `number`
    -   Default: `60000` (milliseconds)
    -   Description: Sets a timeout for the execution of the GraphAI workflow. If the workflow execution exceeds this time, it will be terminated, and an error will be triggered.

-   **`logger`**:
    -   Type: `CompatibleLogger` (Pino-compatible: `{ debug, info, warn, error }`)
    -   Description: An optional logger instance. If provided, `graphai_express` will use it for internal logging. `console` can be used.

-   **`openAICompatibleBasePath`**:
    -   Type: `string`
    -   Default: `"/v1"`
    -   Description: The base path segment under which OpenAI-compatible routes (like `chat/completions`, `embeddings`) are automatically created. For example, if `graphai_express` is mounted at `/api`, the chat completions endpoint would be `/api/v1/chat/completions`.

-   **`disableOpenAICompatibleRoutes`**:
    -   Type: `boolean`
    -   Default: `false`
    -   Description: If set to `true`, the middleware will not create the default OpenAI-compatible routes. This is useful if you only want to use `customRoutes` or implement a completely custom API structure.

-   **`customRoutes`**:
    -   Type: `Array<CustomRoute>`
    -   Description: An array to define custom HTTP routes. Each route object can specify:
        -   `method`: HTTP method (`'get'`, `'post'`, etc.).
        -   `path`: The route path (e.g., `'/my-custom-task'`).
        -   `graphConfig?`: A `GraphAIConfig` specific to this route.
        -   `streaming?`: Boolean to enable streaming for this route.
        -   `streamingConfig?`: A streaming-specific `GraphAIConfig` for this route.
        -   `transformRequest?`, `transformResponse?`: Route-specific transformers.
        -   `handler?`: A custom Express request handler function `(req, res, graphAIInstance) => Promise<void>`. If provided, this handler takes full control of the request. It receives a pre-configured `GraphAI` instance (using the route's `graphConfig` or the main `graphConfig`) which can be used via `graphAIInstance.run()`. This allows for complex logic that might involve multiple graph runs or other operations before responding.

## Default OpenAI-Compatible Routes

When `disableOpenAICompatibleRoutes` is `false` (the default), `graphai_express` automatically creates the following routes under the `openAICompatibleBasePath` (default `/v1`):

-   `POST /chat/completions`: For chat-like interactions.
-   `POST /completions`: For legacy text completions (less common now).
-   `POST /embeddings`: For generating text embeddings.
-   `GET /models`: To list available models (often mocked or configurable).
-   `GET /models/:model_id`: To retrieve details about a specific model.

The behavior of these routes is determined by the provided `graphConfig` (and `streamingConfig`) and the `transformRequest`/`transformResponse` functions. The middleware attempts to map the standard OpenAI request/response structures to your GraphAI workflow.

## Streaming Behavior

If `streaming: true` is enabled (either globally or for a custom route) and the GraphAI workflow's exit node produces a `ReadableStream` or an `AsyncIterable`:
-   The HTTP response `Content-Type` will be set to `text/event-stream`.
-   Chunks from the stream will be formatted as Server-Sent Events (SSE).
-   The default SSE format aims for compatibility with OpenAI's streaming responses, typically:
    ```
    data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":123,"model":"yyy","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

    data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":123,"model":"yyy","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}

    data: [DONE]
    ```
-   You can override this behavior with a custom `streamResponseHandler`.

This API reference provides a high-level overview. For the most precise details, always refer to the package's source code and type definitions.