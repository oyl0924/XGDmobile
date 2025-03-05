import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { showToast } from 'vant';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || '',
  timeout: 15000
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在这里可以添加token等认证信息
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    
    if (res.code !== 0) {
      showToast(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    return res;
  },
  (error) => {
    console.error('Response error:', error);
    showToast(error.message || '网络错误');
    return Promise.reject(error);
  }
);

// 请求函数
function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config);
}

export default request; 