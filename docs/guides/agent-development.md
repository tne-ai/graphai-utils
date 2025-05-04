# Agent Development Guide

This guide provides a deep dive into creating custom GraphAI agents, covering advanced features, best practices, and integration within the GraphAI ecosystem.

## Understanding GraphAI Agents

A GraphAI agent is a JavaScript/TypeScript function responsible for performing a specific task within a workflow. It receives inputs, processes them (potentially using static parameters or interacting with external services), and returns an output.

### Core Agent Structure (`AgentFunction`)

The fundamental type for an agent is `AgentFunction`:

```typescript
import { AgentFunction, AgentFunctionContext } from 'graphai';

// P = Params type, I = Inputs type (can be a tuple for fixed inputs), O = Output type
export const myCustomAgent: AgentFunction<P, I, O> = async (
  context: AgentFunctionContext<P, I>
): Promise<O> => {
  const { 
    params,    // Static parameters defined in the node configuration
    inputs,    // Array of resolved values from input nodes
    agentId,   // The ID (key) of the current node in the graph
    graphData, // The full graph data (nodes, edges, etc.)
    config,    // The global GraphAI configuration object
    log,       // Logger instance (debug, info, warn, error)
    state,     // Node-specific state object (persists across retries/loops for this node instance)
    graph H    // The GraphAI instance itself (use with caution)
    // loop,    // Information about the current loop iteration, if applicable
  } = context;

  // 1. Validate inputs and params
  // 2. Perform agent logic
  // 3. Return the result

  log.debug(`Agent ${agentId} received inputs:`, inputs);
  log.info(`Agent ${agentId} using params:`, params);

  // Example logic:
  // const result = inputs[0] + params.offset;
  // return result;
  
  // Placeholder for compilation
  return {} as O; 
};
```

Key elements of `AgentFunctionContext`:
-   `params`: Static configuration for this agent instance.
-   `inputs`: An array of resolved values from connected input nodes. The order matches the `inputs` array in the node definition. If inputs are named in the node definition (e.g., `{ data: ":sourceNode" }`), `context.inputs` will be an object with those names as keys.
-   `agentId`: Useful for logging or creating unique identifiers.
-   `log`: A Pino-compatible logger instance. Use `log.debug()`, `log.info()`, `log.warn()`, `log.error()`.
-   `state`: A mutable object that persists across retries and loop iterations for *this specific node instance* within a single `graph.run()` call. It's reset for subsequent `graph.run()` calls unless explicitly managed.
-   `graph`: The `GraphAI` instance running the workflow. Allows advanced scenarios like dynamically running sub-graphs, but use with caution to avoid complex dependencies.

## Developing Your Agent

### 1. Define Agent Signature
Clearly define the types for `Params`, `Inputs`, and `Output` using TypeScript interfaces or types.

```typescript
interface MyAgentParams {
  mode: 'strict' | 'flexible';
  threshold?: number;
}

// Example: Agent expects a string and an optional number
type MyAgentInputs = [string, number?]; 
// Or if inputs are named in node definition:
// type MyAgentInputs = { mainData: string, optionalConfigNum?: number };


interface MyAgentOutput {
  status: string;
  processedData: any;
}

export const myProcessingAgent: AgentFunction<MyAgentParams, MyAgentInputs, MyAgentOutput> = async (
  { params, inputs, log }
) => {
  // ... implementation ...
  return { status: "done", processedData: "example" };
};
```

### 2. Handle Inputs and Parameters
-   Always validate `inputs` and `params` for expected types and presence, especially for optional values.
-   Destructure `inputs` if you expect a fixed number of inputs in a specific order.
-   If using named inputs in your node definition (e.g., `inputs: { data: ":nodeA", config: ":nodeB" }`), then `context.inputs` will be an object: `context.inputs.data`, `context.inputs.config`.

### 3. Asynchronous Operations
-   Most non-trivial agents will involve asynchronous operations (e.g., API calls, file I/O, database queries).
-   Declare your agent function as `async` and use `await` for these operations.
-   GraphAI will automatically await the promise returned by your agent.

### 4. Returning Results
-   The value returned by the agent function becomes the output of its node, available to other nodes that depend on it.
-   Ensure the returned value matches the `Output` type defined in your agent's signature.

### 5. Error Handling
-   Throw errors for unrecoverable issues within the agent. GraphAI will catch these.
    ```typescript
    // if (!inputs[0]) {
    //   throw new Error(`Agent ${agentId}: Required input 'mainData' is missing.`);
    // }
    ```
-   The `onError` property in a node's definition can control how GraphAI handles errors from that specific agent (e.g., retry, fallback to a default value, continue with error).

### 6. Logging
-   Use `context.log` for structured logging.
    -   `log.debug()`: For detailed information useful during development.
    -   `log.info()`: For general operational information.
    -   `log.warn()`: For potential issues that don't stop execution.
    -   `log.error()`: For errors encountered by the agent (often followed by throwing an error).
-   The log level for GraphAI can be configured when instantiating `GraphAI` or in `graphai_express`/`graphai_firebase_functions`.

### 7. Using Node-Specific State (`context.state`)
-   `context.state` is an empty object `{}` initially for each node invocation within a `graph.run()`.
-   It persists across retries of the same node instance.
-   It also persists across iterations if the node is part of a loop controlled by the `loop` property.
    ```typescript
    // interface MyAgentState { attempt?: number; }
    // export const agentWithState: AgentFunction<{}, [], string, MyAgentState> = async ({ state, log }) => {
    //   state.attempt = (state.attempt || 0) + 1;
    //   log.info(`This is attempt number ${state.attempt}`);
    //   if (state.attempt < 3) throw new Error("Simulating failure");
    //   return "Succeeded on attempt " + state.attempt;
    // };
    // Node config: { agent: "agentWithState", retry: { count: 2 } }
    ```

### 8. Streaming Agents
-   If an agent needs to produce or consume a stream (e.g., for LLM responses, large file processing):
    -   **Producing a Stream**: The agent can return a `ReadableStream` (Node.js) or an `AsyncIterable`.
        ```typescript
        // import { Readable } from 'stream';
        // export const streamProducerAgent: AgentFunction<{}, [], Readable> = async () => {
        //   const stream = new Readable({ read() {} });
        //   stream.push("data chunk 1");
        //   stream.push("data chunk 2");
        //   stream.push(null); // End of stream
        //   return stream;
        // };
        ```
    -   **Consuming a Stream**: If an input is a stream, the agent can iterate over it using `for await...of`.
        ```typescript
        // export const streamConsumerAgent: AgentFunction<{}, [AsyncIterable<string>], string> = async ({ inputs }) => {
        //   let content = "";
        //   for await (const chunk of inputs[0]) {
        //     content += chunk;
        //   }
        //   return content;
        // };
        ```
    -   `@receptron/stream_utils` may provide helpful utilities for stream manipulation.

### 9. Interacting with GraphAI Instance (`context.graph`)
-   `context.graph.results`: Access results of already executed nodes in the current run (use with caution, prefer explicit `inputs`).
-   `context.graph.run()`: Dynamically execute another (sub)graph. This is powerful but can make workflows harder to follow.
    ```typescript
    // // Inside an agent:
    // const subGraphResult = await context.graph.run({
    //   graphData: anotherGraphConfig, // A separate GraphAIConfig
    //   inputs: { $0: inputs[0] } // Pass inputs to the sub-graph
    // });
    ```
    Alternatively, use the `nestedGraph` property in a node definition.

## Testing Your Agents

-   **Unit Tests**: Write unit tests for your agent functions. Mock the `AgentFunctionContext` and assert the agent's output or error handling.
    ```typescript
    // // Example using Jest (conceptual)
    // import { myCustomAgent } from './myCustomAgent';
    // const mockLog = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };

    // describe('myCustomAgent', () => {
    //   it('should process input correctly', async () => {
    //     const context = {
    //       params: { mode: 'strict' },
    //       inputs: ["test data"],
    //       agentId: "testAgent",
    //       log: mockLog,
    //       // ... other context properties if needed
    //     } as any; // Cast to any or create a more complete mock
        
    //     const result = await myCustomAgent(context);
    //     expect(result.status).toBe("processed");
    //     expect(result.data).toEqual("PROCESSED: TEST DATA");
    //   });
    // });
    ```
-   **Integration Tests**: Test your agent within a minimal GraphAI workflow to ensure it integrates correctly with other agents and input/output mappings.

## Packaging and Sharing Agents

-   Group related agents into an npm package.
-   Export an `agents` object from your package that maps agent IDs to agent functions.
    ```typescript
    // // In your-agent-package/index.ts
    // import { agentOne } from './agentOne';
    // import { agentTwo } from './agentTwo';
    // export const myCoolAgents = {
    //   cool_agentOne: agentOne,
    //   cool_agentTwo: agentTwo
    // };
    ```
-   Users can then install your package and register your agents:
    ```typescript
    // // In a user's project
    // import { GraphAI } from 'graphai';
    // import { vanillaAgents } from '@graphai/vanilla';
    // import { myCoolAgents } from 'your-agent-package';
    // const graph = new GraphAI(config, { ...vanillaAgents, ...myCoolAgents });
    ```

## Best Practices

-   **Clarity and Simplicity**: Aim for agents that are easy to understand and have a clear purpose.
-   **Immutability**: Avoid modifying `inputs` or `params` directly within an agent unless that's its explicit purpose. Return new data structures.
-   **Type Safety**: Use TypeScript to define clear interfaces for `params`, `inputs`, and `outputs`.
-   **Configuration over Code**: Prefer making agents configurable via `params` rather than hardcoding behavior.
-   **Dependency Injection (Conceptual)**: If an agent needs complex services (e.g., a database client), consider how these are provided. They could be passed in `params` (if simple) or managed via a higher-level context if GraphAI supports it in the future. For now, initializing them within the agent or globally is common.
-   **Documentation**: Document your agent's purpose, parameters, expected inputs, and output format using JSDoc/TSDoc.

By following these guidelines, you can develop robust, reusable, and maintainable custom agents that significantly enhance the power of your GraphAI workflows.