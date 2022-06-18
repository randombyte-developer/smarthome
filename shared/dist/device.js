"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devicesConfigSchema = exports.deviceConfigSchema = exports.deviceDtoSchema = void 0;
const state_1 = require("./state");
exports.deviceDtoSchema = {
    properties: {
        id: { type: "string" },
        type: { type: "string" },
        name: { type: "string" },
        state: state_1.stateDtoSchema,
    },
};
exports.deviceConfigSchema = {
    properties: {
        id: { type: "string" },
        type: { type: "string" },
        name: { type: "string" },
        address: { type: "string" },
        states: { elements: Object.assign({}, state_1.stateConfigSchema) },
        defaultState: { type: "string" },
    },
    optionalProperties: {
        tasmotaSetupCommand: { type: "string" },
    },
};
exports.devicesConfigSchema = {
    properties: {
        devices: { elements: Object.assign({}, exports.deviceConfigSchema) },
    },
};
