import { AgentFunction, AgentFunctionContext, agentInfoWrapper } from "graphai";

export type EventData = {
  onEnd: (data: unknown) => void;
  id: string;
  nodeId: string;
  agentId?: string;
  type: string;
  params: any;
  namedInputs: any;
  reject: (reason?: any) => void;
};

export const eventAgentGenerator = (onStart: (id: string, data: EventData) => void) => {
  const eventPromise = (context: AgentFunctionContext) => {
    const id = Math.random().toString(32).substring(2);
    return new Promise((resolved, reject) => {
      const onEnd = (data: unknown) => {
        resolved(data);
      };
      const { params, namedInputs } = context;
      const { nodeId, agentId } = context.debugInfo;
      const { type } = params;
      const data = { onEnd, id, nodeId, agentId, type, params, namedInputs, reject };
      onStart(id, data);
    });
  };

  const eventAgent: AgentFunction = async (context) => {
    const result = await eventPromise(context);
    return result;
  };
  return {
    eventAgent: agentInfoWrapper(eventAgent),
  };
};
