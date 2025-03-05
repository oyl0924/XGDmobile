<template>
  <div class="update-log">
    <NavBar 
      title="更新日志" 
      left-text="返回" 
      left-arrow 
      @click-left="goBack"
    />
    
    <div class="log-container">
      <div class="timeline">
        <div v-for="(log, index) in updateLogs" :key="index" class="timeline-item">
          <div class="timeline-date">{{ log.date }}</div>
          <div class="timeline-content" :class="getLogClass(index)">
            <div class="version-header">
              <div class="version-number">{{ log.version }}</div>
              <div class="dot"></div>
            </div>
            <div class="update-details">
              <div v-for="(content, contentIndex) in log.contents" :key="contentIndex" class="update-item">
                {{ contentIndex + 1 }}.{{ content }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar } from 'vant';

const router = useRouter();

// 更新日志数据
const updateLogs = ref([
  {
    date: '2025年3月1日',
    version: '1.2.1',
    contents: [
      '修复了XXX'
    ]
  },
  {
    date: '2025年2月3日',
    version: '1.2',
    contents: [
      '优化了报工时的报工速度',
      '取消了工单的XXX'
    ]
  },
  {
    date: '2025年1月15日',
    version: '1.1',
    contents: [
      '新增了用户个人中心',
      '修复了若干已知问题',
      '优化了应用性能'
    ]
  },
  {
    date: '2024年12月20日',
    version: '1.0',
    contents: [
      '发布了应用的第一个正式版本',
      '支持工单管理和报工功能',
      '支持移动端离线使用'
    ]
  }
]);

// 根据日志索引返回不同的样式类
const getLogClass = (index: number) => {
  const classes = ['primary', 'success', 'warning', 'danger'];
  return classes[index % classes.length];
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped lang="less">
.update-log {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.log-container {
  padding: 16px;
}

.timeline {
  position: relative;
  padding-left: 20px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20px;
    width: 1px;
    height: 100%;
    background-color: #ebedf0;
  }
}

.timeline-item {
  position: relative;
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.timeline-date {
  margin-bottom: 8px;
  font-size: 14px;
  color: #969799;
}

.timeline-content {
  position: relative;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  margin-left: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.version-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.version-number {
  font-size: 18px;
  font-weight: bold;
}

.dot {
  position: absolute;
  left: -24px;
  top: 20px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #1989fa;
  border: 2px solid #fff;
  z-index: 1;
}

.update-details {
  font-size: 14px;
  color: #323233;
  line-height: 1.6;
}

.update-item {
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// 根据版本不同显示不同颜色
.timeline-content.primary .dot {
  background-color: #1989fa;
}

.timeline-content.success .dot {
  background-color: #07c160;
}

.timeline-content.warning .dot {
  background-color: #ff976a;
}

.timeline-content.danger .dot {
  background-color: #ee0a24;
}
</style> 