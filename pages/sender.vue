<template>
    <div>
        <Sender />
        <Receiver />
    </div>
</template>

<script>
import Vue from 'vue';
import Sender from '@/components/Sender.vue';
import Receiver from '@/components/Receiver.vue';

export default Vue.extend({
    components: {
        Sender,
        Receiver,
    }
});
</script>