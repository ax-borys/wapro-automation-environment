import { defineConfig, mergeConfig } from 'vitest/config';
import rootConfig from '../../vitest.config.ts';

const config = mergeConfig(
   rootConfig,
   defineConfig({
      test: {
         setupFiles: ['./src/test/setup.ts'],
         projects: [],
      },
   }),
);

delete config.test?.projects;

export default config;
