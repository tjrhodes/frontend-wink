import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // jsdom gives the tests a browser-like `window`, `URL` and `DOMParser`.
    environment: "jsdom",
  },
});
