"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimitiveEnricher = void 0;
class PrimitiveEnricher {
    canHandle(_variable) {
        return true;
    }
    async enrich(variable, _session) {
        return {
            kind: 'primitive',
            name: variable.name,
            value: variable.value,
        };
    }
}
exports.PrimitiveEnricher = PrimitiveEnricher;
//# sourceMappingURL=PrimitiveEnricher.js.map