# Example: Custom GraphAI Agents

This example demonstrates how to create and use custom GraphAI agents to extend the capabilities of your workflows. Custom agents allow you to encapsulate specific logic, connect to proprietary services, or perform unique data transformations.

## Features Demonstrated

-   **AgentFunction Interface**: Defining the structure of a GraphAI agent.
-   **Synchronous and Asynchronous Agents**: Creating agents that perform immediate tasks or long-running operations.
-   **Input and Parameter Handling**: Accessing data passed to the agent.
-   **Returning Results**: How agents provide output to the workflow.
-   **Integrating Custom Agents**: Using your custom agents within a GraphAI workflow.
-   **Error Handling** within an agent.

## Prerequisites

-   Node.js 16+
-   npm or yarn
-   Basic understanding of GraphAI concepts (workflows, nodes, agents).
-   TypeScript (recommended for agent development for type safety).

## Code

### 1. Project Setup

If you don't have an existing GraphAI project:
```bash
mkdir graphai-custom-agents-example
cd graphai-custom-agents-example
npm init -y
npm install graphai @graphai/vanilla # Core GraphAI
# For TypeScript
npm install -D typescript @types/node ts-node nodemon
```
Create `tsconfig.json` (see Basic Server example for a template).
Update `package.json` scripts for `dev`, `build`, `start`.

### 2. Defining Custom Agents

Let's create a few custom agents in a file, e.g., `src/customAgents.ts`.

```typescript
import { AgentFunction, AgentFunctionContext } from 'graphai'; // Import necessary types

// Interface for our custom agent's parameters
interface SimpleMathParams {
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  operand: number;
}

/**
 * Custom Agent: SimpleMathAgent
 * Performs a simple mathematical operation on the input.
 */
export const simpleMathAgent: AgentFunction<SimpleMathParams, number, number> = async (
  context: AgentFunctionContext<SimpleMathParams, number>
): Promise<number> => {
  const { params, inputs } = context;
  const inputValue = inputs[0]; // Assuming the first input is the number to operate on

  if (typeof inputValue !== 'number') {
    throw new Error("SimpleMathAgent: Input must be a number.");
  }
  if (typeof params.operand !== 'number') {
    throw new Error("SimpleMathAgent: 'operand' parameter must be a number.");
  }

  switch (params.operation) {
    case 'add':
      return inputValue + params.operand;
    case 'subtract':
      return inputValue - params.operand;
    case 'multiply':
      return inputValue * params.operand;
    case 'divide':
      if (params.operand === 0) {
        throw new Error("SimpleMathAgent: Cannot divide by zero.");
      }
      return inputValue / params.operand;
    default:
      // Ensure exhaustive check with a little trick for TypeScript
      const exhaustiveCheck: never = params.operation;
      throw new Error(`SimpleMathAgent: Unknown operation '${exhaustiveCheck}'`);
  }
};


interface ExternalServiceParams {
  apiKey?: string; // Optional API key from params
  endpoint: string;
  timeout?: number;
}

interface ExternalServiceResponse {
  data: any;
  status: number;
}
/**
 * Custom Agent: ExternalServiceAgent (Asynchronous)
 * Simulates calling an external API.
 */
export const externalServiceAgent: AgentFunction<ExternalServiceParams, any, ExternalServiceResponse> = async (
  context: AgentFunctionContext<ExternalServiceParams, any>
): Promise<ExternalServiceResponse> => {
  const { params, inputs, agentId, log } = context;
  const requestPayload = inputs[0]; // Assuming payload is the first input

  // Use logger from context
  log?.debug(`Agent ${agentId}: Calling external service at ${params.endpoint}`, requestPayload);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, params.timeout || 1000));

  // In a real agent, you'd use fetch or axios here
  // const apiKey = params.apiKey || process.env.MY_SERVICE_API_KEY;
  // if (!apiKey) throw new Error(`Agent ${agentId}: API key is missing.`);
  // const response = await fetch(params.endpoint, { method: 'POST', body: JSON.stringify(requestPayload), headers: {'Authorization': `Bearer ${apiKey}`} });
  // if (!response.ok) throw new Error(`Agent ${agentId}: API call failed with status ${response.status}`);
  // const data = await response.json();

  // Mocked response
  const mockData = {
    originalPayload: requestPayload,
    message: `Successfully called ${params.endpoint}`,
    processedAt: new Date().toISOString()
  };

  log?.info(`Agent ${agentId}: Service call successful.`);
  return { data: mockData, status: 200 };
};


interface StringManipulationParams {
  action: 'uppercase' | 'lowercase' | 'reverse';
}
/**
 * Custom Agent: StringManipulatorAgent
 * Performs various string manipulations.
 */
export const stringManipulatorAgent: AgentFunction<StringManipulationParams, string, string> = async ({ params, inputs }) => {
  const inputString = inputs[0];
  if (typeof inputString !== 'string') {
    throw new Error("StringManipulatorAgent: Input must be a string.");
  }

  switch (params.action) {
    case 'uppercase':
      return inputString.toUpperCase();
    case 'lowercase':
      return inputString.toLowerCase();
    case 'reverse':
      return inputString.split('').reverse().join('');
    default:
      throw new Error(`StringManipulatorAgent: Unknown action '${params.action}'`);
  }
};
```

### 3. Using Custom Agents in a Workflow

Now, let's create a main script (`src/main.ts` or `main.js`) to run a GraphAI workflow that uses these custom agents.

```typescript
import { GraphAI, GraphAIConfig } from 'graphai';
import { vanillaAgents } from '@graphai/vanilla'; // For textInputAgent, etc.

// Import our custom agents
import { simpleMathAgent, externalServiceAgent, stringManipulatorAgent } from './customAgents';

// Register custom agents with GraphAI.
// It's good practice to namespace them.
const allAgents = {
  ...vanillaAgents, // Include standard agents
  myNamespace_simpleMath: simpleMathAgent,
  myNamespace_externalService: externalServiceAgent,
  myNamespace_stringManipulator: stringManipulatorAgent,
};

const workflowConfig: GraphAIConfig = {
  // version: 0.2, // If using newer features
  nodes: {
    initialValue: {
      // Using a vanilla agent to provide initial data
      agent: "textInputAgent",
      params: {
        value: 10 // This value will be passed as input to the first math operation
      }
    },
    addFive: {
      agent: "myNamespace_simpleMath",
      params: {
        operation: "add",
        operand: 5
      },
      inputs: [":initialValue"] // Takes output from initialValue node
    },
    multiplyByTwo: {
      agent: "myNamespace_simpleMath",
      params: {
        operation: "multiply",
        operand: 2
      },
      inputs: [":addFive"] // Takes output from addFive node
    },
    callMyService: {
      agent: "myNamespace_externalService",
      params: {
        endpoint: "https://api.example.com/process",
        timeout: 1500
      },
      // Pass the result of multiplyByTwo as payload to the service
      inputs: [":multiplyByTwo"] 
    },
    extractMessage: {
        // Example of using a vanilla agent to process output from custom agent
        agent: "propertyFilterAgent",
        params: {
            path: "data.message" // Path to extract from externalServiceAgent's output
        },
        inputs: [":callMyService"]
    },
    formatMessage: {
      agent: "myNamespace_stringManipulator",
      params: {
        action: "uppercase"
      },
      inputs: [":extractMessage"] // Takes the extracted message
    }
  },
  // Define the entry and exit points of the graph if not implicitly clear
  // For this linear graph, it's fairly clear, but explicit is good.
  // entry: "initialValue", // Not strictly needed if only one node has no inputs
  // exit: "formatMessage" // Not strictly needed if only one node has no outputs feeding other nodes
};

async function runWorkflow() {
  try {
    const graph = new GraphAI(workflowConfig, allAgents);

    console.log("Running GraphAI workflow with custom agents...");
    
    // Provide initial inputs if your entry node expects them directly (e.g. if entry node was a functionInputAgent)
    // Since our entry is textInputAgent with a value, no direct input needed for graph.run() here.
    const results = await graph.run();

    console.log("\nWorkflow execution finished.");
    console.log("Final Output (formatted message):", results.formatMessage);
    console.log("\nFull Results Object:");
    console.log(JSON.stringify(results, null, 2));

    // You can also inspect intermediate results if needed:
    // console.log("\nResult of 'addFive':", graph.results.addFive);
    // console.log("Result of 'callMyService':", graph.results.callMyService);

  } catch (error) {
    console.error("\nWorkflow failed:", error);
  }
}

runWorkflow();
```

### 4. Running the Example

1.  Compile TypeScript (if using):
    ```bash
    npm run build
    ```
2.  Run the main script:
    ```bash
    # If TypeScript and using ts-node for dev
    npm run dev 
    # (Assuming "dev": "nodemon --exec ts-node src/main.ts")

    # If compiled to JavaScript
    npm start 
    # (Assuming "start": "node dist/main.js")
    ```

**Expected Output (approximate):**
```
Running GraphAI workflow with custom agents...
Agent myNamespace_externalService: Calling external service at https://api.example.com/process 30
Agent myNamespace_externalService: Service call successful.

Workflow execution finished.
Final Output (formatted message): SUCCESSFULLY CALLED HTTPS://API.EXAMPLE.COM/PROCESS

Full Results Object:
{
  "initialValue": 10,
  "addFive": 15,
  "multiplyByTwo": 30,
  "callMyService": {
    "data": {
      "originalPayload": 30,
      "message": "Successfully called https://api.example.com/process",
      "processedAt": "202X-XX-XXTXX:XX:XX.XXXS"
    },
    "status": 200
  },
  "extractMessage": "Successfully called https://api.example.com/process",
  "formatMessage": "SUCCESSFULLY CALLED HTTPS://API.EXAMPLE.COM/PROCESS"
}
```

## Key Concepts for Custom Agents

-   **`AgentFunction<Params, Inputs, Output>`**: The core type for an agent.
    -   `Params`: Type for the `params` object defined in the node configuration.
    -   `Inputs`: Type for the `inputs` array (resolved values from input nodes). Can be a tuple for fixed inputs (e.g., `[string, number]`) or an array type (e.g., `any[]` or `Record<string, any>[]` if inputs are named).
    -   `Output`: Type for the value the agent resolves to.
-   **`AgentFunctionContext`**: The object passed to your agent function, containing:
    -   `params`: The static parameters for this agent instance.
    -   `inputs`: An array of resolved values from the input nodes.
    -   `agentId`: The ID (key) of the current node in the graph.
    -   `graphData`: The full graph data (nodes, edges, etc.).
    -   `loop`: Information about the current loop iteration, if applicable.
    -   `log`: A logger instance (debug, info, warn, error methods) specific to the agent.
    -   `config`: The global GraphAI configuration.
-   **Asynchronous Operations**: Agents can be `async` and return a `Promise`. GraphAI will await their completion.
-   **Error Handling**: Throwing an error within an agent will typically halt the graph execution at that node (unless `onError` is configured for the node).
-   **Registration**: Custom agents must be provided to the `GraphAI` constructor in the `agents` mapping. Namespacing (e.g., `myNamespace_agentName`) is a good practice to avoid conflicts with built-in or other third-party agents.
-   **Logging**: Use `context.log` for logging within your agent. This helps in debugging and tracing agent execution.

## Best Practices for Custom Agents

-   **Keep Agents Focused**: Each agent should ideally do one thing well.
-   **Clear Parameters**: Define clear and well-typed `params` for configurability.
-   **Handle Inputs Robustly**: Validate input types and presence.
-   **Idempotency (where applicable)**: If an agent might be retried, consider if it should produce the same output given the same input.
-   **Provide Useful Logs**: Use the `context.log` for meaningful debug and informational messages.
-   **Manage State Carefully**: Agents are generally stateless. If state is needed between runs or across agents, consider using GraphAI's state management features or external stores.
-   **TypeScript**: Strongly recommended for defining agent interfaces and ensuring type safety.

This example provides a foundation for creating powerful, reusable custom logic within your GraphAI workflows.