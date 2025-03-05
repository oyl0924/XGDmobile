// 此文件用于注册 PWA 的 Service Worker

export async function registerSW() {
  // 在生产环境中注册 Service Worker
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const { registerSW } = await import('virtual:pwa-register');
      
      // 自动更新
      registerSW({
        onRegistered(sw: ServiceWorkerRegistration | undefined) {
          console.log('Service Worker 已注册');
        },
        onRegisterError(error: any) {
          console.error('Service Worker 注册失败:', error);
        }
      });
      
      console.log('PWA 已启用');
    } catch (error) {
      console.error('加载 PWA 注册脚本失败:', error);
    }
  } else {
    console.log('当前环境不支持 Service Worker 或处于开发模式');
  }
} 