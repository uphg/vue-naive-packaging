<template>
  <div class="home">
    <Formulate ref="formRef" :items="items" label-placement="left" :grid="{ cols: 24, xGap: 20 }" />
    <n-button @click="getFormData">获取表单数据</n-button>
    <n-button @click="validate">验证表单</n-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NButton } from 'naive-ui'
import Formulate from '@/components/formulate/Formulate'

const items = [
  {
    label: '姓名', path: 'name', span: 12,
    children: [{
      is: 'input', field: 'name', defaultValue: 1, placeholder: '输入姓名'
    }]
  },
  {
    label: '性别', path: 'sex', span: 12,
    children: [{
      is: 'radio-group', field: 'sex', defaultValue: 1, placeholder: '选择性别',
      options: [{ label: '男', value: 0 }, { label: '女', value: 1 }]
    }]
  },
  {
    label: '年龄', path: 'age', span: 12,
    children: [
      { is: 'input-number', field: 'age', defaultValue: 1, class: 'mr-2', placeholder: '输入年龄' },
      {
        is: 'radio-group', field: 'ageGroup', defaultValue: 1, placeholder: '选择年龄段',
        options: [
          { label: '10~18', value: 0 },
          { label: '19~20', value: 1 },
        ]
      }
    ]
  },
  {
    label: '地址', path: 'area', span: 12,
    children: [
      {
        path: 'area',
        class: 'w-25',
        rule: { required: true, type: 'number', trigger: ['blur', 'input'], message: '请选择地区' },
        children: [{
          is: 'select', field: 'area', defaultValue: 1, placeholder: '选择性别',
          options: [{ label: '北京', value: 0 }, { label: '上海', value: 1 }, { label: '浙江', value: 2 }, { label: '深圳', value: 3 }]
        }]
      },
      {
        path: 'detailsSite',
        rule: { required: true, trigger: ['blur', 'input'], message: '请输入详细地址' },
        children: [{
          is: 'input', field: 'detailsSite', defaultValue: 1, placeholder: '输入详细地址'
        }]
      }
    ]
  }
]

const formRef = ref(null)

function getFormData() {
  console.log(formRef.value.formData)
}

function validate() {
  formRef.value.validate((errors) => {
    if (errors) {
      console.error(errors)
    }
  })
}
</script>

<style>
.home {
  padding: 20px 24px;
}

.w-25 {
  width: 100px;
}

.mr-2 {
  margin-right: 8px;
}
</style>