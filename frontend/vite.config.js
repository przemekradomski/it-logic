import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/static/',
    build: {
        outDir: '../static',
        emptyOutDir: true,
        cssCodeSplit: false,
        rollupOptions: {
            input: 'src/main.jsx',
            output: {
                entryFileNames: 'js/main.js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'assets/main.css';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        }
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
})
