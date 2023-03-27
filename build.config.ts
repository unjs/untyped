import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: [
    "./src/index",
    "./src/loader/babel",
    "./src/loader/transform",
    "./src/loader/loader",
    "./src/cli",
  ],
  rollup: {
    // inlineDependencies: true,
    emitCJS: true,
  },
});
