"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentsList = exports.agentDispatcher = exports.agentDoc = void 0;
const agents = __importStar(require("graphai/lib/experimental_agents"));
const agentDictionary = agents;
const agentDoc = (hostName = "https://example.com", urlPath = "/agent") => {
    return async (req, res) => {
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
exports.agentDoc = agentDoc;
const agentDispatcher = async (req, res) => {
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
exports.agentDispatcher = agentDispatcher;
const agentsList = (hostName = "https://example.com", urlPath = "/agent") => {
    return async (req, res) => {
        const list = Object.keys(agentDictionary).map((agentName) => {
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
exports.agentsList = agentsList;
