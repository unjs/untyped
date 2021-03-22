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
    <main class="flex flex-col lg:flex-row flex-1">
      <!-- Editor -->
      <div class="block">
        <div class="block-title">
          <div class="flex select-none">
            <div class="tab">
              Editor
            </div>
          </div>
        </div>
        <div class="block-content">
          <Editor :value="state.input" @update:value="state.input = $event" />
        </div>
      </div>
      <!-- Tabs -->
      <div class="block">
        <!-- Tab buttons -->
        <div class="block-title">
          <div class="flex cursor-grab">
            <div
              v-for="tab in ['types', 'schema']"
              :key="tab"
              class="tab"
              :class="[tab == state.activeTab ? 'bg-gray-400' : 'bg-gray-200']"
              @click="state.activeTab = tab"
            >
              {{ tab[0].toUpperCase() + tab.substr(1) }}
            </div>
          </div>
        </div>
        <!-- Schema -->
        <div v-if="state.activeTab === 'schema'" class="block-content">
          <Editor :value="JSON.stringify(schema, null, 2)" read-only language="json" />
        </div>
        <!-- Types -->
        <div v-if="state.activeTab === 'types'" class="block-content">
          <Editor :value="types" read-only language="typescript" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import 'virtual:windi.css'
import { defineComponent, defineAsyncComponent } from 'vue'
import { resolveSchema, generateDts } from '../src'
import { evaluateSource, defaultInput, persistedState, safeComputed } from './utils'
import LoadingComponent from './components/Loading.vue'

export default defineComponent({
  components: {
    Editor: defineAsyncComponent({
      loader: () => import('./components/Editor.vue'),
      loadingComponent: LoadingComponent
    })
  },
  setup () {
    const state = persistedState({
      activeTab: 'types',
      input: defaultInput
    })

    const parsedInput = safeComputed(() => evaluateSource(state.input))
    const schema = safeComputed(() => resolveSchema(parsedInput.value))
    const types = safeComputed(() => generateDts(schema.value))

    return {
      state,
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
  @apply antialiased;
}

.block {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  @apply lg:shadow-lg lg:rounded lg:m-30px;
}

.block-title {
  padding: .5em;
  @apply border-green-500 border-b-2 flex flex-col;
}

.block-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  @apply: pt-3;
}

.tab {
  @apply select-none px-3 mx-1 rounded;
}
</style>
