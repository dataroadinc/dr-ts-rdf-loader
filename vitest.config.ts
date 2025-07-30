import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["node_modules", "dist"],
    watch: false,
    setupFiles: ["tests/setup.ts"],
    reporters: [
      [
        "default",
        {
          summary: false,
        },
      ],
    ],
  },
})
