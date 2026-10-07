import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

process.env.TZ = 'UTC'

const alias = {
  '~': fileURLToPath(new URL('./app', import.meta.url)),
  '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
  '#registry': fileURLToPath(new URL('../../packages/registry', import.meta.url)),
}

export default defineConfig({
  test: {
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    expect: { requireAssertions: true },
    projects: [
      {
        extends: true,
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/unit/**/*.test.ts'],
          css: { include: [/packages\/core\/src\/[^/]+\.css/] },
        },
      },
      {
        extends: true,
        plugins: [vue(), tailwindcss()],
        optimizeDeps: { include: ['reka-ui', 'reka-ui/internal', '@lucide/vue', '@vueuse/core'] },
        resolve: { alias, dedupe: ['vue'] },
        test: {
          name: 'browser',
          include: ['test/browser/**/*.test.ts'],
          setupFiles: ['./test/browser/setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { timezoneId: 'UTC', locale: 'en-US' } }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
