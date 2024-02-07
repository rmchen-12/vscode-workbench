import { copyFileSync } from 'fs';
import { resolve } from 'path';

copyFileSync(resolve(__dirname, '..', 'src/index.d.ts'), resolve(__dirname, '..', 'dist/index.d.ts'));
