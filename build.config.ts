import { defineBuildConfig } from "unbuild";
import { rm, glob } from "node:fs/promises";
import { transform } from "esbuild";

export default defineBuildConfig({
  declaration: true,
  entries: [
    "./src/index",
    "./src/loader/babel",
    "./src/loader/loader",
    "./src/cli",
  ],
  externals: [
    "@babel/core", // This is a type-only dependency
  ],
  rollup: {
    inlineDependencies: [
      "@babel/types",
      "@babel/helper-validator-identifier",
      "@babel/helper-string-parser",
    ],
  },
  hooks: {
    "rollup:options"(ctx, opts) {
      opts.plugins.push({
        name: "selective-minify",
        async transform(code, id) {
          if (id.includes(`node_modules/@babel/`)) {
            const res = await transform(code, { minify: true });
            return res.code;
          }
        },
      });
    },
    async "build:done"() {
      for await (const file of glob("dist/**/*.d.ts")) {
        await rm(file);
      }
      await rm("dist/cli.d.mts");
    },
  },
});
