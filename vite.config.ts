import { defineConfig, type Plugin } from 'vite';
import { readFileSync } from 'fs';

const userscriptHeader = readFileSync('./userscript-header.txt', 'utf-8');

/**
 * Custom plugin to prepend the userscript header to the built output.
 * The banner rollup option doesn't work reliably with IIFE format
 * because the IIFE wrapper gets placed before the banner.
 */
function userscriptBanner(): Plugin {
  return {
    name: 'userscript-banner',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk') {
          chunk.code = userscriptHeader + '\n' + chunk.code;
        }
      }
    },
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['iife'],
      name: 'SentinelHuntingQueries',
      fileName: () => 'sentinel-userscript.user.js',
    },
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [userscriptBanner()],
});
