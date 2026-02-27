<template>
  <div class="flex flex-col min-h-screen max-w-screen bg-neutral-900 text-neutral-200">
    <!-- Nav -->
    <div class="p-4 bg-neutral-800 text-white flex justify-between">
      <p class="font-extrabold">
        <a href="/">Untyped</a>
      </p>
      <div>
        <a href="https://github.com/unjs/untyped" role="noopener" target="github">Github</a>
      </div>
    </div>
    <!-- Main -->
    <main class="flex flex-col lg:flex-row flex-1">
      <!-- Editor -->
      <div class="block">
        <div class="block-title">
          <Tabs v-model="state.editorTab" :tabs="['reference', 'input']" />
          <span class="block-label">Editor</span>
        </div>
        <div v-if="state.editorTab === 'reference'" class="block-content">
          <div class="block-info">
            Reference describes object shape, defaults, and normalizer. We can use jsdocs to set
            additional comments.
          </div>
          <Editor v-model="state.ref" language="typescript" />
        </div>
        <div v-if="state.editorTab === 'input'" class="block-content">
          <div class="block-info">
            This is user input. Using reference object, we can apply defaults.
          </div>
          <Editor v-model="state.input" language="typescript" />
        </div>
      </div>
      <!-- Output -->
      <div class="block">
        <div class="block-title">
          <Tabs
            v-model="state.outputTab"
            :tabs="['loader', 'schema', 'types', 'docs', 'resolved']"
          />
          <span class="block-label">Output</span>
        </div>
        <!-- Schema -->
        <div v-if="state.outputTab === 'schema'" class="block-content">
          <div class="block-info">
            Schema is auto generated from reference and is json-schema compliant.
          </div>
          <Editor :model-value="JSON.stringify(schema, null, 2)" read-only language="json" />
        </div>
        <!-- Types -->
        <div v-if="state.outputTab === 'types'" class="block-content">
          <div class="block-info">Types are auto generated from schema for typescript usage.</div>
          <Editor :model-value="types" read-only language="typescript" />
        </div>
        <!-- Docs -->
        <div v-if="state.outputTab === 'docs'" class="block-content">
          <div class="block-info">Markdown documentation is auto generated from schema.</div>
          <Markdown :value="markdown" />
        </div>
        <!-- Loader -->
        <div v-if="state.outputTab === 'loader'" class="block-content">
          <div class="block-info">
            Using optional loader, we can support jsdoc to describe object.
          </div>
          <Editor :model-value="transpiledRef" read-only language="typescript" />
        </div>
        <!-- Resolved -->
        <div v-if="state.outputTab === 'resolved'" class="block-content">
          <div class="block-info">
            We can apply reference object to user input to apply defaults.
          </div>
          <Editor
            :model-value="JSON.stringify(resolvedInput, null, 2)"
            read-only
            language="typescript"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";
import { resolveSchema, generateTypes, applyDefaults, generateMarkdown } from "../src";
import { defaultReference, defaultInput } from "./consts.ts";
import {
  persistedState,
  asyncImport,
  safeComputed,
  asyncComputed,
  evaluateSource,
} from "./composables/utils.ts";
import LoadingComponent from "./components/loading.vue";
import Tabs from "./components/tabs.vue";

export default defineComponent({
  components: {
    Tabs,
    Editor: defineAsyncComponent({
      loader: () => import("./components/editor.vue"),
      loadingComponent: LoadingComponent,
    }),
    Markdown: defineAsyncComponent({
      loader: () => import("./components/markdown.vue"),
      loadingComponent: LoadingComponent,
    }),
  },
  setup() {
    const state = persistedState({
      editorTab: "reference",
      outputTab: "types",
      ref: defaultReference,
      input: defaultInput,
    });

    window.process = { env: {} };
    const loader = asyncImport({
      loader: async () => {
        const [{ transform: babelTransform }, { default: untypedPlugin }] = await Promise.all([
          import("@babel/standalone"),
          import("../src/loader/babel"),
        ]);

        return {
          transform: (src, opts = {}) => {
            const res = babelTransform(src, {
              filename: "src.ts",
              presets: ["typescript"],
              plugins: [[untypedPlugin, opts]],
            });
            return res.code;
          },
        };
      },
      loading: { transform: () => "export default {} // loader is loading..." },
      error: (err) => ({
        transform: () => "export default {} // Error loading loader: " + err,
      }),
    });

    const transpiledRef = safeComputed(() =>
      loader.transform(state.ref, {
        experimentalFunctions: true,
      }),
    );
    const referenceObj = safeComputed(() => evaluateSource(transpiledRef.value));
    const schema = asyncComputed(async () => await resolveSchema(referenceObj.value));
    const types = safeComputed(() => schema.value && generateTypes(schema.value));
    const markdown = safeComputed(() => schema.value && generateMarkdown(schema.value));

    const inputObj = safeComputed(() => evaluateSource(state.input));
    const resolvedInput = asyncComputed(
      async () => await applyDefaults(referenceObj.value, inputObj.value),
    );

    return {
      state,
      schema,
      types,
      transpiledRef,
      inputObj,
      resolvedInput,
      markdown,
    };
  },
});
</script>

<style>
body,
html,
#app {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #171717;
}

.block {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .block {
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.4);
    border-radius: 0.25rem;
    margin: 30px;
    border: 1px solid #2e2e2e;
  }
}

.block-title {
  padding: 0.5em;
  position: relative;
  border-bottom: 2px solid #22c55e;
  display: flex;
  flex-direction: column;
}

.block-label {
  position: absolute;
  right: 0;
  top: 0;
  border-bottom-left-radius: 0.75rem;
  background-color: #22c55e;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  color: white;
  user-select: none;
}

.block-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 0.75rem;
}

.block-info {
  padding: 0.25em;
  border-bottom: 1px dashed #404040;
  margin-bottom: 0.75rem;
  color: #a3a3a3;
}
</style>
