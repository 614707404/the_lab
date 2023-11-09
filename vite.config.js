import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import rawLoader from 'vite-raw-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      vue: '@vue/compat'
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2,
          },
          isCustomElement: tagName => {
            return tagName === 'vue-advanced-chat' || tagName === 'emoji-picker'
          }
        }
      }
    }),
    rawLoader({fileRegex: /\.(fs|vs)$/}),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
            @import "node_modules/bootstrap/scss/functions.scss";
            @import "node_modules/bootstrap/scss/variables.scss";
        `
      }
    }
  }
})
