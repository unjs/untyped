import unjs from "eslint-config-unjs";

// https://github.com/unjs/eslint-config
export default unjs({
  ignores: [
  "web"
],
  rules: {
  "unicorn/no-null": 0,
  "unicorn/prevent-abbreviations": 0
},
});