<template>
  <div>Hi!</div>
</template>

<script lang="ts">
import Vue from 'vue';

declare global {
    interface Window {
        parcelRequire: any;
    }
}

if (typeof window !== 'undefined') {
  window.parcelRequire = undefined;
}

export default Vue.extend({
  name: 'IndexPage'
})
</script>
