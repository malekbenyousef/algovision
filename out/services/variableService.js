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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrichedVariables = getEnrichedVariables;
exports.getEnrichedVariablesWithRetry = getEnrichedVariablesWithRetry;
const vscode = __importStar(require("vscode"));
const dapClient_1 = require("../debugger/dapClient");
const enrichers_1 = require("../enrichers");
async function getEnrichedVariables(session) {
    const rawVariables = await (0, dapClient_1.fetchRawVariables)(session);
    const enriched = await Promise.all(rawVariables.map((variable) => {
        const enricher = enrichers_1.enrichers.find((e) => e.canHandle(variable));
        return enricher.enrich(variable, session);
    }));
    return enriched;
}
async function getEnrichedVariablesWithRetry(session, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            const activeSession = vscode.debug.activeDebugSession ?? session;
            return await getEnrichedVariables(activeSession);
        }
        catch (error) {
            if (i === retries - 1)
                throw error;
            await new Promise((resolve) => setTimeout(resolve, 150 * (i + 1)));
        }
    }
    throw new Error('Unreachable');
}
//# sourceMappingURL=variableService.js.map