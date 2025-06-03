# Example: Basic OpenAI-Compatible Server

This example demonstrates the minimal setup required to create an OpenAI-compatible API server using `@receptron/graphai_express`. It's a great starting point for understanding the core functionality.

## Features Demonstrated

-   **`@receptron/graphai_express`**: Core middleware usage.
-   **Express.js**: Basic server setup.
-   **OpenAI API Compatibility**: Responds to standard OpenAI client requests.
-   **Simple GraphAI Workflow**: A minimal workflow to process requests.

## Prerequisites

-   Node.js 16+
-   npm or yarn

## Code

### 1. Project Setup

```bash
mkdir graphai-basic-server
cd graphai-basic-server
npm init -y
npm install express @receptron/graphai_express graphai @graphai/vanilla @graphai/agents
# For TypeScript (optional, but recommended)
npm install -D typescript @types/node @types/express ts-node nodemon
```

If using TypeScript, create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs", // Or "ESNext" if your package.json has "type": "module"
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```
And update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
  // If using ES Modules ("type": "module" in package.json):
  // "dev": "nodemon --exec node --loader ts-node/esm src/server.ts",
  // "start": "node dist/server.js"
}
```

### 2. Server Code (`src/server.ts` or `server.js`)

```typescript
import express, { Request, Response, NextFunction } from 'express';
import { graphai_express, GraphAIExpressConfig } from '@receptron/graphai_express';
import { GraphAIConfig } from 'graphai';

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware to parse JSON bodies
app.use(express.json());

// Minimal GraphAI workflow configuration
const simpleChatWorkflow: GraphAIConfig = {
  // version: 0.2, // Specify if your config uses newer features
  nodes: {
    userInput: {
      agent: "textInputAgent",
      params: {
        // Expecting input like: { "messages": [{ "role": "user", "content": "Hello" }] }
        // And we want to extract the last user message content.
        // This simplified textInputAgent might just take the whole body.
        // A more robust approach uses a request transformer.
      }
    },
    // A simple echo agent or a mock LLM agent for this basic example
    echoAgent: {
      agent: "textOutputAgent", // Using textOutputAgent to echo or format
      params: {
        // This will echo the input if no specific formatting is done
        // For OpenAI compatibility, it needs to format like an OpenAI response.
        // Let's make it a mock response.
        template: "This is a mock response to: ${JSON.stringify(inputs[0])}"
      },
      inputs: [":userInput"]
    },
    // To be truly OpenAI compatible, the output needs to be structured correctly.
    // The graphai_express middleware handles some of this, but the agent's
    // output format matters.
    // For a real LLM:
    /*
    llmAgent: {
      agent: "openAIAgent", // Needs OPENAI_API_KEY in env
      params: { model: "gpt-3.5-turbo" },
      inputs: [":userInput"] // Assuming userInput is shaped correctly by transformRequest
    },
    */
    finalOutput: { // This node's output will be sent to the client
        agent: "textOutputAgent", // Or a more specific formatting agent
        // This agent needs to produce OpenAI chat completion like structure
        // if graphai_express doesn't do the full transformation.
        // For this basic example, graphai_express will wrap the direct output.
        inputs: [":echoAgent"] // Or ":llmAgent"
    }
  },
  entry: "userInput",
  exit: "finalOutput"
};

// Configuration for graphai_express
const graphaiExpressConfig: GraphAIExpressConfig = {
  graphConfig: simpleChatWorkflow,
  // To make it truly compatible with typical OpenAI client calls,
  // we need to transform the incoming request body.
  transformRequest: (req: Request) => {
    const body = req.body;
    // Assuming OpenAI like { messages: [{ role: 'user', content: '...' }] }
    const lastUserMessage = body.messages?.filter((m: any) => m.role === 'user').pop();
    return {
      // This is what the `userInput` node in simpleChatWorkflow will receive
      // Adjust this to match what your `textInputAgent` or first agent expects.
      // For this example, let's pass the whole body.
      // If textInputAgent is simple, it might just stringify this.
      // A better textInputAgent would allow specifying a path like `messages[-1].content`.
      input_content: lastUserMessage ? lastUserMessage.content : "No message found",
      original_body: body // For echo/debug
    };
  },
  // transformResponse: (graphAIResult, req, res) => {
  //   // graphai_express by default tries to format as OpenAI chat completion.
  //   // If your graph's finalOutput already produces the exact OpenAI structure,
  //   // you might not need this, or you could customize it further.
  //   return graphAIResult; // Default behavior is usually fine.
  // }
};

// Mount the GraphAI middleware
// It will create endpoints like /v1/chat/completions
app.use('/', graphai_express(graphaiExpressConfig));

// Simple health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`GraphAI Basic Server listening on http://localhost:${PORT}`);
  console.log(`OpenAI-compatible chat completions at http://localhost:${PORT}/v1/chat/completions`);
});
```
**Note on `simpleChatWorkflow`**:
For true OpenAI compatibility, the `finalOutput` node (or the agent it uses) should produce data that `graphai_express` can easily format into an OpenAI `chat.completion` object. If `textOutputAgent` just outputs a string, `graphai_express` will wrap it like:
```json
{
  "choices": [{ "message": { "role": "assistant", "content": "YOUR_AGENT_OUTPUT_STRING" } }]
  // ... other fields
}
```
If your agent outputs a more complex object, `graphai_express` might pass it through or attempt a deeper merge.

### 3. Running the Server

```bash
# If TypeScript
npm run dev

# If JavaScript
node server.js
```

### 4. Testing

You can test this server using `curl` or any OpenAI client library by pointing it to `http://localhost:8085`.

**Using `curl`:**
```bash
curl -X POST http://localhost:8085/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "any-model-name",
    "messages": [
      {"role": "user", "content": "Hello GraphAI server!"}
    ]
  }'
```

**Expected Mock Response (approximate, based on the echo example):**
```json
{
  "id": "chatcmpl-xxxxxxxxxxxxxxx",
  "object": "chat.completion",
  "created": 1677652288, // Timestamp
  "model": "any-model-name", // From request
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "This is a mock response to: {\"input_content\":\"Hello GraphAI server!\",\"original_body\":{\"model\":\"any-model-name\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello GraphAI server!\"}]}}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": { // Mocked usage
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}
```
If you used a real `openAIAgent` and provided an API key, you'd get a response from OpenAI.

## Key Concepts

-   **`graphai_express(config)`**: This is the main function from `@receptron/graphai_express`. It takes a configuration object and returns an Express middleware.
-   **`graphConfig`**: Defines the GraphAI workflow to be executed. The `entry` and `exit` nodes are important.
-   **`transformRequest`**: A crucial function to adapt the incoming HTTP request (e.g., an OpenAI SDK request) into the format expected by the `entry` node of your `graphConfig`.
-   **`transformResponse`**: (Optional) Allows you to modify the result from your GraphAI workflow's `exit` node before it's sent back to the client. `graphai_express` provides default OpenAI-compatible formatting.
-   **OpenAI Pathing**: The middleware automatically sets up common OpenAI API paths like `/v1/chat/completions` under the route where it's mounted.

## Customization

-   **Workflow**: Modify the `simpleChatWorkflow` to include different agents, more complex logic, or connect to other services.
-   **Request/Response Transformation**: Adjust `transformRequest` and `transformResponse` for more specific needs or to support different input/output schemas.
-   **Authentication/Authorization**: Add middleware before `graphai_express` to secure your API.
-   **Error Handling**: Implement more sophisticated error handling.

This basic server provides a solid foundation. For more advanced features like streaming, authentication, and detailed configurations, refer to the [Chat Server Tutorial](../tutorials/chat-server.md).