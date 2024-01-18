import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: [
      { find: 'src', replacement: './src' },
      { find: 'base', replacement: './src/base' },
      { find: 'platform', replacement: './src/platform' },
    ],
  },
});
