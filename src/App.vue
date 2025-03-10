<template>
  <div class="app">
    <router-view />
    <div class="tab-bar-container" v-if="showTabBar">
      <div class="custom-tabbar">
        <div class="tabbar-item" :class="{ active: active === 'work-order' }" @click="navigateTo('/work-order', 'work-order')">
          <Icon name="todo-list-o" :color="active === 'work-order' ? '#1989fa' : '#646566'" />
          <div class="tabbar-text">工单</div>
        </div>
        <div class="tabbar-item" :class="{ active: active === 'task' }" @click="navigateTo('/task', 'task')">
          <Icon name="cluster-o" :color="active === 'task' ? '#1989fa' : '#646566'" />
          <div class="tabbar-text">任务</div>
        </div>
        <div class="tabbar-item scan">
          <div class="scan-button" @click="handleShowScanPage">
            <Icon name="scan" size="24" color="#fff" />
          </div>
        </div>
        <div class="tabbar-item" :class="{ active: active === 'report' }" @click="navigateTo('/report', 'report')">
          <Icon name="chart-trending-o" :color="active === 'report' ? '#1989fa' : '#646566'" />
          <div class="tabbar-text">报工</div>
        </div>
        <div class="tabbar-item" :class="{ active: active === 'my-profile' }" @click="navigateTo('/my-profile', 'my-profile')">
          <Icon name="user-o" :color="active === 'my-profile' ? '#1989fa' : '#646566'" />
          <div class="tabbar-text">我的</div>
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
            <div v-else class="camera-switch-button" @click="showCameraSelector = true">
              <Icon name="video" size="20" />
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

    <!-- 摄像头选择弹窗 -->
    <Popup 
      v-model:show="showCameraSelector" 
      position="bottom"
      :style="{ height: '40%' }"
      round
    >
      <div class="camera-selector">
        <div class="popup-title">
          选择摄像头
        </div>
        <div class="camera-list">
          <RadioGroup v-model="selectedCameraId">
            <Cell v-for="camera in availableCameras" :key="camera.deviceId">
              <Radio :name="camera.deviceId">{{ camera.label || `摄像头 ${availableCameras.indexOf(camera) + 1}` }}</Radio>
            </Cell>
          </RadioGroup>
        </div>
        <div class="popup-buttons">
          <Button type="primary" block @click="switchCamera">确认</Button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import { Tabbar, TabbarItem, Icon, Popup, NavBar, Button, showToast, RadioGroup, Radio, Cell, Dialog, showDialog } from 'vant';
import { useRouter, useRoute } from 'vue-router';
import { isWechat } from '@/utils/browser';
import jsQR from 'jsqr';

// 为旧版相机API添加类型定义
interface NavigatorWithLegacyUserMedia extends Navigator {
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  webkitGetUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  mozGetUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  msGetUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
}

// 摄像头设备类型
interface CameraDevice {
  deviceId: string;
  label: string;
}

const router = useRouter();
const route = useRoute();
const active = ref('work-order');
const showScanPage = ref(false);
const hasCameraPermission = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const scanResult = ref(''); // 扫码结果
let mediaStream: MediaStream | null = null;

// 摄像头选择相关
const showCameraSelector = ref(false);
const availableCameras = ref<CameraDevice[]>([]);
const selectedCameraId = ref('');

// 判断是否显示底部导航栏
const showTabBar = computed(() => {
  // 主页面路径列表
  const mainPages = ['/work-order', '/task', '/report', '/my-profile'];
  return mainPages.includes(route.path);
});

// 根据当前路由更新active状态
const updateActiveByRoute = () => {
  const path = route.path;
  if (path.includes('/work-order')) {
    active.value = 'work-order';
  } else if (path.includes('/task')) {
    active.value = 'task';
  } else if (path.includes('/report')) {
    active.value = 'report';
  } else if (path.includes('/my-profile')) {
    active.value = 'my-profile';
  }
};

// 监听路由变化
watch(() => route.path, (newPath) => {
  updateActiveByRoute();
});

// 从本地存储中获取上次使用的摄像头ID
onMounted(() => {
  const savedCameraId = localStorage.getItem('selectedCameraId');
  if (savedCameraId) {
    selectedCameraId.value = savedCameraId;
  }
  
  // 初始化时更新一次active状态
  updateActiveByRoute();
  
  // 监听扫码请求事件
  window.addEventListener('openScanPage', () => {
    handleShowScanPage();
  });
});

// 在组件销毁时移除事件监听
onUnmounted(() => {
  window.removeEventListener('openScanPage', handleShowScanPage);
});

// 导航函数
const navigateTo = (path: string, name: string) => {
  active.value = name;
  router.push(path);
};

// 获取可用摄像头列表
const getAvailableCameras = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      showToast('您的浏览器不支持获取设备列表');
      return;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices
      .filter(device => device.kind === 'videoinput')
      .map(device => ({
        deviceId: device.deviceId,
        label: device.label || `摄像头 ${availableCameras.value.length + 1}`
      }));

    availableCameras.value = cameras;

    // 如果没有选中的摄像头或选中的摄像头不在可用列表中，则选择第一个
    if (!selectedCameraId.value || !cameras.some(camera => camera.deviceId === selectedCameraId.value)) {
      selectedCameraId.value = cameras.length > 0 ? cameras[0].deviceId : '';
    }

    return cameras;
  } catch (error) {
    console.error('获取摄像头列表失败:', error);
    showToast('获取摄像头列表失败');
    return [];
  }
};

// 切换摄像头
const switchCamera = async () => {
  // 保存选择到本地存储
  localStorage.setItem('selectedCameraId', selectedCameraId.value);
  
  // 关闭选择器
  showCameraSelector.value = false;
  
  // 重新初始化相机
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  
  await checkCameraPermission();
};

// 检查浏览器是否支持相机API
const checkCameraSupport = () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    // 对于较老的浏览器，可能需要使用旧版API
    const nav = navigator as NavigatorWithLegacyUserMedia;
    const getUserMedia = nav.getUserMedia ||
      nav.webkitGetUserMedia ||
      nav.mozGetUserMedia ||
      nav.msGetUserMedia;

    if (!getUserMedia) {
      showToast('您的浏览器不支持访问相机，请使用最新版本的Chrome/Firefox/Safari浏览器');
      return false;
    }
  }
  return true;
};

// 检查相机权限
const checkCameraPermission = async () => {
  try {
    if (!checkCameraSupport()) {
      hasCameraPermission.value = false;
      return;
    }

    // 确保mediaDevices存在
    if (!navigator.mediaDevices) {
      // @ts-ignore
      navigator.mediaDevices = {};
    }

    // 首先获取可用摄像头列表
    await getAvailableCameras();

    // 尝试获取相机流
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId.value
          ? { deviceId: { exact: selectedCameraId.value } }
          : { facingMode: 'environment' }
      };

      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.log('指定摄像头访问失败，尝试使用其他摄像头:', error);
      // 如果指定摄像头失败，尝试使用任何可用的相机
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
    }

    if (videoRef.value && mediaStream) {
      videoRef.value.srcObject = mediaStream;
      // 等待视频加载
      await new Promise((resolve) => {
        if (videoRef.value) {
          videoRef.value.onloadedmetadata = resolve;
        }
      });
      hasCameraPermission.value = true;
    } else {
      throw new Error('视频元素或媒体流不可用');
    }
  } catch (error) {
    console.error('相机初始化失败:', error);
    hasCameraPermission.value = false;
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    
    // 显示更具体的错误信息
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        showToast('请在浏览器设置中允许访问相机');
      } else if (error.name === 'NotFoundError') {
        showToast('未找到可用的相机设备');
      } else if (error.name === 'NotReadableError') {
        showToast('无法访问相机，请确保没有其他应用正在使用相机');
      } else {
        showToast('相机访问失败，请检查设备和浏览器设置');
      }
    } else {
      showToast('相机初始化失败，请刷新页面重试');
    }
  }
};

// 请求相机权限
const requestCameraPermission = async () => {
  await checkCameraPermission();
};

// 处理扫描页面显示
const handleShowScanPage = () => {
  if (isWechat()) {
    // 调用微信的扫一扫功能
    if (window.wx && window.wx.scanQRCode) {
      window.wx.scanQRCode({
        needResult: 1,
        scanType: ["qrCode","barCode"],
        success: function(res: any) {
          const result = res.resultStr;
          handleScanResult(result);
        },
        fail: function(error: any) {
          showToast('扫码失败，请重试');
          console.error('微信扫码失败:', error);
        }
      });
    } else {
      showToast('当前微信环境不支持扫一扫功能');
    }
  } else {
    // 使用自带的扫码界面
    showScanPage.value = true;
  }
};

// 处理扫码结果
const handleScanResult = (result: string) => {
  showToast(result);
};

// 在此添加扫码解码逻辑
const processImage = () => {
  if (!videoRef.value || !mediaStream) return;
  
  // 创建canvas上下文
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  
  // 设置canvas尺寸为视频尺寸
  canvas.width = videoRef.value.videoWidth;
  canvas.height = videoRef.value.videoHeight;
  
  // 将视频帧绘制到canvas上
  context.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
  
  // 获取图像数据
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  
  try {
    // 使用jsQR库进行解码
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      // 找到二维码，显示结果
      handleScanResult(code.data);
    }
    
    // 继续扫描
    if (showScanPage.value) {
      requestAnimationFrame(processImage);
    }
  } catch (error) {
    console.error('二维码识别失败:', error);
    // 继续扫描
    if (showScanPage.value) {
      requestAnimationFrame(processImage);
    }
  }
};

// 监听扫码页面显示状态
watch(showScanPage, async (newValue) => {
  if (newValue) {
    // 当打开扫码页面时，检查权限并尝试初始化相机
    await checkCameraPermission();
    // 开始处理视频帧以识别二维码
    setTimeout(processImage, 1000); // 延迟1秒后开始处理，确保相机已初始化
  } else {
    // 当关闭扫码页面时，清理相机资源
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    if (videoRef.value) {
      videoRef.value.srcObject = null;
    }
    hasCameraPermission.value = false;
  }
});
</script>

<style scoped>
@import '@/styles/app.css';
</style> 