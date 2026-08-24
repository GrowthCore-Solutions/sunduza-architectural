import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: [
      { find: /^@\/frontend(.*)/, replacement: path.resolve(__dirname, "src/frontend") + "$1" },
      { find: /^@\/backend(.*)/, replacement: path.resolve(__dirname, "src/backend") + "$1" },
      { find: /^@\/shared(.*)/, replacement: path.resolve(__dirname, "src/shared") + "$1" },
      { find: "@", replacement: path.resolve(__dirname, ".") },
    ],
  },
});
