import { VariableEnricher } from './types';
import { ArrayEnricher } from './ArrayEnricher';
import { PrimitiveEnricher } from './PrimitiveEnricher';
import { ObjectEnricher } from './ObjectEnricher';
import { LinkedListEnricher } from './LinkedListEnricher';

export const enrichers: VariableEnricher[] = [
    new LinkedListEnricher(),
    new ArrayEnricher(),
    new ObjectEnricher(),
    new PrimitiveEnricher(),  
];
