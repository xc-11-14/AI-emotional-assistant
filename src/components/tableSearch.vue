<template>
  <el-form ref="ruleFormRef" :model="formData">
    <el-row :gutter="24">
      <template v-for="item in formItemAttrs" :key="item.prop">
        <el-col v-bind="item.col">
          <el-form-item :prop="item.prop">
            <component
              v-model="formData[item.prop]"
              :is="isComp(item.comp)"
              :placeholder="item.placeholder">
              <template v-if="item.comp === 'select'">
                <el-option
                  v-for="option in item.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value" />
              </template>
            </component>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
    <el-row>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset(ruleFormRef)">重置</el-button>
      </el-form-item>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 抛出事件：搜索 + 重置
const emit = defineEmits<{
  search: [data: any]
  reset: []
}>()

// 接收父组件参数
const props = defineProps({
  formItem: {
    type: Array,
    default: () => []
  },
})

// 计算属性：给每个表单项加栅格布局
const formItemAttrs = computed(() => {
  return props.formItem.map((item: any) => {
    return {
      ...item,
      col: {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 6,
        xl: 4,
      }
    }
  })
})

// 表单实例和表单数据
const ruleFormRef = ref<any>()
const formData = ref<any>({})

// 动态组件渲染
const isComp = (comp: string) => {
  return {
    input: 'el-input',
    select: 'el-select',
  }[comp]
 }

// 搜索
const handleSearch = () => {
  emit('search', formData.value)
}

// 重置
const handleReset = (formEl: any) => {
  if (!formEl) return
  formEl.resetFields()
  
  // 清空表单数据
  for (const key in formData.value) {
    formData.value[key] = undefined
  }

  emit('reset') 
}
</script>

<style scoped lang="scss"></style>