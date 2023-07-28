<template>
  <div class="container">
    <div class="mb-2">
      <input id="markdown-raw" v-model="render" type="checkbox" />
      <label for="markdown-raw" class="select-none"> Render markdown</label
      ><br />
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="render" class="markdown" v-html="rendered" />
    <pre v-else v-text="value" />
  </div>
</template>

<script>
import "prismjs/themes/prism.css";
import { defineComponent, ref } from "vue";
import { marked } from "marked";
import prism from "prismjs";
import { safeComputed } from "../composables/utils";

export default defineComponent({
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  setup(ctx) {
    const render = ref(true);
    const rendered = safeComputed(() =>
      marked(ctx.value, {
        highlight(code, lang) {
          if (lang === "ts") {
            lang = "js";
          }
          const _lang = prism.languages[lang];
          return _lang ? prism.highlight(code, _lang) : code;
        },
      }),
    );
    return {
      render,
      rendered,
    };
  },
});
</script>

<style scoped>
.container {
  padding: 1em;
}
</style>

<style>
.markdown {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    Segoe UI,
    Helvetica,
    Arial,
    sans-serif,
    Apple Color Emoji,
    Segoe UI Emoji !important;
  color: #24292e !important;
  word-wrap: break-word;
}

.markdown code {
  font-family:
    SFMono-Regular,
    Consolas,
    Liberation Mono,
    Menlo,
    monospace;
  padding: 0.2em 0.4em;
  font-size: 85%;
  background-color: #f6f8fa;
  border-radius: 6px;
}
</style>
