# Package: @receptron/event_agent_generator

**Version**: `0.0.6` (Active Development)

## Overview

`@receptron/event_agent_generator` is a Vue-based package providing tools and utilities for generating GraphAI agent configurations. It aims to simplify the process of creating the JSON structures that define agents within a GraphAI workflow, particularly focusing on agents related to events or text inputs.

Given its Vue.js foundation and the presence of files like `App.vue`, `main.ts`, and `index.html` in its source structure (as seen in the monorepo file listing), this package likely offers a user interface or a set of UI components for agent configuration.

## Key Features

-   **Vue.js Components/Application**: Provides a UI for defining agent properties.
-   **Agent Configuration Generation**: Outputs JSON or JavaScript object structures representing GraphAI agents.
-   **Focus on Event/Text Agents**: May have specialized UIs or templates for common event-driven or text-input-based agents (e.g., `textInputAgent`, `eventTriggerAgent`).
-   **Simplifies Workflow Creation**: Helps users create valid agent configurations without needing to write JSON manually.
-   **TypeScript Support**: Likely built with TypeScript, offering type safety for its internal logic and potentially for the schemas it uses or generates.
-   **Vite-Powered Development**: Uses Vite for its development server and build process.

## Installation

As this package seems to provide a UI tool or components, direct installation into a user's project might be for embedding its components or for developers contributing to the tool itself.

If it's a standalone tool (e.g., a web application):
-   It might be hosted, or users would clone the `graphai-utils` monorepo, navigate to `packages/event_agent_generator`, and run its dev server.
    ```bash
    # In packages/event_agent_generator directory
    npm install # or yarn install
    npm run dev # or yarn dev (starts Vite dev server)
    ```

If it exports Vue components for use in other Vue applications:
```bash
npm install @receptron/event_agent_generator vue@^3
# or
yarn add @receptron/event_agent_generator vue@^3
```

The package structure includes `lib/event_agent_generator.js`, `lib/text_input_agent_generator.js`, and `lib/index.js`, suggesting it exports modules that can be imported.

## Core API & Usage (Conceptual)

The usage depends on whether it's a standalone application or exports reusable Vue components/composables.

### Scenario 1: As a Standalone Tool/UI

1.  Run the development server (e.g., `npm run dev` within its package directory).
2.  Open the provided URL in a browser.
3.  Use the UI to:
    -   Select an agent type (e.g., "Text Input Agent", "Event Listener Agent").
    -   Fill in forms to configure the agent's `params`, `inputs`, `isStatic`, etc.
    -   The UI would display the generated JSON configuration for the agent.
    -   Copy the generated JSON and paste it into your GraphAI workflow definition.

### Scenario 2: As Exported Vue Components/Composables

If the package exports Vue components:

```vue
<template>
  <div>
    <h2>Configure Your Agent</h2>
    <AgentConfiguratorComponent 
      :agent-type-schema="selectedAgentSchema"
      @config-updated="handleAgentConfigChange"
    />
    <!-- Or specific generators like: -->
    <!-- <TextInputAgentGeneratorForm @generated="handleTextInputAgent" /> -->
    
    <div v-if="generatedAgent">
      <h3>Generated Agent:</h3>
      <pre>{{ JSON.stringify(generatedAgent, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// Assuming components or composables are exported
// import { AgentConfiguratorComponent, TextInputAgentGeneratorForm } from '@receptron/event_agent_generator';
// import type { AgentConfig } from '@receptron/event_agent_generator'; // Assuming type export

const selectedAgentSchema = ref({ /* ... schema for a specific agent type ... */ });
const generatedAgent = ref<any | null>(null); // Use a more specific AgentConfig type

function handleAgentConfigChange(config: any /* AgentConfig */) {
  generatedAgent.value = config;
}

// function handleTextInputAgent(config: any /* AgentConfig for text input */) {
//   generatedAgent.value = config;
// }
</script>
```

The files `src/text_input_agent_generator.ts` and `src/event_agent_generator.ts` suggest there might be specific logic or classes for generating these types of agents. These could be:
-   Classes that take parameters and have a `generate()` method.
-   Vue composables that provide reactive state and methods for building an agent config.

**Example (Conceptual Class Usage):**
```typescript
// import { TextInputAgentGenerator, EventAgentSchema } from '@receptron/event_agent_generator';

// const generator = new TextInputAgentGenerator({
//   nodeId: "myTextInputNode",
//   defaultValue: "Hello, GraphAI!",
//   isOptional: false
// });
// const agentConfigJson = generator.toJson(); 
// console.log(agentConfigJson);

// const eventSchema: EventAgentSchema = { /* ... define schema ... */ };
// const eventAgentConfig = EventAgentGenerator.generateFromSchema(eventSchema);
```

## Key Files & Structure Insights

From the monorepo file listing:
-   `src/App.vue`, `src/main.ts`: Indicate a runnable Vue application.
-   `src/event_agent_generator.ts`: Likely contains core logic for generating generic event-related agent configurations.
-   `src/text_input_agent_generator.ts`: Specialized logic for generating `textInputAgent` configurations or similar.
-   `src/data.ts`: Might contain predefined schemas or options for agent types.
-   `lib/index.js`, `lib/event_agent_generator.js`, `lib/text_input_agent_generator.js`: These are the compiled JavaScript outputs, suggesting the package exports these modules.

## Use Cases

-   **Rapid Prototyping**: Quickly generate agent configurations without deep-diving into JSON syntax.
-   **User-Friendly Workflow Building**: Integrate these tools into a larger workflow builder UI to allow less technical users to configure parts of a GraphAI workflow.
-   **Standardizing Agent Creation**: Ensure consistent and valid agent configurations by using a guided generation process.
-   **Educational Tool**: Help new GraphAI users understand how agent configurations are structured.

## Integration with GraphAI Workflows

The output of this generator (typically a JSON object representing an agent node) is directly usable within a `GraphAIConfig`:

```typescript
// const generatedAgentConfig = { /* ... JSON output from the generator ... */ };
// const myWorkflow: GraphAIConfig = {
//   nodes: {
//     myGeneratedNode: generatedAgentConfig,
//     anotherNode: {
//       agent: "someOtherAgent",
//       inputs: [":myGeneratedNode"] // Use output from the generated agent
//     }
//     // ...
//   }
// };
```

## Further Considerations

-   **Schema Definition**: How are the "configurable" parts of an agent defined for the generator? It might use JSON Schema or custom schema objects.
-   **Extensibility**: Can users add their own custom agent types to the generator?
-   **Validation**: Does the generator validate the configuration to ensure it's a valid GraphAI agent structure?

To get precise API details and usage, refer to any `README.md` within the `packages/event_agent_generator` directory or explore its exported modules and type definitions (`lib/*.d.ts`). The [Agent Generator Tutorial](../../tutorials/agent-generator.md) also provides practical usage examples.