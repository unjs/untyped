<template>
  <div class="container">
    <div class="block">
      <h2> Reference </h2>
      <Editor :value="input" @update:value="input = $event" />
    </div>
    <div class="block">
      <h2> Schema </h2>
      <Editor :value="JSON.stringify(schema, null, 2)" read-only language="json" />
    </div>
    <div class="block">
      <h2> Types </h2>
      <Editor :value="types" read-only language="typescript" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'
import { resolveSchema, generateDts } from '../src'
import Editor from './Editor.vue'

function evaluateSource (src) {
  let val
  try {
    // eslint-disable-next-line no-eval
    eval('val = ' + src.replace('export default', ''))
  } catch (err) {}
  return val
}

const defaultInput = `export default {
  name: 'earth',
  specs: {
    gravity: {
      $resolve: val => parseFloat(val),
      $default: '9.8'
    },
    moons: {
      $resolve: (val = ['moon']) => [].concat(val),
      $schema: {
        title: 'planet moons'
      }
    }
  }
}`

export default defineComponent({
  components: {
    Editor
  },
  setup () {
    const input = ref(window.location.hash
      ? decodeURIComponent(window.location.hash.substr(1))
      : defaultInput)

    const parsedInput = computed(() => evaluateSource(input.value))
    const schema = computed(() => resolveSchema(parsedInput.value))
    const types = computed(() => generateDts(schema.value))

    watch(input, () => {
      window.location.hash = '#' + encodeURIComponent(input.value)
    })

    return {
      input,
      schema,
      types
    }
  }
})
</script>

<style>
body, html, #app {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
}

.block {
  flex: 1;
  margin: 5px;
}
</style>
