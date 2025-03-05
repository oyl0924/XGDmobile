<template>
  <div class="login-container">
    <div class="login-header">
      <div class="app-logo">
        <Icon name="apps-o" size="60" color="#1989fa" />
      </div>
      <div class="app-name">车间小工单</div>
      <div class="app-desc">工厂车间工单管理系统</div>
    </div>
    
    <div class="login-form">
      <div class="login-tabs">
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'phone' }" 
          @click="loginType = 'phone'"
        >
          手机登录
        </div>
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'account' }" 
          @click="loginType = 'account'"
        >
          账号登录
        </div>
      </div>
      
      <!-- 手机号登录 -->
      <div v-if="loginType === 'phone'" class="form-content">
        <Field
          v-model="phone.mobile"
          label="手机号"
          placeholder="请输入手机号码"
          :rules="[{ required: true, message: '请输入手机号码' }]"
          type="tel"
          maxlength="11"
        >
          <template #left-icon>
            <Icon name="phone-o" />
          </template>
        </Field>
        
        <Field
          v-model="phone.password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          :type="passwordVisible ? 'text' : 'password'"
        >
          <template #left-icon>
            <Icon name="lock" />
          </template>
          <template #right-icon>
            <Icon 
              :name="passwordVisible ? 'eye-o' : 'closed-eye'" 
              @click="passwordVisible = !passwordVisible" 
            />
          </template>
        </Field>
      </div>
      
      <!-- 账号登录 -->
      <div v-else class="form-content">
        <Field
          v-model="account.factoryCode"
          label="工厂编码"
          placeholder="请输入工厂编码"
          :rules="[{ required: true, message: '请输入工厂编码' }]"
        >
          <template #left-icon>
            <Icon name="home-o" />
          </template>
        </Field>
        
        <Field
          v-model="account.username"
          label="账号"
          placeholder="请输入账号"
          :rules="[{ required: true, message: '请输入账号' }]"
        >
          <template #left-icon>
            <Icon name="manager-o" />
          </template>
        </Field>
        
        <Field
          v-model="account.password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          :type="passwordVisible ? 'text' : 'password'"
        >
          <template #left-icon>
            <Icon name="lock" />
          </template>
          <template #right-icon>
            <Icon 
              :name="passwordVisible ? 'eye-o' : 'closed-eye'" 
              @click="passwordVisible = !passwordVisible" 
            />
          </template>
        </Field>
      </div>
      
      <div class="login-options">
        <Checkbox v-model="rememberMe">记住密码</Checkbox>
        <div class="forgot-password" @click="handleForgotPassword">忘记密码</div>
      </div>
      
      <Button type="primary" block size="large" @click="handleLogin">登 录</Button>
    </div>
    
    <div class="bottom-info">
      <p>版本号：v1.0.0</p>
      <p>©2024 车间小工单系统</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Field, Button, Icon, Checkbox, showToast } from 'vant';

const router = useRouter();
const loginType = ref('phone'); // 'phone' 或 'account'
const passwordVisible = ref(false);
const rememberMe = ref(false);

// 表单数据
const phone = ref({
  mobile: '',
  password: ''
});

const account = ref({
  factoryCode: '',
  username: '',
  password: ''
});

// 在组件挂载时，检查是否有保存的登录信息
onMounted(() => {
  const savedRememberMe = localStorage.getItem('rememberMe');
  if (savedRememberMe === 'true') {
    rememberMe.value = true;
    
    // 获取保存的登录信息
    const savedLoginInfo = localStorage.getItem('loginInfo');
    if (savedLoginInfo) {
      const loginInfo = JSON.parse(savedLoginInfo);
      loginType.value = loginInfo.loginType;
      
      if (loginType.value === 'phone') {
        phone.value = loginInfo.data;
      } else {
        account.value = loginInfo.data;
      }
    }
  }
});

// 处理登录
const handleLogin = async () => {
  try {
    if (loginType.value === 'phone') {
      // 手机号登录验证
      if (!phone.value.mobile) {
        showToast('请输入手机号码');
        return;
      }
      if (!phone.value.password) {
        showToast('请输入密码');
        return;
      }
      
      // 如果选择了记住密码，保存登录信息
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('loginInfo', JSON.stringify({
          loginType: 'phone',
          data: phone.value
        }));
      } else {
        // 如果没有选择记住密码，清除之前保存的信息
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('loginInfo');
      }
      
      // 模拟登录成功
      showToast('手机号登录成功');
    } else {
      // 账号登录验证
      if (!account.value.factoryCode) {
        showToast('请输入工厂编码');
        return;
      }
      if (!account.value.username) {
        showToast('请输入账号');
        return;
      }
      if (!account.value.password) {
        showToast('请输入密码');
        return;
      }
      
      // 如果选择了记住密码，保存登录信息
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('loginInfo', JSON.stringify({
          loginType: 'account',
          data: account.value
        }));
      } else {
        // 如果没有选择记住密码，清除之前保存的信息
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('loginInfo');
      }
      
      // 模拟登录成功
      showToast('账号登录成功');
    }
    
    // 保存登录状态
    localStorage.setItem('token', 'mock-token-' + Date.now());
    
    // 登录成功，跳转到首页
    setTimeout(() => {
      router.replace('/work-order');
    }, 1000);
    
  } catch (error) {
    console.error('登录失败:', error);
    showToast('登录失败，请检查账号密码');
  }
};

// 处理忘记密码
const handleForgotPassword = () => {
  showToast('请联系管理员重置密码');
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 40px 24px;
  background-color: #f8f8f8;
}

.login-header {
  margin-bottom: 40px;
  text-align: center;
}

.app-logo {
  margin-bottom: 16px;
}

.app-name {
  font-size: 24px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
}

.app-desc {
  font-size: 14px;
  color: #969799;
}

.login-form {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.login-tabs {
  display: flex;
  border-bottom: 1px solid #ebedf0;
  margin-bottom: 24px;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: #969799;
  padding: 12px 0;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #1989fa;
  font-weight: bold;
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #1989fa;
  border-radius: 3px;
}

.form-content {
  margin-bottom: 20px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin: 16px 0 24px;
  font-size: 14px;
}

.forgot-password {
  color: #1989fa;
}

.bottom-info {
  margin-top: auto;
  text-align: center;
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
}
</style> 