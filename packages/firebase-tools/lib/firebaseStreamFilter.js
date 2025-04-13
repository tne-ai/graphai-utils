"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFirebaseStreamFilter = void 0;
const functions_1 = require("firebase/functions");
const buildFirebaseStreamFilter = (firebaseApp, region, functionName) => {
    const functions = (0, functions_1.getFunctions)(firebaseApp, region);
    const firebaseStreamCallable = (0, functions_1.httpsCallable)(functions, functionName);
    const firebaseStreamFilter = async (context, __next) => {
        const { params, debugInfo, filterParams, namedInputs } = context;
        const agentId = debugInfo.agentId;
        const agentCallPayload = {
            agentId,
            params,
            debugInfo,
            filterParams,
            namedInputs,
        };
        const { stream, data } = await firebaseStreamCallable.stream(agentCallPayload);
        for await (const chunk of stream) {
            if (filterParams.streamTokenCallback) {
                context.filterParams.streamTokenCallback(chunk.delta);
            }
        }
        const allData = await data;
        return allData;
    };
    return {
        firebaseStreamFilter,
    };
};
exports.buildFirebaseStreamFilter = buildFirebaseStreamFilter;
