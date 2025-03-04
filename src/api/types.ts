// 工单类型
export interface WorkOrder {
  id: string;
  orderNumber: string;
  quantity: number;
  status: '未开始' | '执行中' | '已结束';
  startTime: string;
  endTime: string;
  isUrgent: boolean;
  remark: string;
  // 自定义字段
  customText: string;
  customNumber: number;
  customDate: string;
  customImage: string;
  // 产品信息
  product: Product;
}

// 产品类型
export interface Product {
  id: string;
  productNumber: string;
  productName: string;
  specification: string;
  model: string;
  unit: string;
  remark: string;
  // 自定义字段
  customText: string;
  customNumber: number;
  customDate: string;
  customImage: string;
}

// 工序类型
export interface Process {
  id: string;
  workOrderId: string;
  name: string;
  planQuantity: number;
  completedQuantity: number;
  status: '未开始' | '执行中' | '已结束';
}

// 生产人员类型
export interface Worker {
  id: string;
  name: string;
  workNumber: string;
  department: string;
}

// 不良品原因类型
export interface DefectReason {
  id: string;
  name: string;
  code: string;
}

// 报工提交类型
export interface WorkReportSubmit {
  workOrderId: string;
  processId: string;
  workerId: string;
  goodQuantity: number;
  defectQuantity: number;
  defectReasonId?: string;
  reportTime: string;
} 