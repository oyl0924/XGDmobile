import type { WorkOrder, Process, Worker, DefectReason } from './types';

// 模拟数据 - 工单列表
export const workOrders: WorkOrder[] = [
  {
    id: '1',
    orderNumber: 'GD-2023-001',
    quantity: 100,
    status: '执行中',
    startTime: '2023-05-10 08:00:00',
    endTime: '2023-05-15 17:30:00',
    isUrgent: true,
    remark: '客户急需，优先处理',
    customText: '特殊工艺要求：表面处理需细致',
    customNumber: 1001,
    customDate: '2023-05-12',
    customImage: 'https://via.placeholder.com/100',
    product: {
      id: 'P1',
      productNumber: 'CP-2023-001',
      productName: '高精度轴承',
      specification: '45×68×12mm',
      model: 'HRB-6809Z',
      unit: '个',
      remark: '高精度静音轴承',
      customText: '特殊钢材',
      customNumber: 9.8,
      customDate: '2023-05-01',
      customImage: 'https://via.placeholder.com/100',
    }
  },
  {
    id: '2',
    orderNumber: 'GD-2023-002',
    quantity: 50,
    status: '未开始',
    startTime: '2023-05-16 08:00:00',
    endTime: '2023-05-20 17:30:00',
    isUrgent: false,
    remark: '常规订单',
    customText: '包装要求：防潮处理',
    customNumber: 1002,
    customDate: '2023-05-18',
    customImage: 'https://via.placeholder.com/100',
    product: {
      id: 'P2',
      productNumber: 'CP-2023-002',
      productName: '液压阀门',
      specification: 'DN25',
      model: 'YF-25A',
      unit: '套',
      remark: '标准液压阀门',
      customText: '铜合金材质',
      customNumber: 8.5,
      customDate: '2023-05-05',
      customImage: 'https://via.placeholder.com/100',
    }
  },
  {
    id: '3',
    orderNumber: 'GD-2023-003',
    quantity: 200,
    status: '已结束',
    startTime: '2023-05-01 08:00:00',
    endTime: '2023-05-08 17:30:00',
    isUrgent: false,
    remark: '已完成交付',
    customText: '质检要求：全检',
    customNumber: 1003,
    customDate: '2023-05-07',
    customImage: 'https://via.placeholder.com/100',
    product: {
      id: 'P3',
      productNumber: 'CP-2023-003',
      productName: '电路板组件',
      specification: '120×80mm',
      model: 'PCB-A23',
      unit: '块',
      remark: '控制主板',
      customText: 'FR-4材质',
      customNumber: 7.6,
      customDate: '2023-04-25',
      customImage: 'https://via.placeholder.com/100',
    }
  }
];

// 模拟数据 - 工序列表
export const processes: Process[] = [
  {
    id: 'GX1',
    workOrderId: '1',
    name: '原料准备',
    planQuantity: 100,
    completedQuantity: 80,
    status: '执行中'
  },
  {
    id: 'GX2',
    workOrderId: '1',
    name: '机加工',
    planQuantity: 100,
    completedQuantity: 60,
    status: '执行中'
  },
  {
    id: 'GX3',
    workOrderId: '1',
    name: '组装',
    planQuantity: 100,
    completedQuantity: 0,
    status: '未开始'
  },
  {
    id: 'GX4',
    workOrderId: '1',
    name: '检验',
    planQuantity: 100,
    completedQuantity: 0,
    status: '未开始'
  },
  {
    id: 'GX5',
    workOrderId: '2',
    name: '原料准备',
    planQuantity: 50,
    completedQuantity: 0,
    status: '未开始'
  },
  {
    id: 'GX6',
    workOrderId: '2',
    name: '机加工',
    planQuantity: 50,
    completedQuantity: 0,
    status: '未开始'
  },
  {
    id: 'GX7',
    workOrderId: '3',
    name: '原料准备',
    planQuantity: 200,
    completedQuantity: 200,
    status: '已结束'
  },
  {
    id: 'GX8',
    workOrderId: '3',
    name: '组装',
    planQuantity: 200,
    completedQuantity: 200,
    status: '已结束'
  }
];

// 模拟数据 - 生产人员列表
export const workers: Worker[] = [
  {
    id: 'W1',
    name: '张三',
    workNumber: 'SC001',
    department: '生产一部'
  },
  {
    id: 'W2',
    name: '李四',
    workNumber: 'SC002',
    department: '生产一部'
  },
  {
    id: 'W3',
    name: '王五',
    workNumber: 'SC003',
    department: '生产二部'
  },
  {
    id: 'W4',
    name: '赵六',
    workNumber: 'SC004',
    department: '生产二部'
  }
];

// 模拟数据 - 不良品原因列表
export const defectReasons: DefectReason[] = [
  {
    id: 'DR1',
    name: '尺寸偏差',
    code: 'CC001'
  },
  {
    id: 'DR2',
    name: '表面缺陷',
    code: 'CC002'
  },
  {
    id: 'DR3',
    name: '装配错误',
    code: 'CC003'
  },
  {
    id: 'DR4',
    name: '材质问题',
    code: 'CC004'
  },
  {
    id: 'DR5',
    name: '其他原因',
    code: 'CC999'
  }
];

// 模拟获取工单列表
export const getWorkOrders = (): Promise<WorkOrder[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(workOrders);
    }, 500);
  });
};

// 模拟获取工单详情
export const getWorkOrderById = (id: string): Promise<WorkOrder | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = workOrders.find(item => item.id === id);
      resolve(order);
    }, 300);
  });
};

// 模拟获取工序列表
export const getProcessesByWorkOrderId = (workOrderId: string): Promise<Process[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = processes.filter(item => item.workOrderId === workOrderId);
      resolve(result);
    }, 300);
  });
};

// 模拟获取生产人员列表
export const getWorkers = (): Promise<Worker[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(workers);
    }, 300);
  });
};

// 模拟获取不良品原因列表
export const getDefectReasons = (): Promise<DefectReason[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(defectReasons);
    }, 300);
  });
}; 