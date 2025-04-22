import { GraphData } from "graphai";
import { GraphDictionary } from "../src/type";

export const llmGraphData: GraphData = {
  version: 0.5,
  nodes: {
    messages: {
      value: [],
    },
    llm: {
      agent: "openAIAgent",
      params: {
        stream: true,
        isResult: true,
      },
      inputs: {
        messages: ":messages",
      },
      isResult: true,
    },
  },
};

export const graphDictonary: GraphDictionary = {
  llmGraphData,
};
