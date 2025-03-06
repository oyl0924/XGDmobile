<template>
  <div class="my-profile">
    <!-- 顶部背景和用户信息 -->
    <div class="user-info-section">
      <div class="user-info">
        <div class="avatar">
          <img src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" alt="用户头像">
        </div>
        <div class="user-details">
          <div class="username">张三 <span class="user-role">管理员</span></div>
          <div class="phone">138****6666</div>
        </div>
      </div>
    </div>
    
    <!-- 功能菜单区 -->
    <div class="menu-list">
      <Cell class="menu-item" title="修改密码" is-link @click="navigateTo('/change-password')" />
      <Cell class="menu-item" title="服务热线">
        <template #value>
          <a href="tel:0755-82926540" class="phone-number">0755-82926540</a>
        </template>
      </Cell>
      <Cell class="menu-item" title="更新日志" is-link @click="navigateTo('/update-log')" />
      <Cell class="menu-item" title="清空缓存" is-link @click="clearCache" />
    </div>
    
    <!-- 退出登录按钮 -->
    <div class="logout-button-container">
      <Button type="danger" block @click="handleLogout">退出登录</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cell, Button, showToast, showDialog } from 'vant';
import { useRouter } from 'vue-router';

const router = useRouter();

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path);
};

// 清空缓存
const clearCache = () => {
  showDialog({
    title: '提示',
    message: '确定要清空缓存吗？清空后将返回登录页面',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    // 清除所有本地存储数据
    localStorage.clear();
    
    // 显示提示
    showToast('缓存已清空');
    
    // 返回登录页
    setTimeout(() => {
      router.replace('/login');
    }, 1000);
  }).catch(() => {
    // 取消操作
  });
};

// 处理退出登录
const handleLogout = () => {
  showDialog({
    title: '提示',
    message: '确定要退出登录吗？',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    // 清除登录状态
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('loginInfo');
    
    // 返回登录页
    router.replace('/login');
    
    showToast('已退出登录');
  }).catch(() => {
    // 取消退出
  });
};
</script>

<style scoped lang="less">
.my-profile {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.user-info-section {
  height: 80px;
  background: linear-gradient(to right, #1989fa, #39bbff);
  position: relative;
  padding: 20px;
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  color: white;
  width: 100%;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.6);
  margin-right: 16px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.user-role {
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  font-weight: normal;
}

.phone {
  font-size: 14px;
  opacity: 0.8;
}

.menu-list {
  background: white;
  margin: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.menu-item {
  font-size: 16px;
}

.phone-number {
  color: #1989fa;
  text-decoration: none;
}

.logout-button-container {
  margin: 24px 12px;
}
</style> 