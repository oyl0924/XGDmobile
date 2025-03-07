<template>
  <div class="work-order-list">
    <!-- 控件区域 -->
    <div class="control-area">
      <!-- 标准模式：快速筛选+三个按钮 -->
      <div class="standard-controls">
        <div class="filter-dropdown">
          <div class="dropdown-title" @click="openQuickFilterPopup">
            {{ getQuickFilterText() }}
            <Icon name="arrow-down" size="14" />
          </div>
        </div>
        <div class="control-buttons">
          <Icon name="search" size="20" class="control-icon" @click="showSearchPopup = true" />
          <Icon name="filter-o" size="20" class="control-icon" @click="showFilterPopup = true" />
          <Icon name="sort" size="20" class="control-icon" @click="showSortPopup = true" />
        </div>
      </div>
    </div>
    
    <!-- 工单状态筛选区域 -->
    <div class="status-filter">
      <Tabs v-model:active="statusFilter" swipeable>
        <Tab :title="`全部 ${statusCounts.total}`" name="all" />
        <Tab :title="`未开始 ${statusCounts.pending}`" name="pending" />
        <Tab :title="`执行中 ${statusCounts.processing}`" name="processing" />
        <Tab :title="`已结束 ${statusCounts.completed}`" name="completed" />
      </Tabs>
    </div>
    
    <!-- 列表区域 -->
    <div class="list-container">
      <PullRefresh v-model="refreshing" @refresh="onRefresh">
        <List
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多数据了"
          @load="onLoad"
        >
          <div v-if="filteredOrders.length === 0 && !loading" class="empty-list">
            <Empty description="暂无工单数据" />
          </div>
          
          <div 
            v-for="(item, index) in filteredOrders" 
            :key="index" 
            class="order-card"
            @click="viewOrderDetail(item)"
          >
            <div class="order-header">
              <div class="order-number">{{ item.orderNumber }}</div>
              <Tag 
                :type="getStatusType(item.status)" 
                class="status-tag"
              >
                {{ item.status }}
              </Tag>
            </div>
            
            <div class="order-content">
              <div class="product-info">
                <div class="product-name">{{ item.productName }}</div>
                <div class="quantity">计划数: {{ item.quantity }}</div>
              </div>
              
              <!-- 工序进度条 -->
              <div class="process-progress-container">
                <ProcessProgress 
                  v-if="item.processProgress && item.processProgress.length > 0"
                  :processes="item.processProgress"
                />
                <div v-else class="loading-process-progress">
                  <Loading size="24px" type="spinner" />
                </div>
              </div>
              
              <div class="order-info">
                <div class="info-row">
                  <span class="info-label">优先级:</span>
                  <span class="info-value">
                    <Tag type="danger" v-if="item.isUrgent === 1">加急</Tag>
                    <span v-else>普通</span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">计划开始:</span>
                  <span class="info-value">{{ formatDate(item.startTime) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">计划结束:</span>
                  <span class="info-value">{{ formatDate(item.endTime) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">创建时间:</span>
                  <span class="info-value">{{ formatDate(item.createTime) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">剩余天数:</span>
                  <span class="info-value">{{ item.remainDays }} 天</span>
                </div>
              </div>
            </div>
          </div>
        </List>
      </PullRefresh>
    </div>
    
    <!-- 搜索悬浮窗 -->
    <Popup
      v-model:show="showSearchPopup"
      position="top"
      :style="{ height: 'auto' }"
    >
      <div class="search-popup">
        <div class="search-controls">
          <Field
            v-model="searchText"
            placeholder="搜索工单号/产品名称"
            clearable
            class="search-field"
            @keypress.enter="doSearch"
          >
            <template #left-icon>
              <Icon name="search" size="18" />
            </template>
          </Field>
          <Button size="small" type="primary" class="search-button" @click="doSearch">搜索</Button>
          <Button size="small" class="cancel-button" @click="showSearchPopup = false">取消</Button>
        </div>
      </div>
    </Popup>
    
    <!-- 快速筛选弹出框 -->
    <Popup
      v-model:show="showQuickFilterPopup"
      position="bottom"
      round
      closeable
    >
      <div class="popup-title">快速筛选</div>
      <RadioGroup v-model="tempQuickFilter" class="filter-options">
        <Cell title="全部工单" clickable @click="setQuickFilter('all')">
          <template #right-icon>
            <Radio name="all" />
          </template>
        </Cell>
        <Cell title="加急工单" clickable @click="setQuickFilter('urgent')">
          <template #right-icon>
            <Radio name="urgent" />
          </template>
        </Cell>
        <Cell title="今日工单" clickable @click="setQuickFilter('today')">
          <template #right-icon>
            <Radio name="today" />
          </template>
        </Cell>
      </RadioGroup>
      <div class="popup-actions">
        <Button type="primary" block @click="applyQuickFilter">确认</Button>
      </div>
    </Popup>
    
    <!-- 排序弹出框 -->
    <Popup
      v-model:show="showSortPopup"
      position="bottom"
      round
      closeable
    >
      <div class="popup-title">排序</div>
      
      <div class="sort-table">
        <div class="sort-row">
          <div class="field-name">创建时间</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'createTime' && sortOrder === 'asc' }"
              @click="setSortConfig('createTime', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'createTime' && sortOrder === 'desc' }"
              @click="setSortConfig('createTime', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">更新时间</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'updateTime' && sortOrder === 'asc' }"
              @click="setSortConfig('updateTime', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'updateTime' && sortOrder === 'desc' }"
              @click="setSortConfig('updateTime', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">优先级</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'priority' && sortOrder === 'asc' }"
              @click="setSortConfig('priority', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'priority' && sortOrder === 'desc' }"
              @click="setSortConfig('priority', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">计划开始时间</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'startTime' && sortOrder === 'asc' }"
              @click="setSortConfig('startTime', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'startTime' && sortOrder === 'desc' }"
              @click="setSortConfig('startTime', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">计划结束时间</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'endTime' && sortOrder === 'asc' }"
              @click="setSortConfig('endTime', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'endTime' && sortOrder === 'desc' }"
              @click="setSortConfig('endTime', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">工单编号</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'orderNumber' && sortOrder === 'asc' }"
              @click="setSortConfig('orderNumber', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'orderNumber' && sortOrder === 'desc' }"
              @click="setSortConfig('orderNumber', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">产品编号</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'productCode' && sortOrder === 'asc' }"
              @click="setSortConfig('productCode', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'productCode' && sortOrder === 'desc' }"
              @click="setSortConfig('productCode', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">产品名称</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'productName' && sortOrder === 'asc' }"
              @click="setSortConfig('productName', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'productName' && sortOrder === 'desc' }"
              @click="setSortConfig('productName', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">产品规格</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'productSpec' && sortOrder === 'asc' }"
              @click="setSortConfig('productSpec', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'productSpec' && sortOrder === 'desc' }"
              @click="setSortConfig('productSpec', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">实际开始时间</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'actualStartTime' && sortOrder === 'asc' }"
              @click="setSortConfig('actualStartTime', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'actualStartTime' && sortOrder === 'desc' }"
              @click="setSortConfig('actualStartTime', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
        
        <div class="sort-row">
          <div class="field-name">实际结束时间</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'actualEndTime' && sortOrder === 'asc' }"
              @click="setSortConfig('actualEndTime', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'actualEndTime' && sortOrder === 'desc' }"
              @click="setSortConfig('actualEndTime', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
      </div>
    </Popup>
    
    <!-- 筛选弹出框 -->
    <Popup
      v-model:show="showFilterPopup"
      position="right"
      :style="{ width: '80%', height: '100%' }"
    >
      <div class="filter-container">
        <NavBar 
          title="筛选条件" 
          left-arrow 
          @click-left="showFilterPopup = false"
          right-text="重置"
          @click-right="resetFilter"
        />
        
        <div class="filter-content">
          <Field 
            v-model="filter.orderNumber" 
            label="工单号" 
            placeholder="请输入工单号" 
            clearable 
          />
          
          <Field 
            v-model="filter.productName" 
            label="产品名称" 
            placeholder="请输入产品名称" 
            clearable 
          />
          
          <Field 
            readonly 
            clickable 
            label="创建时间" 
            :value="formatDateRange(filter.startDate, filter.endDate)" 
            placeholder="请选择时间范围" 
            @click="openDatePicker" 
          />
          
          <div class="filter-switch">
            <span class="switch-label">只看加急</span>
            <Switch v-model="filter.onlyUrgent" />
          </div>
          
          <div class="filter-actions">
            <Button type="primary" block @click="applyFilter">应用筛选</Button>
          </div>
        </div>
      </div>
    </Popup>
    
    <!-- 日期选择器 -->
    <Popup v-model:show="showDatePicker" position="bottom">
      <Calendar
        v-model:show="showDatePicker"
        :show-confirm="true"
        type="range"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date()"
        @confirm="onCalendarConfirm"
      />
    </Popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Icon, 
  Field, 
  Button, 
  Tabs, 
  Tab, 
  List, 
  Tag, 
  Empty, 
  Progress,
  PullRefresh, 
  Popup, 
  Radio, 
  RadioGroup, 
  Cell, 
  NavBar, 
  Switch,
  Calendar,
  showToast,
  Dialog,
  Loading
} from 'vant';
import { formatDate as formatDateHelper } from '@/utils/date';
import { 
  RawWorkOrderItem, 
  WorkOrderItem, 
  ProcessProgressItem,
  convertWorkOrder,
  getWorkOrders,
  getWorkOrderProcessProgress
} from '@/api/workOrder';
import ProcessProgress from '@/components/ProcessProgress.vue';

// 类型定义
interface FilterCondition {
  startDate: string | null;
  endDate: string | null;
  status: string;
  searchText: string;
  orderNumber: string;
  productName: string;
  onlyUrgent: boolean;
}

// 扩展WorkOrderItem添加工序进度
interface WorkOrderWithProgress extends WorkOrderItem {
  processProgress?: ProcessProgressItem[];
}

// 添加 TagType 类型定义
type TagType = 'default' | 'primary' | 'success' | 'warning' | 'danger';

const router = useRouter();

// 控件区域状态
const showSearchPopup = ref(false);
const searchText = ref('');
const quickFilter = ref('all');
const tempQuickFilter = ref('all'); // 临时存储选择的过滤器
const showQuickFilterPopup = ref(false);
const quickFilterOptions = [
  { text: '全部工单', value: 'all' },
  { text: '加急工单', value: 'urgent' },
  { text: '今日工单', value: 'today' }
];

// 获取快速筛选的显示文本
const getQuickFilterText = () => {
  switch (quickFilter.value) {
    case 'all':
      return '全部工单';
    case 'urgent':
      return '加急工单';
    case 'today':
      return '今日工单';
    default:
      return '全部工单';
  }
};

// 打开快速筛选弹窗
const openQuickFilterPopup = () => {
  tempQuickFilter.value = quickFilter.value; // 初始化临时过滤器为当前选中的值
  showQuickFilterPopup.value = true;
};

// 设置临时快速筛选选项
const setQuickFilter = (filter: string) => {
  tempQuickFilter.value = filter;
  // 不再关闭弹窗和加载数据，只在点击确认按钮时执行
};

// 应用快速筛选
const applyQuickFilter = () => {
  quickFilter.value = tempQuickFilter.value; // 应用临时选择的过滤器
  showQuickFilterPopup.value = false;
  loadOrders();
};

// 工单状态筛选
const statusFilter = ref('all');
const statusCounts = reactive({
  total: 15,
  pending: 6,
  processing: 8,
  completed: 1
});

// 获取标签类型
const getStatusType = (status: string): TagType => {
  switch (status) {
    case '未开始':
      return 'warning';
    case '进行中':
      return 'primary';
    case '已完成':
      return 'success';
    default:
      return 'default';
  }
};

// 排序弹出框
const showSortPopup = ref(false);
const sortField = ref('createTime');
const sortOrder = ref('asc');

// 设置排序配置
const setSortConfig = (field: string, order: string) => {
  sortField.value = field;
  sortOrder.value = order;
  
  // 立即应用排序并关闭弹窗
  applySort();
};

// 应用排序
const applySort = () => {
  // 显示中文提示
  let fieldName = '';
  switch (sortField.value) {
    case 'createTime': fieldName = '创建时间'; break;
    case 'updateTime': fieldName = '更新时间'; break;
    case 'priority': fieldName = '优先级'; break;
    case 'reportTime': fieldName = '工单截止时间'; break;
    case 'orderNumber': fieldName = '工单编号'; break;
    case 'productName': fieldName = '产品名称'; break;
    case 'quantity': fieldName = '工单数量'; break;
    default: fieldName = sortField.value;
  }
  
  showToast(`排序方式：${fieldName} ${sortOrder.value === 'asc' ? '升序' : '降序'}`);
  showSortPopup.value = false;
  
  // 对当前列表应用排序
  sortOrders();
};

// 筛选弹出框
const showFilterPopup = ref(false);
const filter = ref<FilterCondition>({
  startDate: null,
  endDate: null,
  status: '',
  searchText: '',
  orderNumber: '',
  productName: '',
  onlyUrgent: false
});

// 日期选择
const showDatePicker = ref(false);
const datePickerTitle = ref('选择时间范围');

// 打开日期选择器
const openDatePicker = () => {
  showDatePicker.value = true;
};

// 日历确认
const onCalendarConfirm = (value: [Date, Date]) => {
  filter.value.startDate = formatDateHelper(value[0], 'yyyy-MM-dd');
  filter.value.endDate = formatDateHelper(value[1], 'yyyy-MM-dd');
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  return formatDateHelper(new Date(dateStr), 'yyyy-MM-dd');
};

// 格式化日期范围
const formatDateRange = (start: string | null, end: string | null): string => {
  if (!start && !end) return '';
  if (!start) return `至 ${formatDate(end!)}`;
  if (!end) return `${formatDate(start)} 起`;
  return `${formatDate(start)} 至 ${formatDate(end)}`;
};

// 重置筛选条件
const resetFilter = () => {
  filter.value = {
    startDate: null,
    endDate: null,
    status: '',
    searchText: '',
    orderNumber: '',
    productName: '',
    onlyUrgent: false
  };
  showToast('筛选条件已重置');
};

// 应用筛选
const applyFilter = () => {
  showFilterPopup.value = false;
  // 实际应用中应该根据筛选条件重新加载数据
  showToast('筛选条件已应用');
  
  // 重置列表
  finished.value = false;
  loadOrders();
};

// 列表数据
const mockData: WorkOrderWithProgress[] = [
  {
    id: '1',
    orderNumber: 'GD2025022800001',
    productName: '螺丝刀',
    quantity: 100,
    status: '未开始',
    isUrgent: 1, // 这里修改为数字类型
    startTime: '2025-02-20 00:00:00',
    endTime: '2025-02-25 00:00:00',
    createTime: '2025-02-18 08:45:00',
    completedProcesses: 0,
    totalProcesses: 5,
    progress: 0,
    remainDays: 5
  },
  {
    id: '2',
    orderNumber: 'GD2025022800002',
    productName: '扳手',
    quantity: 50,
    status: '进行中',
    isUrgent: 0, // 这里修改为数字类型
    startTime: '2025-02-19 00:00:00',
    endTime: '2025-02-28 00:00:00',
    createTime: '2025-02-17 10:30:00',
    completedProcesses: 3,
    totalProcesses: 5,
    progress: 60,
    remainDays: 8
  },
  {
    id: '3',
    orderNumber: 'GD2025022800003',
    productName: '锤子',
    quantity: 200,
    status: '进行中',
    isUrgent: 0, // 这里修改为数字类型
    startTime: '2025-02-18 00:00:00',
    endTime: '2025-03-01 00:00:00',
    createTime: '2025-02-16 14:20:00',
    completedProcesses: 2,
    totalProcesses: 5,
    progress: 40,
    remainDays: 8
  },
  {
    id: '4',
    orderNumber: 'GD2025022800004',
    productName: '电线',
    quantity: 1000,
    status: '已结束',
    isUrgent: 0, // 这里修改为数字类型
    startTime: '2025-02-20 00:00:00',
    endTime: '2025-02-25 00:00:00',
    createTime: '2025-02-18 08:45:00',
    completedProcesses: 6,
    totalProcesses: 6,
    progress: 100,
    remainDays: 0
  }
];

const originalOrders = ref<WorkOrderWithProgress[]>(mockData);

const orders = ref<WorkOrderWithProgress[]>([]);

// 日期计算常量
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// 日期计算工具函数
const getEndOfDay = (dateStr: string): number => {
  const date = new Date(dateStr);
  const timestamp = date.getTime();
  return timestamp + ONE_DAY_MS - 1;
};

const getDateTimestamp = (dateStr: string): number => {
  return new Date(dateStr).getTime();
};

// 加载工序进度
const loadProcessProgress = async (item: WorkOrderWithProgress) => {
  try {
    const progressData = await getWorkOrderProcessProgress(item.id);
    item.processProgress = progressData;
  } catch (error) {
    console.error('加载工序进度失败:', error);
    showToast('加载工序进度失败');
  }
};

// 修改加载工单的方法，使用 WorkOrderWithProgress 类型
const loadWorkOrders = async () => {
  try {
    const response = await getWorkOrders();
    // 将 API 返回的数据转换为带有工序进度属性的工单
    orders.value = response.data.map(item => {
      const converted = convertWorkOrder(item);
      return {
        ...converted,
        processProgress: undefined // 初始时没有工序进度数据
      };
    });
  } catch (error) {
    console.error('加载工单列表失败:', error);
    showToast('加载工单列表失败');
  }
};

// 更新筛选逻辑
const filteredOrders = computed<WorkOrderWithProgress[]>(() => {
  return orders.value.filter((item: WorkOrderWithProgress) => {
    // 检查订单号
    if (filter.value.orderNumber && !item.orderNumber.includes(filter.value.orderNumber)) {
      return false;
    }
    
    // 检查产品名称
    if (filter.value.productName && !item.productName.includes(filter.value.productName)) {
      return false;
    }
    
    // 检查加急状态
    if (filter.value.onlyUrgent && item.isUrgent === 0) {
      return false;
    }
    
    // 检查开始日期
    if (filter.value.startDate) {
      const startTimestamp = getDateTimestamp(filter.value.startDate);
      const itemTimestamp = getDateTimestamp(item.createTime);
      if (itemTimestamp < startTimestamp) {
        return false;
      }
    }
    
    // 检查结束日期
    if (filter.value.endDate) {
      const endTimestamp = getEndOfDay(filter.value.endDate);
      const itemTimestamp = getDateTimestamp(item.createTime);
      if (itemTimestamp > endTimestamp) {
        return false;
      }
    }
    
    return true;
  });
});

// 列表加载状态
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

// 初始化
onMounted(() => {
  loadOrders();
});

// 监听快速筛选变化
watch(quickFilter, (newValue) => {
  console.log('快速筛选切换为:', newValue);
});

// 监听状态筛选变化
watch(statusFilter, (newValue) => {
  console.log('状态筛选切换为:', newValue);
  // 根据筛选条件加载数据
  loadOrders();
});

// 方法: 加载工单列表
const loadOrders = () => {
  // 设置加载状态
  loading.value = true;
  
  // 在实际应用中，会调用API获取数据
  // 这里仅作演示，使用模拟数据
  setTimeout(() => {
    let filtered = [...originalOrders.value];
    
    // 应用快速筛选
    if (quickFilter.value === 'urgent') {
      filtered = filtered.filter(item => item.isUrgent === 1);
    } else if (quickFilter.value === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(item => item.createTime.startsWith(today));
    }
    
    // 应用标签筛选
    if (statusFilter.value !== 'all') {
      const statusMap: Record<string, string> = {
        'pending': '未开始',
        'processing': '进行中',
        'completed': '已结束'
      };
      const targetStatus = statusMap[statusFilter.value];
      filtered = filtered.filter(item => item.status === targetStatus);
    }
    
    // 应用搜索文本筛选
    if (searchText.value) {
      const searchLower = searchText.value.toLowerCase();
      filtered = filtered.filter(item => {
        return item.orderNumber.toLowerCase().includes(searchLower) || 
               item.productName.toLowerCase().includes(searchLower);
      });
    }
    
    orders.value = filtered;
    
    // 加载完工单后，自动加载所有工单的工序进度
    orders.value.forEach(async (item) => {
      try {
        const progressData = await getWorkOrderProcessProgress(item.id);
        item.processProgress = progressData;
      } catch (error) {
        console.error(`加载工单 ${item.id} 的工序进度失败:`, error);
      }
    });
    
    // 应用排序
    sortOrders();
    
    // 模拟加载完成
    loading.value = false;
    if (refreshing.value) refreshing.value = false;
    finished.value = true;
    
    // 更新状态计数
    updateStatusCounts();
  }, 1000);
};

// 更新状态计数
const updateStatusCounts = () => {
  statusCounts.total = originalOrders.value.length;
  statusCounts.pending = originalOrders.value.filter(item => item.status === '未开始').length;
  statusCounts.processing = originalOrders.value.filter(item => item.status === '进行中').length;
  statusCounts.completed = originalOrders.value.filter(item => item.status === '已结束').length;
};

// 方法: 下拉刷新
const onRefresh = () => {
  // 重置列表状态
  finished.value = false;
  // 重新加载数据
  loadOrders();
};

// 方法: 加载更多
const onLoad = () => {
  // 实际应用中应该加载下一页数据
  loadOrders();
};

// 方法: 查看工单详情
const viewOrderDetail = (item: WorkOrderWithProgress) => {
  router.push({ 
    path: '/order-detail', 
    query: { id: item.id } 
  });
};

// 执行搜索
const doSearch = () => {
  if (!searchText.value.trim()) {
    showToast('请输入搜索内容');
    return;
  }
  
  // 实际应用中应该调用API搜索
  showToast(`搜索：${searchText.value}`);
  
  // 关闭搜索弹窗
  showSearchPopup.value = false;
  
  // 重新加载数据
  loadOrders();
};

// 对过滤后的工单列表排序
const sortOrders = () => {
  filteredOrders.value.sort((a, b) => {
    let result = 0;
    
    switch (sortField.value) {
      case 'createTime':
        result = new Date(b.createTime || '').getTime() - new Date(a.createTime || '').getTime();
        break;
      case 'updateTime':
        // 使用createTime代替updateTime（因为模型中没有updateTime字段）
        result = new Date(b.createTime || '').getTime() - new Date(a.createTime || '').getTime();
        break;
      case 'priority':
        // 对优先级排序 (加急在前)
        const aUrgent = a.isUrgent === 1 ? 2 : 1;
        const bUrgent = b.isUrgent === 1 ? 2 : 1;
        result = bUrgent - aUrgent;
        break;
      case 'startTime':
        result = new Date(b.startTime || '').getTime() - new Date(a.startTime || '').getTime();
        break;
      case 'endTime':
        result = new Date(b.endTime || '').getTime() - new Date(a.endTime || '').getTime();
        break;
      case 'orderNumber':
        result = a.orderNumber.localeCompare(b.orderNumber);
        break;
      case 'productCode':
        // 使用productName代替productCode
        result = a.productName.localeCompare(b.productName);
        break;
      case 'productName':
        result = a.productName.localeCompare(b.productName);
        break;
      case 'productSpec':
        // 使用productName代替productSpec
        result = a.productName.localeCompare(b.productName);
        break;
      case 'actualStartTime':
        // 使用startTime代替actualStartTime
        result = new Date(b.startTime || '').getTime() - new Date(a.startTime || '').getTime();
        break;
      case 'actualEndTime':
        // 使用endTime代替actualEndTime
        result = new Date(b.endTime || '').getTime() - new Date(a.endTime || '').getTime();
        break;
      default:
        // 默认按创建时间排序
        result = new Date(b.createTime || '').getTime() - new Date(a.createTime || '').getTime();
    }
    
    // 根据排序方向调整结果
    return sortOrder.value === 'asc' ? -result : result;
  });
};
</script>

<style scoped lang="less">
.work-order-list {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 控件区域
.control-area {
  padding: 10px 12px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.standard-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-dropdown {
  flex: 1;
}

.dropdown-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #323233;
  padding: 6px 0;
}

.control-buttons {
  display: flex;
  gap: 16px;
}

.control-icon {
  padding: 4px;
}

// 工单状态筛选区域
.status-filter {
  background-color: #fff;
  border-top: 1px solid #f2f2f2;
  position: sticky;
  top: 48px;
  z-index: 9;
}

// 列表区域
.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

// 工单卡片
.order-card {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2f2f2;
}

.order-number {
  font-size: 16px;
  font-weight: 500;
}

.order-content {
  padding-top: 12px;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
}

.quantity {
  font-size: 14px;
  color: #646566;
}

.order-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 6px;
  font-size: 14px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  color: #646566;
  min-width: 70px;
}

.info-value {
  color: #323233;
  flex: 1;
}

.process-progress-container {
  margin: 1px 0px 8px 0px;
  border-top: 1px dashed #ebedf0;
  border-bottom: 1px dashed #ebedf0;
  padding: 5px 0px 0px 0px;
}

.loading-process-progress {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.load-progress-button {
  color: #1989fa;
  font-size: 14px;
  padding: 4px 8px;
  border: 1px solid #1989fa;
  border-radius: 4px;
  cursor: pointer;
  
  &:active {
    opacity: 0.7;
  }
}

// 弹出框样式
.popup-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  border-bottom: 1px solid #f2f2f2;
}

.sort-table {
  padding: 16px;
}

.sort-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.field-name {
  font-size: 14px;
  color: #323233;
}

.sort-actions {
  display: flex;
  gap: 8px;
}

.sort-button {
  padding: 4px 8px;
  border: 1px solid #1989fa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &.active {
    background-color: #1989fa;
    color: white;
  }
}

// 筛选面板
.filter-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.filter-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.switch-label {
  font-size: 14px;
  color: #323233;
}

.filter-actions {
  margin-top: 24px;
}

// 空状态
.empty-list {
  padding: 40px 0;
}

// 搜索悬浮窗样式
.search-popup {
  background-color: white;
  padding: 16px 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-field {
  flex: 1;
}
</style> 