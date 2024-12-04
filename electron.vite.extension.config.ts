import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
import {resolve} from 'path';

// import packageJson from './package.json';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({exclude: ['which', 'graceful-fs', 'electron-dl']})],
    build: {
      rollupOptions: {
        input: resolve('src/main/extension/lynxExtension.ts'),
        output: {entryFileNames: 'mainEntry.mjs'},
      },
    },
  },
  renderer: {
    plugins: [
      react(),
      federation({
        name: 'extension',
        filename: 'rendererEntry.mjs',
        exposes: {
          Extension: 'src/renderer/extension/Extension.tsx',
        },
        shared: ['react', 'react-dom', 'react-redux', 'react-router'],
      }),
    ],
    build: {
      rollupOptions: {
        input: 'src/renderer/extension/index.html',
        // external: Object.keys(packageJson.devDependencies),
        treeshake: {moduleSideEffects: false},
      },
      assetsDir: '',
      minify: false,
      target: 'esnext',
      cssCodeSplit: false,
      modulePreload: false,
    },

    publicDir: resolve(__dirname, 'src/renderer/extension/Public'),
  },
});
