// Based on https://github.com/micha149/vite-plugin-runtime-env/blob/master/src/index.ts

import MagicString from "magic-string";

const viteInternalEnvs = ["MODE", "BASE_URL", "PROD", "DEV", "SSR"];

function shouldIncludeEnv(name, envPrefix) {
  // Check if it's a Vite internal env
  if (viteInternalEnvs.includes(name)) {
    return false;
  }

  // Check if it has the required prefix
  if (typeof envPrefix === "string") {
    return name.startsWith(envPrefix);
  }

  return envPrefix.some((prefix) => name.startsWith(prefix));
}

function wrapVariable(name) {
  return `\${${name}}`;
}

export default function runtimeEnv() {
  const matches = new Set();
  let envPrefix = "VITE_";
  let needSourceMap = false;
  let isDevServer = false;

  return {
    name: "runtime-env",

    configResolved: (resolvedConfig) => {
      if (resolvedConfig.envPrefix) {
        envPrefix = resolvedConfig.envPrefix;
      }

      if (resolvedConfig.build.sourcemap) {
        needSourceMap = true;
      }

      if (resolvedConfig.command === "serve") {
        isDevServer = true;
      }
    },

    transform: (code) => {
      if (isDevServer) {
        return null;
      }

      const magicString = new MagicString(code);
      const importMetaPattern = /import\.meta\.env\.([A-Z0-9_]+)/g;
      let match;

      // eslint-disable-next-line no-cond-assign
      while ((match = importMetaPattern.exec(code))) {
        const start = match.index;
        const end = start + match[0].length;
        const name = match[1];

        if (shouldIncludeEnv(name, envPrefix)) {
          magicString.overwrite(start, end, `window.env.${name}`);
          matches.add(name);
        }
      }

      if (!magicString.hasChanged()) {
        return null;
      }

      if (!needSourceMap) {
        return magicString.toString();
      }

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ hires: true }),
      };
    },

    generateBundle() {
      if (isDevServer || matches.size === 0) {
        return undefined;
      }

      const vars = [...matches.values()]
        .map((name) => `"${name}":"${wrapVariable(name)}"`)
        .join(",");

      this.emitFile({
        type: "asset",
        fileName: "env.reference",
        source: `{${vars}}`,
      });
    },
  };
}
