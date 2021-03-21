<template>
  <div ref="editor" class="editor" />
</template>

<script>
import { defineComponent } from 'vue'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker (_, label) {
    if (label === 'json') {
      return new JsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new CssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new HtmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new TsWorker()
    }
    return new EditorWorker()
  }
}

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: 'javascript'
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    value (value, oldValue) {
      if (value !== oldValue && this.readOnly) {
        this.editor.setValue(value)
      }
    }
  },
  mounted () {
    const editor = monaco.editor.create(this.$refs.editor, {
      value: this.value,
      language: this.language,
      readOnly: this.readOnly,
      wordWrap: true,
      automaticLayout: true,
      minimap: {
        enabled: false
      }
    })
    this.editor = editor
    // editor.onDidChangeModelContent(() => {
    //   this.$emit('update:value', editor.getValue())
    // })
    editor.onDidBlurEditorWidget(() => {
      this.$emit('update:value', editor.getValue())
    })
  }
})
</script>

<style scoped>
.editor {
  flex: 1;
  height: 100%;
}
</style>
