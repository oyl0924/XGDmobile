<template>
  <div class="report-list">
    <NavBar 
      title="报工列表" 
      fixed 
      right-text=" "
    />
    
    <!-- 控件区域 - 快速筛选 -->
    <div class="control-area">
      <div class="standard-controls">
        <div class="filter-dropdown">
          <div class="dropdown-title" @click="openQuickFilterPopup">
            {{ getQuickFilterText() }}
            <Icon name="arrow-down" size="14" />
          </div>
        </div>
        <div class="control-buttons">
          <Icon name="checked" size="20" class="control-icon" :class="{ active: isMultiSelect }" @click="toggleMultiSelect" />
          <Icon name="filter-o" size="20" class="control-icon" :class="{ active: showFilter }" @click="toggleFilter" />
          <Icon name="sort" size="20" class="control-icon" @click="showSortPopup = true" />
          <Icon name="plus" size="20" class="control-icon" @click="goToReportCreate" />
        </div>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-container">
      <div class="stats-card">
        <div class="stats-row">
          <div class="stats-item">
            <div class="stats-value">{{ stats.total }}</div>
            <div class="stats-label">总数</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">{{ stats.good }}</div>
            <div class="stats-label">良品数</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">{{ stats.defect }}</div>
            <div class="stats-label">不良品数</div>
          </div>
        </div>
        
        <div class="stats-row">
          <div class="stats-item">
            <div class="stats-value">{{ stats.approved }} / {{ stats.total }}</div>
            <div class="stats-label">审批/总计</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">{{ stats.defectRate }}%</div>
            <div class="stats-label">不良品率</div>
          </div>
          <div class="stats-item">
            <div class="stats-value">{{ stats.totalSalary }}</div>
            <div class="stats-label">工资总计</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 筛选标签 -->
    <div class="tabs-container">
      <Tabs v-model:active="activeTab" swipeable>
        <Tab :title="`全部 ${tabCounts.all}`" name="all" />
        <Tab :title="`已审批 ${tabCounts.approved}`" name="approved" />
        <Tab :title="`未审批 ${tabCounts.unapproved}`" name="unapproved" />
      </Tabs>
    </div>
    
    <!-- 快速筛选弹出框 -->
    <Popup
      v-model:show="showQuickFilterPopup"
      position="bottom"
      round
      closeable
    >
      <div class="popup-title">快速筛选</div>
      <RadioGroup v-model="tempQuickFilter" class="filter-options">
        <Cell title="全部报工" clickable @click="setQuickFilter('all')">
          <template #right-icon>
            <Radio name="all" />
          </template>
        </Cell>
        <Cell title="我的报工" clickable @click="setQuickFilter('my')">
          <template #right-icon>
            <Radio name="my" />
          </template>
        </Cell>
        <Cell title="今日报工" clickable @click="setQuickFilter('today')">
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
          <div class="field-name">报工时间</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'reportTime' && sortOrder === 'asc' }"
              @click="setSortConfig('reportTime', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'reportTime' && sortOrder === 'desc' }"
              @click="setSortConfig('reportTime', 'desc')"
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
          <div class="field-name">报工数量</div>
          <div class="sort-actions">
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'quantity' && sortOrder === 'asc' }"
              @click="setSortConfig('quantity', 'asc')"
            >
              升序
            </div>
            <div 
              class="sort-button" 
              :class="{ active: sortField === 'quantity' && sortOrder === 'desc' }"
              @click="setSortConfig('quantity', 'desc')"
            >
              降序
            </div>
          </div>
        </div>
      </div>
    </Popup>
    
    <!-- 筛选面板 -->
    <Popup v-model:show="showFilter" position="right" :style="{ width: '80%', height: '100%' }">
      <div class="filter-container">
        <NavBar 
          title="筛选条件" 
          left-arrow 
          @click-left="showFilter = false"
          right-text="重置"
          @click-right="resetFilter"
        />
        
        <div class="filter-content">
          <Field 
            v-model="filter.worker" 
            label="报工人员" 
            placeholder="请输入报工人员" 
            clearable 
          />
          
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
            v-model="filter.processName" 
            label="工序名称" 
            placeholder="请输入工序名称" 
            clearable 
          />
          
          <Field 
            readonly 
            clickable 
            label="报工时间" 
            :value="formatDateRange(filter.startDate, filter.endDate)" 
            placeholder="请选择时间范围" 
            @click="openDatePicker" 
          />
          
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
    
    <!-- 报工列表 -->
    <div class="list-container">
      <PullRefresh v-model="refreshing" @refresh="onRefresh">
        <List
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多数据了"
          @load="onLoad"
        >
          <div v-if="reports.length === 0 && !loading" class="empty-list">
            <Empty description="暂无报工数据" />
          </div>
          
          <div 
            v-for="(item, index) in reports" 
            :key="index" 
            class="report-card"
            @click="viewReportDetail(item)"
          >
            <div class="report-header">
              <div class="report-title">
                <span>{{ item.orderNumber }}</span>
                <Tag 
                  :type="item.approved ? 'success' : 'warning'" 
                  class="status-tag"
                >
                  {{ item.approved ? '已审批' : '未审批' }}
                </Tag>
              </div>
              <Checkbox 
                v-if="isMultiSelect" 
                v-model="item.selected" 
                @click.stop 
              />
            </div>
            
            <div class="report-content">
              <div class="report-info">
                <div class="info-row">
                  <span class="info-label">报工人员:</span>
                  <span class="info-value">{{ item.workerName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">产品名称:</span>
                  <span class="info-value">{{ item.productName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">工序名称:</span>
                  <span class="info-value">{{ item.processName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">报工数量:</span>
                  <span class="info-value">{{ item.quantity }} (良品: {{ item.goodQuantity }}, 不良品: {{ item.defectQuantity }})</span>
                </div>
                <div class="info-row">
                  <span class="info-label">报工时间:</span>
                  <span class="info-value">{{ formatDate(item.reportTime) }}</span>
                </div>
              </div>
              
              <!-- 添加功能按钮区 -->
              <div class="report-actions">
                <Button 
                  :type="item.approved ? 'warning' : 'primary'"
                  size="small"
                  @click.stop="handleApprove(item)"
                >
                  {{ item.approved ? '反审核' : '审核' }}
                </Button>
                <Button 
                  type="danger" 
                  size="small"
                  plain
                  @click.stop="handleDelete(item)"
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
        </List>
      </PullRefresh>
    </div>
    
    <!-- 多选操作栏 -->
    <div v-if="isMultiSelect" class="multi-select-bar">
      <div class="select-info">
        已选择 {{ selectedCount }} 项
      </div>
      <div class="select-actions">
        <Button 
          plain
          size="small" 
          @click="toggleSelectAll"
        >
          {{ isAllSelected ? '全不选' : '全选' }}
        </Button>
        <Button 
          type="danger" 
          size="small" 
          :disabled="selectedCount === 0"
          @click="deleteSelected"
        >
          删除
        </Button>
        <Button 
          type="primary" 
          size="small" 
          :disabled="selectedCount === 0 || !hasUnapprovedSelected"
          @click="approveSelected"
        >
          审批
        </Button>
        <Button 
          type="warning" 
          size="small" 
          :disabled="selectedCount === 0 || !hasApprovedSelected"
          @click="unapproveSelected"
        >
          反审批
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  NavBar, 
  Icon, 
  Tabs, 
  Tab, 
  List, 
  Tag, 
  Empty, 
  PullRefresh, 
  Popup,
  Field,
  Button,
  Checkbox,
  showToast,
  showDialog,
  Calendar,
  Radio,
  RadioGroup,
  Cell
} from 'vant';
import { formatDate as formatDateHelper } from '@/utils/date';
import type { WorkReportItem } from '@/api/types';

const router = useRouter();

// 统计数据
const stats = reactive({
  total: 120,
  good: 110,
  defect: 10,
  approved: 90,
  defectRate: '8.3',
  totalSalary: '¥12,500'
});

// 标签页计数
const tabCounts = reactive({
  all: 0,
  approved: 0,
  unapproved: 0
});

// 分类标签
const activeTab = ref('all');

// 多选模式
const isMultiSelect = ref(false);
const selectedCount = computed(() => reports.value.filter(item => item.selected).length);
const hasApprovedSelected = computed(() => reports.value.some(item => item.selected && item.approved));
const hasUnapprovedSelected = computed(() => reports.value.some(item => item.selected && !item.approved));

// 快速筛选
const quickFilter = ref<'all' | 'my' | 'today'>('all');
const tempQuickFilter = ref<'all' | 'my' | 'today'>('all'); // 临时存储选择的过滤器
const showQuickFilterPopup = ref(false);

// 排序功能
const showSortPopup = ref(false);
const sortField = ref<'createTime' | 'updateTime' | 'priority' | 'reportTime' | 'orderNumber' | 'productName' | 'quantity'>('createTime');
const sortOrder = ref<'asc' | 'desc'>('asc');

// 获取快速筛选的显示文本
const getQuickFilterText = () => {
  switch (quickFilter.value) {
    case 'all':
      return '全部报工';
    case 'my':
      return '我的报工';
    case 'today':
      return '今日报工';
    default:
      return '全部报工';
  }
};

// 打开快速筛选弹窗
const openQuickFilterPopup = () => {
  tempQuickFilter.value = quickFilter.value; // 初始化临时过滤器为当前选中的值
  showQuickFilterPopup.value = true;
};

// 设置临时快速筛选选项
const setQuickFilter = (filter: 'all' | 'my' | 'today') => {
  tempQuickFilter.value = filter;
  // 不再关闭弹窗和加载数据，只在点击确认按钮时执行
};

// 应用快速筛选
const applyQuickFilter = () => {
  quickFilter.value = tempQuickFilter.value; // 应用临时选择的过滤器
  showQuickFilterPopup.value = false;
  loadReports(); // 重新加载数据
};

// 设置排序字段
const setSortField = (field: 'createTime' | 'updateTime' | 'priority' | 'reportTime' | 'orderNumber' | 'productName' | 'quantity') => {
  sortField.value = field;
};

// 设置排序方向
const setSortOrder = (order: 'asc' | 'desc') => {
  sortOrder.value = order;
};

// 一次性设置排序字段和方向
const setSortConfig = (field: 'createTime' | 'updateTime' | 'priority' | 'reportTime' | 'orderNumber' | 'productName' | 'quantity', order: 'asc' | 'desc') => {
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
    case 'reportTime': fieldName = '报工时间'; break;
    case 'orderNumber': fieldName = '工单编号'; break;
    case 'productName': fieldName = '产品名称'; break;
    case 'quantity': fieldName = '报工数量'; break;
    default: fieldName = '创建时间';
  }
  
  showToast(`排序方式：${fieldName} ${sortOrder.value === 'asc' ? '升序' : '降序'}`);
  showSortPopup.value = false;
  
  // 重新加载数据
  loadReports();
};

// 筛选功能
const showFilter = ref(false);
const filter = reactive({
  worker: '',
  orderNumber: '',
  productName: '',
  processName: '',
  startDate: null as Date | null,
  endDate: null as Date | null
});

// 日期选择
const showDatePicker = ref(false);
const datePickerTitle = ref('选择时间范围');

// 列表数据
const originalReports = ref<WorkReportItem[]>([
  {
    id: '1',
    orderNumber: 'WO20231001',
    workerName: '张三',
    productName: '产品A',
    processName: '组装',
    quantity: 50,
    goodQuantity: 48,
    defectQuantity: 2,
    reportTime: '2023-10-15 09:30:00',
    approved: true,
    selected: false
  },
  {
    id: '2',
    orderNumber: 'WO20231002',
    workerName: '李四',
    productName: '产品B',
    processName: '测试',
    quantity: 30,
    goodQuantity: 30,
    defectQuantity: 0,
    reportTime: '2023-10-15 10:15:00',
    approved: true,
    selected: false
  },
  {
    id: '3',
    orderNumber: 'WO20231003',
    workerName: '王五',
    productName: '产品C',
    processName: '包装',
    quantity: 40,
    goodQuantity: 38,
    defectQuantity: 2,
    reportTime: '2023-10-15 14:20:00',
    approved: false,
    selected: false
  }
]);
const reports = ref<WorkReportItem[]>([]);

// 列表加载状态
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

// 初始化
onMounted(() => {
  loadReports();
  updateTabCounts();
});

// 监听标签切换
watch(activeTab, (newValue) => {
  console.log('标签切换为:', newValue);
  // 根据标签筛选数据
  loadReports();
});

// 方法: 加载报工列表
const loadReports = () => {
  // 设置加载状态
  loading.value = true;
  
  // 实际应用中应该调用API，根据activeTab和filter条件筛选数据
  setTimeout(() => {
    // 首先应用快速筛选
    let filtered = [...originalReports.value];
    
    if (quickFilter.value === 'my') {
      // 筛选当前用户的报工（示例使用'张三'作为当前用户）
      filtered = filtered.filter(item => item.workerName === '张三');
    } else if (quickFilter.value === 'today') {
      // 筛选今日报工
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(item => item.reportTime.startsWith(today));
    }
    
    // 然后应用标签筛选
    if (activeTab.value === 'all') {
      // 不做筛选，显示所有数据
      reports.value = [...filtered];
    } else if (activeTab.value === 'approved') {
      // 筛选已审批的数据
      reports.value = filtered.filter(item => item.approved);
    } else if (activeTab.value === 'unapproved') {
      // 筛选未审批的数据
      reports.value = filtered.filter(item => !item.approved);
    }
    
    // 应用排序
    reports.value.sort((a, b) => {
      let result = 0;
      
      switch (sortField.value) {
        case 'createTime':
          // 假设reportTime也可以作为创建时间
          result = new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime();
          break;
        case 'updateTime':
          // 假设reportTime也可以作为更新时间
          result = new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime();
          break;
        case 'priority':
          // 优先级排序（报工没有优先级字段，所以按是否审核排序）
          const aPriority = a.approved ? 1 : 0;
          const bPriority = b.approved ? 1 : 0;
          result = bPriority - aPriority;
          break;
        case 'reportTime':
          result = new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime();
          break;
        case 'orderNumber':
          result = a.orderNumber.localeCompare(b.orderNumber);
          break;
        case 'productName':
          result = a.productName.localeCompare(b.productName);
          break;
        case 'quantity':
          result = b.quantity - a.quantity;
          break;
        default:
          // 默认按报工时间排序
          result = new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime();
          break;
      }
      
      // 根据排序方向调整结果
      return sortOrder.value === 'asc' ? -result : result;
    });
    
    // 模拟加载完成
    loading.value = false;
    if (refreshing.value) refreshing.value = false;
    // 示例状态切换
    finished.value = true;
    
    // 更新统计数据
    updateStats();
    // 更新标签页计数
    updateTabCounts();
  }, 1000);
};

// 更新标签页计数
const updateTabCounts = () => {
  // 根据快速筛选条件过滤数据
  let filtered = [...originalReports.value];
  
  if (quickFilter.value === 'my') {
    filtered = filtered.filter(item => item.workerName === '张三');
  } else if (quickFilter.value === 'today') {
    const today = new Date().toISOString().split('T')[0];
    filtered = filtered.filter(item => item.reportTime.startsWith(today));
  }
  
  // 计算各标签的数量
  tabCounts.all = filtered.length;
  tabCounts.approved = filtered.filter(item => item.approved).length;
  tabCounts.unapproved = filtered.filter(item => !item.approved).length;
};

// 更新统计数据
const updateStats = () => {
  const total = reports.value.length;
  const approved = reports.value.filter(item => item.approved).length;
  const goodQuantity = reports.value.reduce((sum, item) => sum + item.goodQuantity, 0);
  const defectQuantity = reports.value.reduce((sum, item) => sum + item.defectQuantity, 0);
  const totalQuantity = goodQuantity + defectQuantity;
  
  stats.total = total;
  stats.approved = approved;
  stats.good = goodQuantity;
  stats.defect = defectQuantity;
  stats.defectRate = totalQuantity > 0 ? ((defectQuantity / totalQuantity) * 100).toFixed(1) : '0.0';
  // 工资计算逻辑可以根据实际需求调整
  stats.totalSalary = `¥${(goodQuantity * 0.5).toFixed(2)}`;
};

// 方法: 下拉刷新
const onRefresh = () => {
  // 重置列表状态
  finished.value = false;
  // 重新加载数据
  loadReports();
};

// 方法: 加载更多
const onLoad = () => {
  // 实际应用中应该加载下一页数据
  loadReports();
};

// 方法: 查看报工详情
const viewReportDetail = (item: WorkReportItem) => {
  if (isMultiSelect.value) {
    // 多选模式下点击切换选中状态
    item.selected = !item.selected;
    return;
  }
  
  // 普通模式下跳转到详情
  router.push({ 
    path: '/report-detail', 
    query: { id: item.id } 
  });
};

// 方法: 切换多选模式
const toggleMultiSelect = () => {
  isMultiSelect.value = !isMultiSelect.value;
  // 退出多选模式时，清除所有选择
  if (!isMultiSelect.value) {
    reports.value.forEach(item => {
      item.selected = false;
    });
  }
};

// 方法: 切换筛选面板
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 方法: 重置筛选条件
const resetFilter = () => {
  Object.assign(filter, {
    worker: '',
    orderNumber: '',
    productName: '',
    processName: '',
    startDate: null,
    endDate: null
  });
  datePickerTitle.value = '选择时间范围';
  showToast('筛选条件已重置');
};

// 方法: 应用筛选条件
const applyFilter = () => {
  showFilter.value = false;
  // 实际应用中应该根据筛选条件重新加载数据
  showToast('筛选条件已应用');
  // 重置列表
  finished.value = false;
  loadReports();
};

// 方法: 打开日期选择器
const openDatePicker = () => {
  showDatePicker.value = true;
};

// 方法: 日历确认
const onCalendarConfirm = (value: [Date, Date]) => {
  filter.startDate = value[0];
  filter.endDate = value[1];
};

// 方法: 格式化日期
const formatDate = (dateStr: string) => {
  return formatDateHelper(new Date(dateStr), 'yyyy-MM-dd HH:mm');
};

// 方法: 格式化日期范围
const formatDateRange = (start: Date | null, end: Date | null) => {
  if (!start && !end) return '';
  if (!start && end) return `至 ${formatDateHelper(end, 'yyyy-MM-dd')}`;
  if (start && !end) return `${formatDateHelper(start, 'yyyy-MM-dd')} 起`;
  if (start && end) return `${formatDateHelper(start, 'yyyy-MM-dd')} 至 ${formatDateHelper(end, 'yyyy-MM-dd')}`;
  return '';
};

// 方法: 处理状态变化
const handleStatusChange = (value: string) => {
  showToast({
    message: `工序状态已切换为：${value}`,
    position: 'bottom',
  });
};

// 方法: 处理不良品输入
const handleDefectInput = (item: WorkReportItem) => {
  // ... existing code ...
};

// 方法: 删除选中项
const deleteSelected = () => {
  showDialog({
    title: '确认删除',
    message: `确定要删除选中的 ${selectedCount.value} 项记录吗？`,
    showCancelButton: true,
  }).then(() => {
    // 获取选中项的ID
    const selectedIds = reports.value
      .filter(item => item.selected)
      .map(item => item.id);
    
    // 从原始数据中删除
    originalReports.value = originalReports.value.filter(
      item => !selectedIds.includes(item.id)
    );
    
    // 从当前显示数据中删除
    reports.value = reports.value.filter(item => !item.selected);
    
    showToast('删除成功');
    isMultiSelect.value = false;
    
    // 更新统计数据
    updateStats();
    // 更新标签页计数
    updateTabCounts();
  });
};

// 方法: 审批选中项
const approveSelected = () => {
  showDialog({
    title: '确认审批',
    message: `确定要审批选中的 ${selectedCount.value} 项记录吗？`,
    showCancelButton: true,
  }).then(() => {
    // 获取选中项的ID
    const selectedIds = reports.value
      .filter(item => item.selected)
      .map(item => item.id);
    
    // 更新原始数据
    originalReports.value.forEach(item => {
      if (selectedIds.includes(item.id)) {
        item.approved = true;
      }
    });
    
    // 更新当前显示数据
    reports.value.forEach(item => {
      if (item.selected) {
        item.approved = true;
        item.selected = false;
      }
    });
    
    showToast('审批成功');
    isMultiSelect.value = false;
    
    // 如果当前是在"未审批"标签，则需要重新加载数据
    if (activeTab.value === 'unapproved') {
      loadReports();
    }
  });
};

// 方法: 反审批选中项
const unapproveSelected = () => {
  showDialog({
    title: '确认反审批',
    message: `确定要反审批选中的 ${selectedCount.value} 条报工记录吗？`,
    showCancelButton: true
  }).then(() => {
    // 在实际应用中，应该调用API进行反审批操作
    // 这里仅作示例，直接修改本地数据
    const selectedIds = reports.value
      .filter(item => item.selected && item.approved)
      .map(item => item.id);
    
    if (selectedIds.length === 0) {
      showToast('没有可反审批的记录');
      return;
    }
    
    // 更新本地数据
    reports.value.forEach(item => {
      if (selectedIds.includes(item.id)) {
        item.approved = false;
      }
    });
    
    // 同时更新原始数据
    originalReports.value.forEach(item => {
      if (selectedIds.includes(item.id)) {
        item.approved = false;
      }
    });
    
    showToast('反审批成功');
    
    // 如果当前在已审批标签页，则需要重新加载数据
    if (activeTab.value === 'approved') {
      loadReports();
    } else {
      // 更新统计数据和标签页计数
      updateStats();
      updateTabCounts();
    }
  }).catch(() => {
    // 用户取消操作
  });
};

// 方法: 跳转到报工创建页面
const goToReportCreate = () => {
  router.push('/work-report');
};

// 方法: 切换全选/全不选
const toggleSelectAll = () => {
  const newState = !isAllSelected.value;
  // 根据newState设置所有项的选中状态
  reports.value.forEach(item => {
    item.selected = newState;
  });
};

// 方法: 判断是否全选
const isAllSelected = computed(() => {
  if (reports.value.length === 0) return false;
  return reports.value.every(item => item.selected);
});

// 方法: 处理审批
const handleApprove = (item: WorkReportItem) => {
  const action = item.approved ? '反审核' : '审核';
  showDialog({
    title: `确认${action}`,
    message: `确定要${action}该条报工记录吗？`,
    showCancelButton: true,
  }).then(() => {
    // 在实际应用中，这里应该调用API
    item.approved = !item.approved;
    
    // 更新统计数据
    updateStats();
    // 更新标签页计数
    updateTabCounts();
    
    showToast(`${action}成功`);
    
    // 如果当前在已审批/未审批标签页，则需要重新加载数据
    if (activeTab.value !== 'all') {
      loadReports();
    }
  }).catch(() => {
    // 用户取消操作
  });
};

// 方法: 处理删除
const handleDelete = (item: WorkReportItem) => {
  showDialog({
    title: '确认删除',
    message: '确定要删除该条报工记录吗？',
    showCancelButton: true,
  }).then(() => {
    // 在实际应用中，这里应该调用API
    const index = reports.value.findIndex(report => report.id === item.id);
    if (index > -1) {
      reports.value.splice(index, 1);
      
      // 同时从原始数据中删除
      const originalIndex = originalReports.value.findIndex(report => report.id === item.id);
      if (originalIndex > -1) {
        originalReports.value.splice(originalIndex, 1);
      }
    }
    
    showToast('删除成功');
    
    // 更新统计数据
    updateStats();
    // 更新标签页计数
    updateTabCounts();
  }).catch(() => {
    // 用户取消操作
  });
};
</script>

<style scoped lang="less">
.report-list {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom);
}

// 控件区域
.control-area {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 8px 12px;
  background-color: #fff;
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
  
  &.active {
    color: #1989fa;
  }
}

// 统计卡片
.stats-container {
  position: sticky;
  top: 46px;
  z-index: 2;
  padding: 12px;
  background-color: #f5f5f5;
}

.stats-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.stats-item {
  flex: 1;
  text-align: center;
}

.stats-value {
  font-size: 18px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 12px;
  color: #969799;
}

// 筛选标签
.tabs-container {
  position: sticky;
  top: calc(46px + 120px); // 调整这个值以适应统计卡片的高度
  z-index: 2;
  background-color: #fff;
}

// 弹出框样式
.popup-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  border-bottom: 1px solid #f2f2f2;
}

.filter-options, .sort-options {
  padding: 8px 0;
}

.popup-actions {
  padding: 16px;
}

// 列表容器
.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 120px; // 增加底部padding以适应多选操作栏和底部导航栏
  -webkit-overflow-scrolling: touch;
}

// 报工卡片
.report-card {
  background-color: #fff;
  border-radius: 8px;
  margin-top: 12px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f2f2f2;
}

.report-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  
  .status-tag {
    margin-left: 8px;
  }
}

.report-content {
  margin-top: 8px;
}

.report-info {
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

.filter-actions {
  margin-top: 24px;
}

// 多选操作栏
.multi-select-bar {
  position: fixed; // 改为固定定位
  bottom: 50px; // 调整位置以适应扫码按钮
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  z-index: 101; // 确保在扫码按钮之上
}

.select-info {
  font-size: 14px;
  color: #646566;
}

.select-actions {
  display: flex;
  gap: 8px;
}

// 空状态
.empty-list {
  padding: 40px 0;
}

// 排序弹出框样式
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
  font-weight: 500;
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

.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f2f2f2;
}
</style> 