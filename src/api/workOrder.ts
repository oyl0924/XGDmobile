import request from '@/utils/request';

// 原始工单数据类型
export interface RawWorkOrderItem {
  id: string | number;
  orderNumber: string;
  productName: string;
  quantity: number;
  status: string;
  isUrgent: boolean;
  startTime: string;
  endTime: string;
  createTime: string;
  completedProcesses: number;
  totalProcesses: number;
  progress: number;
  remainDays: number;
}

// 处理后的工单数据类型
export interface WorkOrderItem {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  status: string;
  isUrgent: 0 | 1;
  startTime: string;
  endTime: string;
  createTime: string;
  completedProcesses: number;
  totalProcesses: number;
  progress: number;
  remainDays: number;
}

// API响应类型
export interface WorkOrderResponse {
  code: number;
  data: RawWorkOrderItem[];
  total: number;
  message?: string;
}

// 数据转换函数
export function convertWorkOrder(raw: RawWorkOrderItem): WorkOrderItem {
  return {
    id: String(raw.id),
    orderNumber: raw.orderNumber,
    productName: raw.productName,
    quantity: raw.quantity,
    status: raw.status,
    isUrgent: raw.isUrgent ? 1 : 0,
    startTime: raw.startTime,
    endTime: raw.endTime,
    createTime: raw.createTime,
    completedProcesses: raw.completedProcesses,
    totalProcesses: raw.totalProcesses,
    progress: raw.progress,
    remainDays: raw.remainDays
  };
}

// API请求函数
export function getWorkOrders() {
  return request<WorkOrderResponse>({
    url: '/api/work-orders',
    method: 'get'
  });
} 