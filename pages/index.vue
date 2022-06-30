<template>
    <div>
        <Receiver />
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Receiver from '@/components/Receiver.vue';

    export default Vue.extend({
        name: 'IndexPage',
        components: {
            Receiver,
        }
    });
</script>
