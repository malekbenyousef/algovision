"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayEnricher = void 0;
const dapClient_1 = require("../debugger/dapClient");
class ArrayEnricher {
    canHandle(variable) {
        return (variable.variablesReference > 0 &&
            (variable.value.includes('Array') || variable.value.includes('[')));
    }
    async enrich(variable, session) {
        const children = await (0, dapClient_1.fetchChildren)(session, variable.variablesReference);
        const elements = children
            .filter((v) => !isNaN(parseInt(v.name)))
            .map((e) => e.value);
        return {
            kind: 'array',
            name: variable.name,
            isArray: true,
            elements,
        };
    }
}
exports.ArrayEnricher = ArrayEnricher;
//# sourceMappingURL=ArrayEnricher.js.map