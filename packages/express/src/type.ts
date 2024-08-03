import type { AgentFunctionInfoSample, AgentFunctionContext } from "graphai";

export type ExpressAgentInfo = {
  agentId: string;
  name: string;
  url: string;
  description: string;
  category: string[];
  author: string;
  license: string;
  repository: string;
  samples: AgentFunctionInfoSample[];
  inputs: any;
  output: any;
  stream: boolean;
};

export type StreamChunkCallback = (context: AgentFunctionContext, token: string | Record<string, string>) => void;
