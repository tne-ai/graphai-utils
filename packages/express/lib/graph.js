"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonStreamGraphRunner = exports.streamGraphRunner = exports.graphRunner = void 0;
const graphai_1 = require("graphai");
const agent_filters_1 = require("@graphai/agent_filters");
const graphRunner = (agentDictionary, agentFilters = []) => {
    const stream = (0, exports.streamGraphRunner)(agentDictionary, agentFilters);
    const nonStream = (0, exports.nonStreamGraphRunner)(agentDictionary, agentFilters);
    return async (req, res, next) => {
        const isStreaming = (req.headers["content-type"] || "").startsWith("text/event-stream");
        if (isStreaming) {
            return await stream(req, res, next);
        }
        return await nonStream(req, res, next);
    };
};
exports.graphRunner = graphRunner;
const streamGraphRunner = (agentDictionary, agentFilters = []) => {
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
            const dispatcher = streamGraphRunnerInternal(agentDictionary, filterList);
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
exports.streamGraphRunner = streamGraphRunner;
const nonStreamGraphRunner = (agentDictionary, agentFilters = []) => {
    return async (req, res, next) => {
        try {
            const dispatcher = streamGraphRunnerInternal(agentDictionary, agentFilters);
            const result = await dispatcher(req, res);
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    };
};
exports.nonStreamGraphRunner = nonStreamGraphRunner;
// internal function
const streamGraphRunnerInternal = (agentDictionary, agentFilters = []) => {
    return async (req, __res) => {
        const { graphData } = req.body;
        const graphai = new graphai_1.GraphAI(graphData, agentDictionary, { agentFilters });
        const result = await graphai.run(true);
        return result;
    };
};
