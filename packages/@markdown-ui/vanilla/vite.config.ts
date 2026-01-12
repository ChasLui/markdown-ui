import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MarkdownUIVanilla',
      fileName: (format) => format === 'umd' ? 'index.umd.js' : 'index.js',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        // Ensure consistent exports for UMD
        exports: 'named'
      }
    }
  }
});
