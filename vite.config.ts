import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to Whereby API
      '/api/whereby': {
        target: 'https://api.whereby.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/whereby/, '/v1'),
        headers: {
          'Authorization': `Bearer ${process.env.VITE_WHEREBY_API_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        configure: (proxy) => {
          // Log proxy errors
          proxy.on('error', (err) => {
            console.error('Proxy error:', err);
          });
          
          // Log outgoing requests
          proxy.on('proxyReq', (proxyReq) => {
            console.log('Sending request to Whereby:', {
              method: proxyReq.method,
              path: proxyReq.path,
              headers: proxyReq.getHeaders()
            });
          });
          
          // Log response status
          proxy.on('proxyRes', (proxyRes) => {
            console.log(`Received ${proxyRes.statusCode} from Whereby`);
          });
        }
      }
    },
  },
  plugins: [
    react(),
    ...(mode === 'development' ? [componentTagger()] : []),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
