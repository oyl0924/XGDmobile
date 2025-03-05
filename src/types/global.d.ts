// 微信JS-SDK类型定义
interface WxSDK {
  scanQRCode(options: {
    needResult: number;
    scanType: string[];
    success: (res: { resultStr: string }) => void;
    fail: (error: any) => void;
  }): void;
  // 其他微信SDK方法可以在这里添加
}

interface Window {
  wx?: WxSDK;
} 