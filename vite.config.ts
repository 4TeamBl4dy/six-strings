import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        resolve: {
            alias: {
                src: path.resolve(__dirname, './src'),
            },
        },
        preview: {
            host: true,
            port: 3000,
            // allowedHosts: ['services-frontend.anapp.kz']
        },
    };
});
