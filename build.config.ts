import { defineBuildConfig } from "unbuild";
import { rm, glob } from "node:fs/promises";

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
  hooks: {
    async "build:done"() {
      for await (const file of glob("dist/**/*.d.ts")) {
        await rm(file);
      }
      await rm("dist/cli.d.mts");
    },
  },
});
