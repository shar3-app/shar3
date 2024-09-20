import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  resolve: {
    alias: {
      '@hooks': resolve(__dirname, 'src/hooks/index.ts'),
      '@utils': resolve(__dirname, 'src/utils/index.ts'),
      '@components': resolve(__dirname, 'src/components'),
      '@icons': resolve(__dirname, 'src/components/icons'),
      '@shared': resolve(__dirname, 'shared/index.ts')
    }
  },
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**']
    }
  }
}));
