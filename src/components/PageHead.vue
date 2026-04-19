<template>
    <div class="page-head">
        <p class="page-title">{{ route.meta.title }}</p>
        <div class="action-btn">
            <slot name="buttons"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped lang="scss">
.page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px;


    .page-title {
        font-size: 24px;
        color: #2d3748;
    }
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>