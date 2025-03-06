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
        <div class="forgot-password" @click="handleForgotPassword">忘记密码？</div>
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

// 安全的localStorage操作函数
const safeStorage = {
  getItem(key: string, defaultValue: string = '') {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
      return defaultValue;
    }
  },
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
      return false;
    }
  },
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Failed to remove from localStorage:', e);
      return false;
    }
  }
};

// 在组件挂载时，检查是否有保存的登录信息
onMounted(() => {
  console.log("Login page mounted, checking stored login info");
  
  // 获取上次登录类型，并设置默认值
  const savedLoginType = safeStorage.getItem('loginType', 'account');
  console.log("Saved login type:", savedLoginType);
  loginType.value = savedLoginType;

  // 检查是否记住密码
  const savedRememberMe = safeStorage.getItem('rememberMe');
  if (savedRememberMe === 'true') {
    console.log("Remember me is enabled");
    rememberMe.value = true;
    
    // 获取保存的完整登录信息（包含密码）
    const savedLoginInfo = safeStorage.getItem('loginInfo');
    if (savedLoginInfo) {
      try {
        const loginInfo = JSON.parse(savedLoginInfo);
        console.log("Restoring login info for type:", loginInfo.loginType);
        loginType.value = loginInfo.loginType;
        
        if (loginType.value === 'phone') {
          phone.value = loginInfo.data;
        } else {
          account.value = loginInfo.data;
        }
      } catch (e) {
        console.error("Failed to parse saved login info:", e);
      }
    }
  } else {
    console.log("Remember me is disabled, filling only account/mobile");
    // 如果没有记住密码，但有上次登录记录，只填充账号不填充密码
    if (loginType.value === 'phone') {
      const lastLoginMobile = safeStorage.getItem('lastLoginMobile');
      if (lastLoginMobile) {
        console.log("Filling last used mobile:", lastLoginMobile);
        phone.value.mobile = lastLoginMobile;
        phone.value.password = ''; // 确保密码为空
      }
    } else {
      const lastLoginUsername = safeStorage.getItem('lastLoginUsername');
      const lastLoginFactoryCode = safeStorage.getItem('lastLoginFactoryCode');
      if (lastLoginUsername) {
        console.log("Filling last used username:", lastLoginUsername);
        account.value.username = lastLoginUsername;
        account.value.password = ''; // 确保密码为空
      }
      if (lastLoginFactoryCode) {
        console.log("Filling last used factory code:", lastLoginFactoryCode);
        account.value.factoryCode = lastLoginFactoryCode;
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
      
      // 校验手机号长度必须为11位
      if (phone.value.mobile.length !== 11) {
        showToast('手机号必须为11位');
        return;
      }
      
      if (!phone.value.password) {
        showToast('请输入密码');
        return;
      }
      
      // 更新当前登录方式为手机号
      safeStorage.setItem('loginType', 'phone');
      console.log("Setting login type to phone");
      
      // 如果选择了记住密码，保存登录信息
      if (rememberMe.value) {
        safeStorage.setItem('rememberMe', 'true');
        const loginInfoStr = JSON.stringify({
          loginType: 'phone',
          data: phone.value
        });
        safeStorage.setItem('loginInfo', loginInfoStr);
        console.log("Saved phone login info with password");
      } else {
        // 如果取消记住密码，清除之前保存的密码，但保留登录类型和账号
        safeStorage.removeItem('rememberMe');
        safeStorage.removeItem('loginInfo');
        safeStorage.setItem('lastLoginMobile', phone.value.mobile);
        console.log("Cleared saved password, but kept mobile number");
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
      
      // 更新当前登录方式为账号
      safeStorage.setItem('loginType', 'account');
      console.log("Setting login type to account");
      
      // 如果选择了记住密码，保存登录信息
      if (rememberMe.value) {
        safeStorage.setItem('rememberMe', 'true');
        const loginInfoStr = JSON.stringify({
          loginType: 'account',
          data: account.value
        });
        safeStorage.setItem('loginInfo', loginInfoStr);
        console.log("Saved account login info with password");
      } else {
        // 如果取消记住密码，清除之前保存的密码，但保留登录类型和账号
        safeStorage.removeItem('rememberMe');
        safeStorage.removeItem('loginInfo');
        safeStorage.setItem('lastLoginUsername', account.value.username);
        safeStorage.setItem('lastLoginFactoryCode', account.value.factoryCode);
        console.log("Cleared saved password, but kept account info");
      }
      
      // 模拟登录成功
      showToast('账号登录成功');
    }
    
    // 保存登录状态
    safeStorage.setItem('token', 'mock-token-' + Date.now());
    
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
  min-height: 81vh;
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

/* 调整Field组件的标题和输入框宽度比例 */
:deep(.van-field) {
  --van-field-label-width: 4em;
  --van-field-label-margin-right: 12px;
}

:deep(.van-field__label) {
  width: var(--van-field-label-width);
  flex: none;
  margin-right: var(--van-field-label-margin-right);
}

:deep(.van-field__value) {
  flex: 1;
}
</style> 