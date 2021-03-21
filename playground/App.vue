<template>
  <div class="flex flex-col min-h-screen max-w-screen">
    <!-- Nav -->
    <div class="p-1em bg-cyan-500 text-white flex space-x-0 justify-between">
      <p class="font-extrabold">
        <a href="/">MagicSchema</a>
      </p>
      <div>
        <a href="https://github.com/unjs/magic-schema" role="noopener" target="github">Github</a>
      </div>
    </div>
    <!-- Main -->
    <main class="flex flex-col flex-1">
      <!-- Tabs -->
      <div class="block">
        <!-- Tab buttons -->
        <div class="block-title">
          <div class="flex cursor-grab">
            <div
              v-for="tab in ['editor', 'types', 'schema']"
              :key="tab"
              class="tab select-none px-3 mx-1 rounded inline"
              :class="[tab == activeTab ? 'bg-gray-400' : 'bg-gray-200']"
              @click="activeTab = tab"
            >
              {{ tab[0].toUpperCase() + tab.substr(1) }}
            </div>
          </div>
        </div>
        <!-- Editor -->
        <div v-if="activeTab === 'editor'" class="block-content">
          <Editor :value="input" @update:value="input = $event" />
        </div>
        <!-- Schema -->
        <div v-if="activeTab === 'schema'" class="block-content">
          <Editor :value="JSON.stringify(schema, null, 2)" read-only language="json" />
        </div>
        <!-- Types -->
        <div v-if="activeTab === 'types'" class="block-content">
          <Editor :value="types" read-only language="typescript" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import 'virtual:windi.css'
import { defineComponent, ref, computed, watch } from 'vue'
import { resolveSchema, generateDts } from '../src'
import { evaluateSource, tryFn, defaultInput } from './utils'
import Editor from './components/Editor.vue'

export default defineComponent({
  components: {
    Editor
  },
  setup () {
    const activeTab = ref('editor')
    const inputError = ref(null)

    const input = ref(tryFn(() => atob(window.location.hash.substr(1))) || defaultInput)

    const parsedInput = computed(() => tryFn(
      () => {
        inputError.value = null
        return evaluateSource(input.value)
      },
      (err) => {
        inputError.value = err
        return {}
      }
    ))

    const schema = computed(() => tryFn(
      () => resolveSchema(parsedInput.value),
      err => ({ $error: 'Error resolving schema' + err })
    ))

    const types = computed(() => tryFn(
      () => generateDts(schema.value),
      err => ('// Error generating types: ' + err)
    ))

    watch(input, () => { window.location.hash = '#' + btoa(input.value) })

    return {
      input,
      inputError,
      schema,
      types,
      activeTab
    }
  }
})
</script>

<style>
body, html, #app {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  @apply antialiased;
}

.block {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  @apply shadow-lg rounded m-30px;
}

.block-title {
  padding: .5em;
  @apply border-gray-500;
}

.block-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
