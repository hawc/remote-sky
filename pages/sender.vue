<template>
    <div>
        <ClientOnly>
            <Sender />
        </ClientOnly>
    </div>
</template>

<script>
import Sender from '@/components/Sender.vue';

export default {
    components: {
        Sender,
    }
}
</script>