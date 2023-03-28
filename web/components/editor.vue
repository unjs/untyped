<template>
  <div ref="editor" class="editor" />
</template>

<script>
import { defineComponent } from "vue";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import "monaco-editor/esm/vs/basic-languages/monaco.contribution";
import "monaco-editor/esm/vs/editor/editor.all";
import { editor as moncacoEditor } from "monaco-editor/esm/vs/editor/editor.api";

// https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-amd-cross.md
globalThis.MonacoEnvironment = {
  getWorkerUrl() {
    const moncoCDN = "https://cdn.jsdelivr.net/npm/monaco-editor@0.23";
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
      self.MonacoEnvironment = { baseUrl: '${moncoCDN}/min/' };
      importScripts('${moncoCDN}/min/vs/base/worker/workerMain.js');
    `)}`;
  },
};

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "javascript",
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    modelValue(value, oldValue) {
      if (value !== oldValue && this.readOnly) {
        this.editor.setValue(value);
      }
    },
  },
  mounted() {
    const editor = moncacoEditor.create(this.$refs.editor, {
      value: this.modelValue,
      language: this.language,
      readOnly: this.readOnly,
      wordWrap: true,
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
    });
    this.editor = editor;
    editor.onDidChangeModelContent(() => {
      this.$emit("update:modelValue", editor.getValue());
    });
    // editor.onDidBlurEditorWidget(() => {
    //   this.$emit('update:value', editor.getValue())
    // })
  },
});
</script>

<style scoped>
.editor {
  flex: 1;
  height: 100%;
}
</style>
