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

export type StreamChunkCallback = <T = string | Record<string, string>>(context: AgentFunctionContext, token: T, status?: string) => void;

export type ContentCallback = <T = string | Record<string, string>>(token: T) => void;

export const DefaultEndOfStreamDelimiter = "___END___";
