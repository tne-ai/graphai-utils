import express from "express";

import { AgentFunctionInfoDictonary } from "graphai/lib/type";
import * as agents from "graphai/lib/experimental_agents";

const agentDictionary: AgentFunctionInfoDictonary = agents;

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

export const agentDispatcher = async (req: express.Request, res: express.Response) => {
  const { params } = req;
  const { agentId } = params;
  const { nodeId, retry, params: agentParams, inputs } = req.body;
  const agent = agentDictionary[agentId];
  if (agent === undefined) {
    res.status(404).send("Not found");
    return;
  }
  const result = await agent.agent({
    params: agentParams,
    inputs,
    debugInfo: {
      nodeId,
      retry,
      verbose: false,
    },
    agents,
    filterParams: {},
  });
  res.json(result);
};

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
