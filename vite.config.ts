import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { compile } from "sass";
import { defineConfig, type Plugin } from "vite";

const SASS_THEME = resolve("src/styles/theme.scss");
const GENERATED_THEME = resolve("src/styles/generated/theme.css");

/**
 * Tailwind v4 can't read Sass directly, so this plugin compiles the Sass
 * palette into a plain CSS `@theme` file that Tailwind can. It runs when
 * Vite starts, and again whenever theme.scss is saved.
 */
function sassTheme(): Plugin {
  const writeTheme = () => {
    mkdirSync(dirname(GENERATED_THEME), { recursive: true });
    writeFileSync(GENERATED_THEME, `/* Generated from theme.scss: do not edit. */\n${compile(SASS_THEME).css}\n`);
  };
  return {
    name: "sass-theme",
    buildStart: writeTheme,
    configureServer(server) {
      server.watcher.on("change", (changedFile) => changedFile === SASS_THEME && writeTheme());
    },
  };
}

export default defineConfig({
  plugins: [sassTheme(), tailwindcss(), react()],
});
