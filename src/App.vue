<template>
  <div class="app">
    <router-view />
    <div class="tab-bar-container">
      <Tabbar v-model="active" route>
        <TabbarItem icon="todo-list-o" to="/work-order" name="work-order">工单</TabbarItem>
        <TabbarItem icon="chart-trending-o" to="/report" name="report">报工</TabbarItem>
      </Tabbar>
      <div class="scan-button-wrapper">
        <div class="scan-button" @click="handleShowScanPage">
          <Icon name="scan" size="24" color="#fff" />
        </div>
      </div>
    </div>
    
    <!-- 扫码界面 -->
    <Popup 
      v-model:show="showScanPage" 
      position="right"
      :style="{ width: '100%', height: '100%' }"
      :closeable="false"
    >
      <div class="scan-container">
        <NavBar 
          title="扫描工单" 
          left-arrow 
          @click-left="showScanPage = false"
        >
          <template #right>
            <div v-if="!hasCameraPermission" class="permission-button" @click="requestCameraPermission">
              获取权限
            </div>
          </template>
        </NavBar>
        <div class="scan-content">
          <div class="scan-area">
            <video ref="videoRef" class="scan-video" autoplay playsinline></video>
            <div class="scan-frame"></div>
            <div class="scan-line"></div>
          </div>
          <div class="scan-tips">
            将工单二维码放入框内，即可自动扫描
          </div>
          <div class="scan-buttons">
            <Button type="primary" block @click="showScanPage = false">点击返回</Button>
          </div>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Tabbar, TabbarItem, Icon, Popup, NavBar, Button, showToast } from 'vant';

const active = ref('report');
const showScanPage = ref(false);
const hasCameraPermission = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
let mediaStream: MediaStream | null = null;

// 检查相机权限
const checkCameraPermission = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment'
      } 
    });
    
    if (videoRef.value && mediaStream) {
      videoRef.value.srcObject = mediaStream;
      hasCameraPermission.value = true;
    }
  } catch (error) {
    console.error('相机初始化失败:', error);
    hasCameraPermission.value = false;
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
  }
};

// 请求相机权限
const requestCameraPermission = async () => {
  await checkCameraPermission();
  if (!hasCameraPermission.value) {
    showToast('请在浏览器设置中允许访问相机');
  }
};

// 处理扫描页面显示
const handleShowScanPage = () => {
  showScanPage.value = true;
};

// 监听扫码页面显示状态
watch(showScanPage, async (newValue) => {
  if (newValue) {
    // 当打开扫码页面时，检查权限并尝试初始化相机
    await checkCameraPermission();
  } else {
    // 当关闭扫码页面时，清理相机资源
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }
  }
});
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.tab-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
}

:deep(.van-tabbar) {
  background-color: #ffffff;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.scan-button-wrapper {
  position: fixed;
  left: 50%;
  bottom: 25px;
  transform: translate(-50%, 50%);
  z-index: 100;
  width: 56px;
  height: 56px;
  background-color: #fff;
  border-radius: 50%;
  padding: 3px;
}

.scan-button {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #1989fa;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.5);
}

/* 扫码页面样式 */
.scan-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.scan-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 40px 16px;
}

.scan-area {
  position: relative;
  width: 250px;
  height: 250px;
  margin: 40px auto;
}

.scan-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #1989fa;
  border-radius: 8px;
  box-shadow: 0 0 0 5000px rgba(0, 0, 0, 0.6);
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #1989fa;
  box-shadow: 0 0 10px rgba(25, 137, 250, 0.8);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: 100%;
  }
  100% {
    top: 0;
  }
}

.scan-tips {
  color: #fff;
  text-align: center;
  margin: 20px 0;
  font-size: 14px;
}

.scan-buttons {
  width: 100%;
  padding: 0 16px;
  margin-top: 40px;
}

.permission-button {
  font-size: 14px;
  color: #1989fa;
  padding: 0 16px;
}

.scan-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
</style> 