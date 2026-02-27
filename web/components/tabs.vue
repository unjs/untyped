<template>
  <div class="flex cursor-grab">
    <div
      v-for="tab in tabs"
      :key="tab"
      class="select-none px-3 mx-1 rounded"
      :class="[tab == modelValue ? 'bg-neutral-600 text-white' : 'bg-neutral-800 text-neutral-400']"
      @click="$emit('update:modelValue', tab)"
    >
      {{ tab[0].toUpperCase() + tab.substr(1) }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    tabs: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: String,
      default: "",
    },
  },
});
</script>
