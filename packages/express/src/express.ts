import express from "express";
import type { RequestHandler } from "express";

import { AgentFunctionInfoDictonary, AgentFilterInfo, AgentFunctionContext } from "graphai/lib/type";
import { agentFilterRunnerBuilder } from "graphai/lib/utils/test_utils";
import { streamAgentFilterGenerator } from "graphai/lib/experimental_agent_filters/stream";
import * as agents from "graphai/lib/experimental_agents";

const agentDictionary: AgentFunctionInfoDictonary = agents;

// express middleware
// return agent list
export const agentsList = (hostName: string = "https://example.com", urlPath: string = "/agent") => {
  return async (req: express.Request, res: express.Response) => {
    const list = Object.keys(agentDictionary).map((agentName: keyof AgentFunctionInfoDictonary) => {
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
      };
    });
    res.json({ agents: list });
  };
};

// express middleware
// return agent detail info
export const agentDoc = (hostName: string = "https://example.com", urlPath: string = "/agent") => {
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
export const agentDispatcher = (agentFilters: AgentFilterInfo[] = []) => {
  return async (req: express.Request, res: express.Response) => {
    const dispatcher = agentDispatcherInternal(agentFilters);
    const result = dispatcher(req, res);
    return res.json(result);
  };
};

// express middleware
// run agent with streaming
export const streamAgentDispatcher = (agentFilters: AgentFilterInfo[] = []) => {
  return async (req: express.Request, res: express.Response) => {
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

    const dispatcher = agentDispatcherInternal(filterList);
    const result = await dispatcher(req, res);
    const json_data = JSON.stringify(result);
    res.write("___END___");
    res.write(json_data);
    return res.end();
  };
};

// dispatcher internal function
const agentDispatcherInternal = (agentFilters: AgentFilterInfo[] = []) => {
  return async (req: express.Request, res: express.Response) => {
    const { params } = req;
    const { agentId } = params;
    const { nodeId, retry, params: agentParams, inputs } = req.body;
    const agent = agentDictionary[agentId];
    if (agent === undefined) {
      res.status(404).send("Not found");
      return;
    }

    const context = {
      params: agentParams || {},
      inputs,
      debugInfo: {
        nodeId,
        retry,
        verbose: false,
      },
      agents,
      filterParams: {},
    };

    const agentFilterRunner = agentFilterRunnerBuilder(agentFilters);
    const result = await agentFilterRunner(context, agent.agent);
    return result;
  };
};
