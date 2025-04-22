"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelList = void 0;
const modelList = (modelDictionary) => {
    return async (req, res) => {
        const data = Object.keys(modelDictionary).map((id) => {
            // const model = modelDictionary[id];
            return {
                id,
                object: "model",
                created: 1686935002,
                owned_by: "graphai",
            };
        });
        res.json({ object: "list", data });
    };
};
exports.modelList = modelList;
