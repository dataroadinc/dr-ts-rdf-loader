// eslint.config.mjs
import js from "@eslint/js"
import typescript from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import prettier from "eslint-config-prettier"
import globals from "globals"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // TypeScript configuration for source files
  {
    files: ["src/**/*.ts"],
    ignores: ["src/**/*.test.ts", "src/**/*.int.test.ts", "src/**/*.d.ts"],
    plugins: {
      "@typescript-eslint": typescript,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "no-undef": "error",
      "no-useless-escape": "error",
    },
  },

  // TypeScript configuration for test files (Vitest)
  {
    files: ["src/**/*.test.ts", "src/**/*.int.test.ts"],
    plugins: {
      "@typescript-eslint": typescript,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-undef": "error",
      "no-useless-escape": "error",
    },
  },

  // Node.js scripts configuration
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "no-console": "off",
      "no-undef": "error",
    },
  },

  // Ignore patterns
  {
    ignores: ["dist/", "build/", "node_modules/", ".idea/", ".tmp/"],
  },

  // Prettier configuration
  prettier,
]
