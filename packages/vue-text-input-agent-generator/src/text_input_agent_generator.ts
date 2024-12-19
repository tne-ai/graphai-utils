import { AgentFunction, AgentFunctionContext, agentInfoWrapper } from "graphai";

export type InputPromises = { task: (message: string) => void; id: string; nodeId: string; agentId?: string; params: any }[];

export const textInputAgentGenerator = (inputPromises: { task: (message: string) => void; id: string; nodeId: string; agentId?: string; params: any }[]) => {
  const submit = (id: string, value: string, success?: () => void) => {
    if (inputPromises.length > 0) {
      const index = inputPromises.findIndex((inp) => inp.id === id);
      if (index > -1) {
        inputPromises[index].task(value);
        inputPromises.splice(index, 1);
        if (success) {
          success();
        }
      }
    }
  };
  const textPromise = (context: AgentFunctionContext) => {
    const id = Math.random().toString(32).substring(2);
    return new Promise((resolved) => {
      const task = (message: string) => {
        resolved(message);
      };
      const { params } = context;
      const { nodeId, agentId } = context.debugInfo;
      inputPromises.push({ task, id, nodeId, agentId, params });
    });
  };

  const textInputAgent: AgentFunction = async (context) => {
    const result = await textPromise(context);
    return {
      text: result as string,
      message: { role: "user", content: result as string },
    };
  };
  return {
    textInputAgent: agentInfoWrapper(textInputAgent),
    submit,
  };
};
