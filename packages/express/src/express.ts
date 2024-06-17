import express from "express";
import type { AgentFunctionInfoDictionary, AgentFilterInfo, AgentFunctionContext } from "graphai";
import { streamAgentFilterGenerator, agentFilterRunnerBuilder } from "@graphai/agent_filters";

export type ExpressAgentInfo = {
  agentId: string;
  name: string;
  url: string;
  description: string;
  category: string[];
  author: string;
  license: string;
  repository: string;
  samples: any, // TODO: AgentFunctionInfoSample from graph
  inputs: any;
  output: any;
  stream: boolean;
};

// express middleware
// return agent list
export const agentsList = (agentDictionary: AgentFunctionInfoDictionary, hostName: string = "https://example.com", urlPath: string = "/agent") => {
  return async (req: express.Request, res: express.Response) => {
    const list: ExpressAgentInfo[] = Object.keys(agentDictionary).map((agentName: keyof AgentFunctionInfoDictionary) => {
      const agent = agentDictionary[agentName];
      return {
        agentId: agentName,
        name: agent.name,
        url: hostName + urlPath + "/" + agentName,
        description: agent.description,
        category: agent.category,
        author: agent.author,
        license: agent.license,
        repository: agent.repository,
        samples: agent.samples,
        inputs: agent.inputs,
        output: agent.output,
        stream: agent.stream ?? false,
      };
    });
    res.json({ agents: list });
  };
};

// express middleware
// return agent detail info
export const agentDoc = (agentDictionary: AgentFunctionInfoDictionary, hostName: string = "https://example.com", urlPath: string = "/agent") => {
  return async (req: express.Request, res: express.Response) => {
    const { params } = req;
    const { agentId } = params;
    const agent = agentDictionary[agentId];
    if (agent === undefined) {
      res.status(404).send("Not found");
      return;
    }
    const result = {
      agentId: agentId,
      name: agent.name,
      url: hostName + urlPath + "/" + agentId,
      description: agent.description,
      category: agent.category,
      samples: agent.samples,
      author: agent.author,
      license: agent.license,
      repository: agent.repository,
    };
    res.json(result);
  };
};

// express middleware
// run agent
export const agentDispatcher = (agentDictionary: AgentFunctionInfoDictionary, agentFilters: AgentFilterInfo[] = []) => {
  const nonStram = nonStreamAgentDispatcher(agentDictionary, agentFilters);
  const stream = streamAgentDispatcher(agentDictionary, agentFilters);
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isStreaming = (req.headers["content-type"] || "").startsWith("text/event-stream");
    if (isStreaming) {
      return await stream(req, res, next);
    }
    return await nonStram(req, res, next);
  };
};

// express middleware
// run agent
export const nonStreamAgentDispatcher = (agentDictionary: AgentFunctionInfoDictionary, agentFilters: AgentFilterInfo[] = []) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const dispatcher = agentDispatcherInternal(agentDictionary, agentFilters);
      const result = await dispatcher(req, res);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  };
};

// express middleware
// run agent with streaming
export const streamAgentDispatcher = (agentDictionary: AgentFunctionInfoDictionary, agentFilters: AgentFilterInfo[] = []) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");

      const callback = (context: AgentFunctionContext, token: string) => {
        if (token) {
          res.write(token);
        }
      };
      const streamAgentFilter = {
        name: "streamAgentFilter",
        agent: streamAgentFilterGenerator<string>(callback),
      };
      const filterList = [...agentFilters, streamAgentFilter];

      const dispatcher = agentDispatcherInternal(agentDictionary, filterList);
      const result = await dispatcher(req, res);
      const json_data = JSON.stringify(result);
      res.write("___END___");
      res.write(json_data);
      return res.end();
    } catch (e) {
      next(e);
    }
  };
};

// dispatcher internal function
const agentDispatcherInternal = (agentDictionary: AgentFunctionInfoDictionary, agentFilters: AgentFilterInfo[] = []) => {
  return async (req: express.Request, res: express.Response) => {
    const { params } = req;
    const { agentId } = params;
    const { nodeId, retry, params: agentParams, inputs, namedInputs } = req.body;
    const agent = agentDictionary[agentId];
    if (agent === undefined) {
      res.status(404).send("Not found");
      return;
    }

    const context = {
      params: agentParams || {},
      inputs,
      namedInputs,
      debugInfo: {
        nodeId,
        retry,
        verbose: false,
      },
      agents: agentDictionary,
      filterParams: {},
    };

    const agentFilterRunner = agentFilterRunnerBuilder(agentFilters);
    const result = await agentFilterRunner(context, agent.agent);
    return result;
  };
};
