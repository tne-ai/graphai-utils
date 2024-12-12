<template>
  <main>
    <div class="h-screen w-full">
      <div class="w-10/12 bg-white">
        <div v-if="inputPromises.length > 0">
          <div v-for="(inputPromise, k) in inputPromises" class="flex" :key="k">
            <input
              v-model="userInputs[inputPromise.params['name']]"
              @keyup.enter="submit(inputPromise.id, inputPromise.params['name'])"
              class="border-2 p-2 rounded-md flex-1 m-4"
              :placeholder="inputPromise.params['name']"
            />
            <button
              class="text-white font-bold items-center rounded-md px-4 py-2 ml-1 hover:bg-sky-700 flex-none m-4"
              :class="inputPromise.length == 0 ? 'bg-sky-200' : 'bg-sky-500'"
              @click="submit(inputPromise.id, inputPromise.params['name'])"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <div>{{ userInputs }}</div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { GraphAI } from "graphai";
import * as vanilla from "@graphai/vanilla";

import { graphData } from "./data";
import { textInputAgentGenerator } from "./text_input_agent_generator";

export default defineComponent({
  setup() {
    const userInputs = ref({});
    const inputPromises = ref<{ task: (message: string) => void; id: string; nodeId: string; agentId?: string; params: any }[]>([]);
    const { textInputAgent, submit } = textInputAgentGenerator(inputPromises.value);

    const run = async () => {
      const graphai = new GraphAI(graphData, { ...vanilla, textInputAgent });
      const result = await graphai.run(true);
      console.log(result);
    };
    run();

    return {
      inputPromises,
      userInputs,
      submit,
    };
  },
});
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
