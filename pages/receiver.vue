<template>
    <div>
        <ClientOnly>
            <Receiver />
        </ClientOnly>
    </div>
</template>

<script>
import Vue from 'vue';
import Receiver from '@/components/Receiver.vue';

export default Vue.extend({
    components: {
        Receiver,
    }
});
</script>