<template>
  <div class="my-profile">
    <NavBar 
      title="我的" 
      fixed 
      right-text=" "
    />
    <div class="page-container">
      <div class="empty-container">
        <Empty description="个人中心页面开发中" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NavBar, Empty } from 'vant';
</script>

<style scoped>
.my-profile {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-top: 46px;
  box-sizing: border-box;
}

.page-container {
  padding: 16px;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}
</style> 