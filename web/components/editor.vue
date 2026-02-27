<template>
  <div ref="container" class="editor" />
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { init } from "modern-monaco";

const monacoReady = init().then((monaco) => {
  monaco.languages.typescript?.typescriptDefaults?.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
  monaco.languages.typescript?.javascriptDefaults?.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
  return monaco;
});

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
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const container = ref(null);
    let editor = null;
    let ignoreChange = false;

    onMounted(async () => {
      const monaco = await monacoReady;
      editor = monaco.editor.create(container.value, {
        value: props.modelValue,
        language: props.language,
        readOnly: props.readOnly,
        theme: "vs-dark",
        wordWrap: "on",
        automaticLayout: true,
        minimap: { enabled: false },
      });
      editor.onDidChangeModelContent(() => {
        if (!ignoreChange) {
          emit("update:modelValue", editor.getValue());
        }
      });
    });

    watch(
      () => props.modelValue,
      (value) => {
        if (editor && value !== editor.getValue()) {
          ignoreChange = true;
          editor.setValue(value);
          ignoreChange = false;
        }
      },
    );

    onBeforeUnmount(() => {
      if (editor) {
        editor.getModel()?.dispose();
        editor.dispose();
        editor = null;
      }
    });

    return { container };
  },
});
</script>

<style scoped>
.editor {
  flex: 1;
  height: 100%;
}
</style>
