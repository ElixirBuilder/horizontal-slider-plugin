import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                dir: 'dist',
                entryFileNames: 'assets/index.js',
            }
        }
    },
    server: {
        cors: {
            origin: '*', // Allow all origins
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
            allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
        },
    },
    preview: {
        cors: {
            origin: '*', // Allow all origins
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
            allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
        },
    },
});
