<template>
  <div class="flex cursor-grab">
    <div
      v-for="tab in tabs"
      :key="tab"
      class="select-none px-3 mx-1 rounded"
      :class="[tab == modelValue ? 'bg-gray-400' : 'bg-gray-200']"
      @click="$emit('update:modelValue', tab)"
    >
      {{ tab[0].toUpperCase() + tab.substr(1) }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    tabs: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: String,
      default: ''
    }
  }
})
</script>
