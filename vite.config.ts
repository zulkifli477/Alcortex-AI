
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Prioritize window environment over static define to avoid "" overrides
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ""),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    server: {
      port: 3000,
      host: true
    }
  };
});
