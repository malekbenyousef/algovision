"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichers = void 0;
const ArrayEnricher_1 = require("./ArrayEnricher");
const PrimitiveEnricher_1 = require("./PrimitiveEnricher");
const ObjectEnricher_1 = require("./ObjectEnricher");
const LinkedListEnricher_1 = require("./LinkedListEnricher");
exports.enrichers = [
    new LinkedListEnricher_1.LinkedListEnricher(),
    new ArrayEnricher_1.ArrayEnricher(),
    new ObjectEnricher_1.ObjectEnricher(),
    new PrimitiveEnricher_1.PrimitiveEnricher(),
];
//# sourceMappingURL=index.js.map