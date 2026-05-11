import { VariableEnricher } from './types';
import { ArrayEnricher } from './ArrayEnricher';
import { MatrixEnricher } from './MatrixEnricher';
import { PrimitiveEnricher } from './PrimitiveEnricher';
import { ObjectEnricher } from './ObjectEnricher';
import { LinkedListEnricher } from './LinkedListEnricher';
import { TreeEnricher } from './TreeEnricher';

export const enrichers: VariableEnricher[] = [
    new TreeEnricher(),
    new LinkedListEnricher(),
    new MatrixEnricher(),   // must come before ArrayEnricher
    new ArrayEnricher(),
    new ObjectEnricher(),
    new PrimitiveEnricher(),
];
