// @ts-ignore
import * as babel from "@babel/standalone/babel.min.js";
import untypedPlugin from "./babel";

const { transform: babelTransform } = babel.default || babel;

export function transform(src: string, opts = {}) {
  const res = babelTransform(src, {
    filename: "src.ts",
    presets: ["typescript"],
    plugins: [[untypedPlugin, opts]],
  });
  return res.code;
}
