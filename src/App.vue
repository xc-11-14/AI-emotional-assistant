<template>
       <router-view />
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
/* 全局表格表头居中 */
:deep(.el-table th) {
  text-align: center !important;
}

/* 全局表格内容居中 */
:deep(.el-table td) {
  text-align: center !important;
}
</style>
