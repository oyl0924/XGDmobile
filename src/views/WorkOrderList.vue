<template>
  <div class="work-order-list">
    <NavBar title="工单" fixed />
    <div class="content">
      <Empty description="工单页面开发中..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NavBar, Empty } from 'vant';
</script>

<style scoped lang="less">
.work-order-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.content {
  flex: 1;
  margin-top: 46px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 