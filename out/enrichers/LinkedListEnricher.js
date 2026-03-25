"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedListEnricher = void 0;
const dapClient_1 = require("../debugger/dapClient");
class LinkedListEnricher {
    canHandle(variable) {
        return (variable.variablesReference > 0 &&
            /^\w+ \{.*next:/.test(variable.value));
    }
    async enrich(variable, session) {
        const nodes = [];
        await this.traverse(variable.variablesReference, session, nodes, 0);
        return {
            kind: 'linkedList',
            name: variable.name,
            nodes,
        };
    }
    async traverse(variablesReference, session, nodes, depth) {
        if (depth > 100)
            return;
        const children = await (0, dapClient_1.fetchChildren)(session, variablesReference);
        const valueChild = children.find((c) => c.name === 'value' || c.name === 'val');
        const nextChild = children.find((c) => c.name === 'next');
        if (!valueChild)
            return;
        nodes.push(valueChild.value);
        if (nextChild && nextChild.variablesReference > 0 && nextChild.value !== 'null') {
            await this.traverse(nextChild.variablesReference, session, nodes, depth + 1);
        }
    }
}
exports.LinkedListEnricher = LinkedListEnricher;
//# sourceMappingURL=LinkedListEnricher.js.map