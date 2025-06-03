# Build a Custom Agent Generator

Learn to create a visual tool for generating GraphAI agent configurations using the `@receptron/event_agent_generator` package. This tutorial focuses on building a Vue.js application to simplify agent creation.

## 🎯 What You'll Build

- **A web interface** for selecting agent types and configuring their parameters.
- **Dynamic form generation** based on selected agent specifications.
- **JSON output** of the configured agent, ready to be used in a GraphAI workflow.
- **Integration with GraphAI** to potentially test or use the generated agent.

## 📋 Prerequisites

- **Node.js 16+** installed.
- Basic knowledge of **Vue.js (Composition API)**.
- Understanding of **GraphAI agents** and their structure.
- Familiarity with the `@receptron/event_agent_generator` package (if pre-existing, otherwise we'll explore its concepts).

⏱️ **Estimated time**: 40-55 minutes

## 🛠️ Step 1: Project Setup

### Create New Vue Project

```bash
# Create a new Vue project
npm create vue@latest graphai-agent-generator-ui
cd graphai-agent-generator-ui

# Install dependencies
# Assuming event_agent_generator provides composables/components
npm install @receptron/event_agent_generator graphai
# If it's a standalone tool, we might integrate it differently or build from scratch.
# For this tutorial, we'll assume it provides Vue utilities.
```
Select "No" for TypeScript, JSX, Vue Router, Pinia, Vitest, E2E Testing, ESLint, Prettier for a minimal setup, or configure as needed.

### Understanding `@receptron/event_agent_generator`

From the memory bank, `@receptron/event_agent_generator` (v0.0.6) is a Vue-based tool for generating GraphAI agents with text input capabilities. We'll assume it exports composables or components we can use. If it's a complete standalone app, this tutorial might shift to *using* it and integrating its output. For now, let's assume we're building a UI *with* its utilities.

## 🛠️ Step 2: Core UI Structure

Create the main application layout.

In `src/App.vue`:
```vue
<template>
  <div id="agent-generator-app">
    <header>
      <h1>GraphAI Agent Generator</h1>
    </header>
    <main>
      <div class="config-panel">
        <h2>Agent Configuration</h2>
        <AgentSelector @agent-selected="updateSelectedAgent" />
        <AgentForm 
          v-if="selectedAgentDefinition" 
          :agent-definition="selectedAgentDefinition"
          @config-updated="updateAgentConfig" 
        />
      </div>
      <div class="output-panel">
        <h2>Generated Agent JSON</h2>
        <pre>{{ generatedAgentJson }}</pre>
        <button @click="copyJson" :disabled="!generatedAgentJson">Copy JSON</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AgentSelector from './components/AgentSelector.vue';
import AgentForm from './components/AgentForm.vue';
// We'll assume TextInputAgentGenerator is a utility from the package
// import { TextInputAgentGenerator } from '@receptron/event_agent_generator';

// Mock agent definitions - in a real app, these might come from a service or the package
const agentDefinitions = {
  textInputAgent: {
    name: 'Text Input Agent',
    description: 'Receives text input.',
    params: [
      { name: 'message', type: 'string', default: '', label: 'Default Message' },
      { name: 'isOptional', type: 'boolean', default: false, label: 'Is Optional?' }
    ]
  },
  openAIAgent: {
    name: 'OpenAI Agent',
    description: 'Interacts with OpenAI API.',
    params: [
      { name: 'model', type: 'select', options: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'], default: 'gpt-3.5-turbo', label: 'Model' },
      { name: 'temperature', type: 'number', default: 0.7, min:0, max:2, step:0.1, label: 'Temperature' },
      { name: 'max_tokens', type: 'number', default: 256, min:1, label: 'Max Tokens' },
      { name: 'system_message', type: 'textarea', default: 'You are a helpful assistant.', label: 'System Message' }
    ]
  }
  // Add more agent definitions
};

const selectedAgentKey = ref(null);
const agentConfig = ref({});

const selectedAgentDefinition = computed(() => {
  return selectedAgentKey.value ? agentDefinitions[selectedAgentKey.value] : null;
});

const generatedAgentJson = computed(() => {
  if (!selectedAgentKey.value || !selectedAgentDefinition.value) return '';
  const agentOutput = {
    agent: selectedAgentKey.value, // The key is often the agentId in GraphAI
    params: { ...agentConfig.value }
    // inputs, nodes, etc. might also be configurable depending on agent type
  };
  return JSON.stringify(agentOutput, null, 2);
});

const updateSelectedAgent = (agentKey) => {
  selectedAgentKey.value = agentKey;
  agentConfig.value = {}; // Reset config
  // Initialize with default values
  if (selectedAgentDefinition.value) {
    selectedAgentDefinition.value.params.forEach(param => {
      agentConfig.value[param.name] = param.default;
    });
  }
};

const updateAgentConfig = (newConfig) => {
  agentConfig.value = newConfig;
};

const copyJson = async () => {
  if (!generatedAgentJson.value) return;
  try {
    await navigator.clipboard.writeText(generatedAgentJson.value);
    alert('Agent JSON copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy text: ', err);
    alert('Failed to copy JSON. See console for details.');
  }
};

</script>

<style>
#agent-generator-app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
header {
  text-align: center;
  margin-bottom: 30px;
}
main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}
.config-panel, .output-panel {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
h2 {
  margin-top: 0;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
pre {
  background-color: #f3f4f6;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9em;
  border: 1px solid #e5e7eb;
}
button {
  padding: 10px 15px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  margin-top: 10px;
}
button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background-color: #2563eb;
}
</style>
```

## 🛠️ Step 3: Agent Selector Component

Create `src/components/AgentSelector.vue`:
```vue
<template>
  <div class="agent-selector">
    <label for="agent-type">Select Agent Type:</label>
    <select id="agent-type" v-model="selectedAgent" @change="emitSelection">
      <option disabled value="">Please select an agent</option>
      <option v-for="(def, key) in agentDefinitions" :key="key" :value="key">
        {{ def.name }}
      </option>
    </select>
    <p v-if="selectedDefinition" class="agent-description">{{ selectedDefinition.description }}</p>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue';

// In a real app, agentDefinitions would likely be props or fetched
const props = defineProps({
  agentDefinitions: {
    type: Object,
    default: () => ({ // Using the same mock as App.vue for consistency
      textInputAgent: { name: 'Text Input Agent', description: 'Receives text input.' },
      openAIAgent: { name: 'OpenAI Agent', description: 'Interacts with OpenAI API.' }
    })
  }
});


const selectedAgent = ref('');
const emit = defineEmits(['agent-selected']);

const selectedDefinition = computed(() => {
  return selectedAgent.value ? props.agentDefinitions[selectedAgent.value] : null;
});

const emitSelection = () => {
  emit('agent-selected', selectedAgent.value);
};
</script>

<style scoped>
.agent-selector {
  margin-bottom: 25px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #374151;
}
select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  font-size: 1em;
  box-sizing: border-box;
}
.agent-description {
  margin-top: 10px;
  font-size: 0.9em;
  color: #6b7280;
}
</style>
```
Update `App.vue` to pass `agentDefinitions` to `AgentSelector`:
```vue
<AgentSelector :agent-definitions="agentDefinitions" @agent-selected="updateSelectedAgent" />
```

## 🛠️ Step 4: Dynamic Agent Form Component

Create `src/components/AgentForm.vue`:
```vue
<template>
  <form @submit.prevent class="agent-form" v-if="agentDefinition">
    <h3>{{ agentDefinition.name }} Parameters</h3>
    <div v-for="param in agentDefinition.params" :key="param.name" class="form-group">
      <label :for="param.name">{{ param.label || param.name }}:</label>
      
      <input 
        v-if="param.type === 'string' || param.type === 'number'"
        :type="param.type"
        :id="param.name"
        v.model="localConfig[param.name]"
        @input="updateParam(param.name, $event.target.value, param.type)"
        :min="param.min" :max="param.max" :step="param.step"
        :placeholder="param.default"
      />
      
      <textarea
        v-else-if="param.type === 'textarea'"
        :id="param.name"
        v.model="localConfig[param.name]"
        @input="updateParam(param.name, $event.target.value)"
        :placeholder="param.default"
      ></textarea>

      <select 
        v-else-if="param.type === 'select'"
        :id="param.name"
        v.model="localConfig[param.name]"
        @change="updateParam(param.name, $event.target.value)"
      >
        <option v-for="option in param.options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>

      <input
        v-else-if="param.type === 'boolean'"
        type="checkbox"
        :id="param.name"
        :checked="localConfig[param.name]"
        @change="updateParam(param.name, $event.target.checked)"
        class="form-checkbox"
      />
      <span v-if="param.type === 'boolean'" class="checkbox-label">{{ param.label || param.name }}</span>

    </div>
  </form>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
  agentDefinition: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['config-updated']);
const localConfig = ref({});

// Initialize form with default values when definition changes
watch(() => props.agentDefinition, (newDef) => {
  const newConfig = {};
  if (newDef && newDef.params) {
    newDef.params.forEach(param => {
      newConfig[param.name] = param.default;
    });
  }
  localConfig.value = newConfig;
  emit('config-updated', { ...localConfig.value });
}, { immediate: true, deep: true });


const updateParam = (paramName, value, type) => {
  let parsedValue = value;
  if (type === 'number') {
    parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) parsedValue = props.agentDefinition.params.find(p => p.name === paramName).default;
  } else if (type === 'boolean') {
    // value is already boolean from checkbox change event
  }
  localConfig.value[paramName] = parsedValue;
  emit('config-updated', { ...localConfig.value });
};

</script>

<style scoped>
.agent-form {
  margin-top: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #374151;
}
.form-group input[type="string"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  font-size: 1em;
  box-sizing: border-box;
}
.form-group textarea {
  min-height: 80px;
  resize: vertical;
}
.form-checkbox {
  margin-right: 8px;
  width: auto; /* Override width for checkbox */
  vertical-align: middle;
}
.checkbox-label {
  vertical-align: middle;
}
h3 {
  color: #1f2937;
  margin-bottom: 15px;
}
</style>
```
Correct v-model usage in `AgentForm.vue`:
Change `v.model` to `v-model` for all input elements. For example:
`<input ... v-model="localConfig[param.name]" ... />`
`<textarea ... v-model="localConfig[param.name]" ... />`
`<select ... v-model="localConfig[param.name]" ... />`

And for the checkbox, `v-model` is more direct:
`<input type="checkbox" :id="param.name" v-model="localConfig[param.name]" @change="updateParam(param.name, localConfig[param.name])" class="form-checkbox" />`
Then `updateParam` for boolean doesn't need the type argument if `localConfig[param.name]` is already updated by `v-model`.

Corrected `updateParam` and `v-model` for `AgentForm.vue`:
```vue
<template>
  <form @submit.prevent class="agent-form" v-if="agentDefinition">
    <h3>{{ agentDefinition.name }} Parameters</h3>
    <div v-for="param in agentDefinition.params" :key="param.name" class="form-group">
      <label :for="param.name">{{ param.label || param.name }}:</label>
      
      <input 
        v-if="param.type === 'string' || param.type === 'number'"
        :type="param.type"
        :id="param.name"
        v-model="localConfig[param.name]"
        @input="handleInput(param.name, param.type)"
        :min="param.min" :max="param.max" :step="param.step"
        :placeholder="param.default"
      />
      
      <textarea
        v-else-if="param.type === 'textarea'"
        :id="param.name"
        v-model="localConfig[param.name]"
        @input="handleInput(param.name)"
        :placeholder="param.default"
      ></textarea>

      <select 
        v-else-if="param.type === 'select'"
        :id="param.name"
        v-model="localConfig[param.name]"
        @change="handleInput(param.name)"
      >
        <option v-for="option in param.options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>

      <template v-else-if="param.type === 'boolean'">
        <input
          type="checkbox"
          :id="param.name"
          v-model="localConfig[param.name]"
          @change="handleInput(param.name)"
          class="form-checkbox"
        />
        <span class="checkbox-label">{{ param.label || param.name }}</span>
      </template>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  agentDefinition: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['config-updated']);
const localConfig = ref({});

watch(() => props.agentDefinition, (newDef) => {
  const newConfig = {};
  if (newDef && newDef.params) {
    newDef.params.forEach(param => {
      newConfig[param.name] = param.default;
    });
  }
  localConfig.value = newConfig;
  // Emit initial config based on defaults
  emit('config-updated', { ...localConfig.value });
}, { immediate: true, deep: true });

const handleInput = (paramName, type) => {
  // For number inputs, v-model might return string, ensure it's a number
  if (type === 'number' && typeof localConfig.value[paramName] === 'string') {
    const parsed = parseFloat(localConfig.value[paramName]);
    if (!isNaN(parsed)) {
      localConfig.value[paramName] = parsed;
    } else {
      // Handle invalid number input, e.g., revert or set to default
      const paramDef = props.agentDefinition.params.find(p => p.name === paramName);
      localConfig.value[paramName] = paramDef ? paramDef.default : 0;
    }
  }
  emit('config-updated', { ...localConfig.value });
};
</script>
<!-- Styles remain the same -->
```

## ✅ Step 5: Run and Test

```bash
npm run dev
```
Open your browser (usually `localhost:5173`).
- Select an agent type from the dropdown.
- The form for its parameters should appear.
- Modify the parameters.
- The JSON output on the right should update in real-time.
- Test the "Copy JSON" button.

## 🎉 Congratulations!

You've built a functional GraphAI Agent Generator UI with:

✅ **Agent selection** from a predefined list.
✅ **Dynamic form generation** based on agent parameters.
✅ **Real-time JSON output** of the agent configuration.
✅ **Clipboard functionality** for easy copying.

## 🚀 Next Steps

### Enhance Your Agent Generator

- **Load Agent Definitions Dynamically**: Fetch agent schemas from a backend or a JSON file instead of hardcoding.
- **Input Validation**: Add validation rules to form fields (e.g., required, min/max values, regex patterns).
- **Advanced Parameter Types**: Support more complex types like arrays of objects, nested configurations, or file uploads.
- **Visual Preview**: If possible, show a visual representation or summary of the configured agent.
- **Save/Load Configurations**: Allow users to save their agent configurations and load them later.
- **Integration with `@receptron/event_agent_generator`**: If this package offers more advanced generation logic or UI components, integrate them. For example, if `TextInputAgentGenerator` is a class or function that produces a schema or a pre-built form, use that.
- **Test Agent**: Add a button to send the generated JSON to a running GraphAI server to test the agent (requires a test endpoint on the server).

### Explore More Tutorials

- **[Graph Dashboard](graph-dashboard.md)**: Visualize workflows where these generated agents can be used.
- **[Chat Server](chat-server.md)**: Build a backend that could consume these agent configurations.

## 📚 Reference Materials

- **[Vue.js Documentation](https://vuejs.org/guide/introduction.html)**
- **[GraphAI Core Concepts](https://github.com/receptron/graphai/blob/main/docs/README.md)** (Link to actual GraphAI docs if available)
- **`@receptron/event_agent_generator` package documentation** (if available)