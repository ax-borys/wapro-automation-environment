import { defineConfig } from 'tsdown';

export default defineConfig({
   entry: ['src/index.ts'],
   format: ['esm'],
   dts: false,
   clean: false,
   banner: {
      js: '#!/usr/bin/env node',
   },
});
