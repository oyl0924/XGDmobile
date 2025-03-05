<template>
  <div class="work-order-list">
    <!-- 控件区域 -->
    <div class="control-area">
      <!-- 标准模式：快速筛选+三个按钮 -->
      <div v-if="!isSearchMode" class="standard-controls">
        <div class="filter-dropdown">
          <div class="dropdown-title" @click="showQuickFilterPopup = true">
            {{ getQuickFilterText() }}
            <Icon name="arrow-down" size="14" />
          </div>
        </div>
        <div class="control-buttons">
          <Icon name="search" size="20" class="control-icon" @click="toggleSearchMode" />
          <Icon name="sort" size="20" class="control-icon" @click="showSortPopup = true" />
          <Icon name="filter-o" size="20" class="control-icon" @click="showFilterPopup = true" />
        </div>
      </div>
      
      <!-- 搜索模式：搜索框+搜索按钮+取消按钮 -->
      <div v-else class="search-controls">
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
        <Button size="small" class="cancel-button" @click="toggleSearchMode">取消</Button>
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
              </div>
              
              <div class="process-progress">
                <div class="progress-title">工序进度:</div>
                <Progress :percentage="item.progress" :show-pivot="false" stroke-width="8" />
                <div class="progress-info">
                  <span>{{ item.completedProcesses }}/{{ item.totalProcesses }}</span>
                  <span>{{ item.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </List>
      </PullRefresh>
    </div>
    
    <!-- 快速筛选弹出框 -->
    <Popup
      v-model:show="showQuickFilterPopup"
      position="bottom"
      round
      closeable
    >
      <div class="popup-title">快速筛选</div>
      <RadioGroup v-model="quickFilter" class="filter-options">
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
      <div class="popup-title">排序方式</div>
      <RadioGroup v-model="sortMethod" class="sort-options">
        <Cell title="创建时间" clickable @click="setSortMethod('createTime')">
          <template #right-icon>
            <Radio name="createTime" />
          </template>
        </Cell>
        <Cell title="优先级" clickable @click="setSortMethod('priority')">
          <template #right-icon>
            <Radio name="priority" />
          </template>
        </Cell>
        <Cell title="计划开始时间" clickable @click="setSortMethod('startTime')">
          <template #right-icon>
            <Radio name="startTime" />
          </template>
        </Cell>
        <Cell title="计划结束时间" clickable @click="setSortMethod('endTime')">
          <template #right-icon>
            <Radio name="endTime" />
          </template>
        </Cell>
      </RadioGroup>
      <div class="popup-actions">
        <Button type="primary" block @click="applySort">确认</Button>
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
      <DatePicker
        v-model="currentDate"
        :title="datePickerTitle"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date()"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
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
  DatePicker,
  showToast,
  Dialog
} from 'vant';
import { formatDate as formatDateHelper } from '@/utils/date';
import { 
  RawWorkOrderItem, 
  WorkOrderItem, 
  convertWorkOrder,
  getWorkOrders
} from '@/api/workOrder';

// 类型定义
interface FilterCondition {
  dateType: 'start' | 'end';
  startDate: string | null;
  endDate: string | null;
  status: string;
  searchText: string;
  orderNumber: string;
  productName: string;
  onlyUrgent: boolean;
}

// 添加 TagType 类型定义
type TagType = 'default' | 'primary' | 'success' | 'warning' | 'danger';

const router = useRouter();

// 控件区域状态
const isSearchMode = ref(false);
const searchText = ref('');
const quickFilter = ref('all');
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

// 设置快速筛选
const setQuickFilter = (filter: string) => {
  quickFilter.value = filter;
};

// 应用快速筛选
const applyQuickFilter = () => {
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
const sortMethod = ref('createTime');

// 设置排序方法
const setSortMethod = (method: string) => {
  sortMethod.value = method;
};

// 应用排序
const applySort = () => {
  showToast(`排序方式：${sortMethod.value}`);
  showSortPopup.value = false;
  
  // 重新加载数据
  loadOrders();
};

// 筛选弹出框
const showFilterPopup = ref(false);
const filter = ref<FilterCondition>({
  dateType: 'start',
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
const currentDate = ref<string[]>([]);
const datePickerTitle = ref('选择开始日期');

// 打开日期选择器
const openDatePicker = () => {
  filter.value.dateType = 'start';
  datePickerTitle.value = '选择开始日期';
  currentDate.value = [filter.value.startDate || new Date().toISOString().split('T')[0], filter.value.endDate || new Date().toISOString().split('T')[0]];
  showDatePicker.value = true;
};

// 日期确认
const onDateConfirm = (value: string[]) => {
  if (filter.value.dateType === 'start') {
    filter.value.startDate = value[0];
    filter.value.dateType = 'end';
    datePickerTitle.value = '选择结束日期';
    currentDate.value = value;
  } else {
    filter.value.endDate = value[1];
    showDatePicker.value = false;
    filter.value.dateType = 'start';
  }
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
    dateType: 'start',
    startDate: null,
    endDate: null,
    status: '',
    searchText: '',
    orderNumber: '',
    productName: '',
    onlyUrgent: false
  };
  currentDate.value = [new Date().toISOString().split('T')[0]];
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
const originalOrders = ref<RawWorkOrderItem[]>([
  {
    id: '1',
    orderNumber: 'GD2025022800001',
    productName: '芯线',
    quantity: 122,
    status: '执行中',
    isUrgent: true,
    startTime: '2025-02-28 00:00:00',
    endTime: '2025-03-05 00:00:00',
    createTime: '2025-02-26 10:00:00',
    completedProcesses: 0,
    totalProcesses: 3,
    progress: 0,
    remainDays: 4
  },
  {
    id: '2',
    orderNumber: 'GD2025022800002',
    productName: '配电箱',
    quantity: 50,
    status: '未开始',
    isUrgent: false,
    startTime: '2025-03-01 00:00:00',
    endTime: '2025-03-10 00:00:00',
    createTime: '2025-02-25 14:30:00',
    completedProcesses: 0,
    totalProcesses: 5,
    progress: 0,
    remainDays: 10
  },
  {
    id: '3',
    orderNumber: 'GD2025022800003',
    productName: '开关面板',
    quantity: 200,
    status: '执行中',
    isUrgent: false,
    startTime: '2025-02-27 00:00:00',
    endTime: '2025-03-08 00:00:00',
    createTime: '2025-02-24 09:15:00',
    completedProcesses: 2,
    totalProcesses: 4,
    progress: 50,
    remainDays: 8
  },
  {
    id: '4',
    orderNumber: 'GD2025022800004',
    productName: '电线',
    quantity: 1000,
    status: '已结束',
    isUrgent: false,
    startTime: '2025-02-20 00:00:00',
    endTime: '2025-02-25 00:00:00',
    createTime: '2025-02-18 08:45:00',
    completedProcesses: 6,
    totalProcesses: 6,
    progress: 100,
    remainDays: 0
  }
]);

const orders = ref<WorkOrderItem[]>([]);

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

// 更新工单数据加载
const loadWorkOrders = async () => {
  try {
    const response = await getWorkOrders();
    orders.value = response.data.map(convertWorkOrder);
  } catch (error) {
    showToast('加载工单列表失败');
  }
};

// 更新筛选逻辑
const filteredOrders = computed<WorkOrderItem[]>(() => {
  return orders.value.filter((item: WorkOrderItem) => {
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
  
  // 实际应用中应该调用API
  setTimeout(() => {
    // 根据筛选条件过滤数据
    let filtered = [...originalOrders.value];
    
    // 应用快速筛选
    if (quickFilter.value === 'urgent') {
      filtered = filtered.filter(item => item.isUrgent);
    } else if (quickFilter.value === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(item => item.startTime.startsWith(today) || item.endTime.startsWith(today));
    }
    
    // 应用状态筛选
    if (statusFilter.value !== 'all') {
      const statusMap: { [key: string]: string } = {
        'pending': '未开始',
        'processing': '执行中',
        'completed': '已结束'
      };
      filtered = filtered.filter(item => item.status === statusMap[statusFilter.value]);
    }
    
    // 应用搜索
    if (searchText.value) {
      const keywords = searchText.value.toLowerCase();
      filtered = filtered.filter(item => 
        item.orderNumber.toLowerCase().includes(keywords) || 
        item.productName.toLowerCase().includes(keywords)
      );
    }
    
    // 应用高级筛选
    if (showFilterPopup.value || filter.value.orderNumber || filter.value.productName || filter.value.onlyUrgent || filter.value.startDate || filter.value.endDate) {
      if (filter.value.orderNumber) {
        filtered = filtered.filter(item => item.orderNumber.includes(filter.value.orderNumber));
      }
      
      if (filter.value.productName) {
        filtered = filtered.filter(item => item.productName.includes(filter.value.productName));
      }
      
      if (filter.value.onlyUrgent) {
        filtered = filtered.filter(item => Boolean(item.isUrgent));
      }
      
      if (filter.value.startDate) {
        const startDate = new Date(filter.value.startDate).getTime();
        filtered = filtered.filter(item => new Date(item.createTime).getTime() >= startDate);
      }
      
      if (filter.value.endDate) {
        const endDate = new Date(filter.value.endDate).getTime() + Number(ONE_DAY_MS) - 1;
        filtered = filtered.filter(item => new Date(item.createTime).getTime() <= endDate);
      }
    }
    
    // 应用排序
    filtered.sort((a, b) => {
      if (sortMethod.value === 'createTime') {
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
      } else if (sortMethod.value === 'priority') {
        return (a.isUrgent === b.isUrgent) ? 0 : a.isUrgent ? -1 : 1;
      } else if (sortMethod.value === 'startTime') {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      } else if (sortMethod.value === 'endTime') {
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      }
      return 0;
    });
    
    // 在赋值给orders.value之前，使用convertWorkOrder函数将filtered数组转换为WorkOrderItem
    const processedOrders: WorkOrderItem[] = filtered.map(item => convertWorkOrder(item));

    orders.value = processedOrders;
    
    // 更新加载状态
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
  statusCounts.processing = originalOrders.value.filter(item => item.status === '执行中').length;
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
const viewOrderDetail = (item: WorkOrderItem) => {
  router.push({ 
    path: '/order-detail', 
    query: { id: item.id } 
  });
};

// 切换搜索模式
const toggleSearchMode = () => {
  isSearchMode.value = !isSearchMode.value;
  if (!isSearchMode.value) {
    searchText.value = '';
  }
};

// 执行搜索
const doSearch = () => {
  if (!searchText.value.trim()) {
    showToast('请输入搜索内容');
    return;
  }
  
  // 实际应用中应该调用API搜索
  showToast(`搜索：${searchText.value}`);
  
  // 重新加载数据
  loadOrders();
};
</script>

<style scoped lang="less">
.work-order-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

// 控件区域
.control-area {
  padding: 8px 12px;
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

.search-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-field {
  flex: 1;
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

.process-progress {
  padding-top: 8px;
  border-top: 1px dashed #ebedf0;
}

.progress-title {
  font-size: 14px;
  margin-bottom: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

// 弹出框样式
.popup-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  border-bottom: 1px solid #f2f2f2;
}

.sort-options, .filter-options {
  padding: 8px 0;
}

.popup-actions {
  padding: 16px;
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
</style> 