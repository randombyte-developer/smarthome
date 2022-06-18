"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateConfigSchema = exports.stateDtoSchema = void 0;
exports.stateDtoSchema = {
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        imageUrl: { type: "string" },
    },
};
exports.stateConfigSchema = {
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        toggledId: { type: "string" },
        imageUrl: { type: "string" },
    },
};
