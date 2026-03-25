"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectEnricher = void 0;
const dapClient_1 = require("../debugger/dapClient");
class ObjectEnricher {
    canHandle(variable) {
        return variable.type === 'Object' && variable.variablesReference > 0;
    }
    async enrich(variable, session) {
        const children = await (0, dapClient_1.fetchChildren)(session, variable.variablesReference);
        const entries = children
            .filter((c) => c.presentationHint?.visibility !== 'internal')
            .map((c) => ({ key: c.name, value: c.value }));
        return {
            kind: 'object',
            name: variable.name,
            isObject: true,
            entries,
        };
    }
}
exports.ObjectEnricher = ObjectEnricher;
//# sourceMappingURL=ObjectEnricher.js.map