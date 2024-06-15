"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamAgentDispatcher = exports.nonStreamAgentDispatcher = exports.agentDispatcher = exports.agentDoc = exports.agentsList = void 0;
const agent_filters_1 = require("@graphai/agent_filters");
// express middleware
// return agent list
const agentsList = (agentDictionary, hostName = "https://example.com", urlPath = "/agent") => {
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
                samples: agent.samples,
                inputs: agent.inputs,
                output: agent.output,
            };
        });
        res.json({ agents: list });
    };
};
exports.agentsList = agentsList;
// express middleware
// return agent detail info
const agentDoc = (agentDictionary, hostName = "https://example.com", urlPath = "/agent") => {
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
// express middleware
// run agent
const agentDispatcher = (agentDictionary, agentFilters = []) => {
    const nonStram = (0, exports.nonStreamAgentDispatcher)(agentDictionary, agentFilters);
    const stream = (0, exports.streamAgentDispatcher)(agentDictionary, agentFilters);
    return async (req, res, next) => {
        const isStreaming = (req.headers["content-type"] || "").startsWith("text/event-stream");
        if (isStreaming) {
            return await stream(req, res, next);
        }
        return await nonStram(req, res, next);
    };
};
exports.agentDispatcher = agentDispatcher;
// express middleware
// run agent
const nonStreamAgentDispatcher = (agentDictionary, agentFilters = []) => {
    return async (req, res, next) => {
        try {
            const dispatcher = agentDispatcherInternal(agentDictionary, agentFilters);
            const result = await dispatcher(req, res);
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    };
};
exports.nonStreamAgentDispatcher = nonStreamAgentDispatcher;
// express middleware
// run agent with streaming
const streamAgentDispatcher = (agentDictionary, agentFilters = []) => {
    return async (req, res, next) => {
        try {
            res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
            res.setHeader("Cache-Control", "no-cache, no-transform");
            res.setHeader("X-Accel-Buffering", "no");
            const callback = (context, token) => {
                if (token) {
                    res.write(token);
                }
            };
            const streamAgentFilter = {
                name: "streamAgentFilter",
                agent: (0, agent_filters_1.streamAgentFilterGenerator)(callback),
            };
            const filterList = [...agentFilters, streamAgentFilter];
            const dispatcher = agentDispatcherInternal(agentDictionary, filterList);
            const result = await dispatcher(req, res);
            const json_data = JSON.stringify(result);
            res.write("___END___");
            res.write(json_data);
            return res.end();
        }
        catch (e) {
            next(e);
        }
    };
};
exports.streamAgentDispatcher = streamAgentDispatcher;
// dispatcher internal function
const agentDispatcherInternal = (agentDictionary, agentFilters = []) => {
    return async (req, res) => {
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
        const agentFilterRunner = (0, agent_filters_1.agentFilterRunnerBuilder)(agentFilters);
        const result = await agentFilterRunner(context, agent.agent);
        return result;
    };
};
