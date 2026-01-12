import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


export default defineConfig({
  server: {
    host: "::",
    port: 8080, 
    proxy: {
      '/api': {
        target: 'http://localhost:8000', 
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:4001', 
        changeOrigin: true,
      },
      '/uploads': { 
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
      '/ai': {
        target: 'http://localhost:7002',
        changeOrigin: true,
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});