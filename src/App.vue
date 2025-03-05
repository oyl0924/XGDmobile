<template>
  <div class="app">
    <router-view />
    <Tabbar v-model="active" route>
      <TabbarItem icon="todo-list-o" to="/work-order" name="work-order">工单</TabbarItem>
      <TabbarItem icon="chart-trending-o" to="/report" name="report">报工</TabbarItem>
    </Tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Tabbar, TabbarItem } from 'vant';

const active = ref('report');
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

:deep(.van-tabbar) {
  background-color: #ffffff;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}
</style> 