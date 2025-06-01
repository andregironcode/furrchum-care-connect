import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      proxy: {
        // Proxy API requests to our Next.js API route
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env': {
        ...env,
        // Ensure VITE_ prefixed env vars are available in the client
        ...Object.keys(env).reduce((acc, key) => {
          if (key.startsWith('VITE_')) {
            acc[key] = env[key];
          }
          return acc;
        }, {} as Record<string, string>)
      }
    },
  };
});
