import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
   test: {
      exclude: [...configDefaults.exclude],
      // ... Specify options here.
      globals: true,
      projects: ['packages/*'],
   },
});
