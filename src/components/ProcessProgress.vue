<template>
  <div class="process-progress">
    <div class="progress-items">
      <div v-for="(process, index) in processes" :key="process.id" class="progress-item">
        <div class="circle-container">
          <div class="circle" :class="{ active: process.progress > 0, completed: process.progress === 100 }">
            <svg viewBox="0 0 36 36" class="circular-progress">
              <!-- 底圈（灰色背景） -->
              <circle 
                class="progress-bg"
                cx="18" 
                cy="18" 
                r="15" 
                fill="transparent" 
                stroke-width="2"
              />
              <!-- 进度圈（有颜色） -->
              <circle 
                class="progress-bar"
                :class="{ active: process.progress > 0, completed: process.progress === 100 }"
                cx="18" 
                cy="18" 
                r="15" 
                fill="transparent" 
                stroke-width="3"
                :stroke-dasharray="calculateCircumference(15)"
                :stroke-dashoffset="calculateOffset(process.progress, 15)"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span class="progress-value">{{ process.progress }}%</span>
          </div>
          <div class="process-name">{{ process.name }}</div>
        </div>
        <div v-if="index < processes.length - 1" class="connector">
          <div class="line" :class="{ active: process.progress > 0 }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProcessProgressItem {
  id: string;
  name: string;
  progress: number;
}

defineProps<{
  processes: ProcessProgressItem[];
}>();

// 计算圆的周长
function calculateCircumference(radius: number): number {
  return 2 * Math.PI * radius;
}

// 计算偏移值来显示正确的进度
function calculateOffset(percentage: number, radius: number): number {
  const circumference = calculateCircumference(radius);
  return circumference - (percentage / 100) * circumference;
}
</script>

<style scoped>
.process-progress {
  padding: 12px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.progress-items {
  display: flex;
  align-items: center;
  min-width: max-content;
}

.progress-item {
  display: flex;
  align-items: center;
}

.circle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 45px;
}

.circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
}

.circular-progress {
  width: 36px;
  height: 36px;
  position: absolute;
  top: 2px;
  left: 2px;
}

.progress-bg {
  stroke: #dcdcdc;
}

.progress-bar {
  stroke: #dcdcdc;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-bar.active {
  stroke: #1989fa;
}

.progress-bar.completed {
  stroke: #07c160;
}

.progress-value {
  font-size: 11px;
  font-weight: bold;
  color: #646566;
  position: relative;
  z-index: 2;
}

.circle.active .progress-value {
  color: #1989fa;
}

.circle.completed .progress-value {
  color: #07c160;
}

.process-name {
  font-size: 12px;
  color: #646566;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

/* 连接器容器 */
.connector {
  display: flex;
  align-items: center;
  height: 40px; /* 与圆圈高度一致 */
}

/* 连接线 */
.line {
  height: 2px;
  width: 20px;
  background-color: #dcdcdc;
  transition: all 0.3s;
}

.line.active {
  background-color: #1989fa;
}
</style> 