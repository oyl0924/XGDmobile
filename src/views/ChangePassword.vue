<template>
  <div class="change-password">
    <NavBar 
      title="修改密码" 
      left-text="返回" 
      left-arrow 
      @click-left="goBack" 
    />
    
    <div class="form-container">
      <Form @submit="onSubmit">
        <Field
          v-model="formState.oldPassword"
          name="oldPassword"
          label="原密码"
          placeholder="请输入原密码"
          :rules="[{ required: true, message: '请输入原密码' }]"
          type="password"
        />
        <Field
          v-model="formState.newPassword"
          name="newPassword"
          label="新密码"
          placeholder="请输入新密码"
          :rules="[
            { required: true, message: '请输入新密码' },
            { validator: validatePassword, message: '密码长度需大于6位' }
          ]"
          type="password"
        />
        <Field
          v-model="formState.confirmPassword"
          name="confirmPassword"
          label="确认密码"
          placeholder="请再次输入新密码"
          :rules="[
            { required: true, message: '请再次输入新密码' },
            { validator: validateConfirmPassword, message: '两次输入密码不一致' }
          ]"
          type="password"
        />
        
        <div class="submit-btn">
          <Button type="primary" native-type="submit" block>提交</Button>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Field, Button, Form, showToast, showSuccessToast } from 'vant';

const router = useRouter();

// 表单数据
const formState = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密码验证
const validatePassword = (val: string) => {
  return val.length >= 6;
};

// 确认密码验证
const validateConfirmPassword = (val: string) => {
  return val === formState.newPassword;
};

// 表单提交
const onSubmit = () => {
  // 模拟API调用
  setTimeout(() => {
    showSuccessToast('密码修改成功');
    // 返回上一页
    router.back();
  }, 1000);
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.change-password {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.form-container {
  padding: 16px;
  margin-top: 20px;
}

.submit-btn {
  margin-top: 32px;
}
</style> 