<template>
    <div>
        <ClientOnly>
            <Receiver />
        </ClientOnly>
    </div>
</template>

<script>
import Receiver from '@/components/Receiver.vue';

export default {
    components: {
        Receiver,
    }
}
</script>