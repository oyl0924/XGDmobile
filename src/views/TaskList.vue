<template>
  <div class="task-list">
    <NavBar 
      title="任务列表" 
      fixed 
      right-text=" "
    />
    <div class="page-container">
      <div class="empty-container">
        <Empty description="暂无任务数据" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NavBar, Empty } from 'vant';
</script>

<style scoped>
.task-list {
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