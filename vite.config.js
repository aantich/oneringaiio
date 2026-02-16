import { defineConfig } from 'vite';
import compression from 'compression';

/**
 * 
 * @returns {import('vite').PluginOption}
 */
const uniPlugin = () => ({
  name: 'uni-server-plugin',
  configureServer(server) {
    const app = server.middlewares;
    // add gzip
    app.use(compression());
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  root: './src',
  plugins: [
    uniPlugin(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['mixed-decls', 'import', 'global-builtin', 'color-functions'],
        quietDeps: true
      }
    }
  },
  server: {
    // auto open this page
    open: '/index.html',
    port: 3000,
  }
});