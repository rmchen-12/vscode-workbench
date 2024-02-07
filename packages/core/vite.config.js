import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: [
      { find: 'src', replacement: resolve(__dirname, 'src') },
      { find: 'base', replacement: resolve(__dirname, 'src/base') },
      { find: 'platform', replacement: resolve(__dirname, 'src/platform') },
    ],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'index',
      fileName: 'index',
    },
  },
});
