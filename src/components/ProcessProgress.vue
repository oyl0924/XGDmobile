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
@import '@/styles/components/processProgress.css';
</style> 