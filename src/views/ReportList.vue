<template>
  <div class="report-list">
    <NavBar 
      title="报工列表" 
      fixed 
      right-text=" "
    >
      <template #right>
        <div class="action-buttons">
          <Icon 
            name="checked" 
            size="20" 
            :class="['action-icon', { active: isMultiSelect }]" 
            @click="toggleMultiSelect" 
          />
          <Icon 
            name="filter-o" 
            size="20" 
            :class="['action-icon', { active: showFilter }]" 
            @click="toggleFilter" 
          />
          <Icon 
            name="plus" 
            size="20" 
            class="action-icon" 
            @click="goToReportCreate" 
          />
        </div>
      </template>
    </NavBar>
    
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
        <Tab title="全部" name="all" />
        <Tab title="已审批" name="approved" />
        <Tab title="未审批" name="unapproved" />
      </Tabs>
    </div>
    
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
      <DatePicker
        v-model="currentDate"
        :title="datePickerTitle"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date()"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
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
          :disabled="selectedCount === 0"
          @click="approveSelected"
        >
          审批
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
  DatePicker
} from 'vant';
import { formatDate as formatDateHelper } from '@/utils/date';

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

// 分类标签
const activeTab = ref('all');

// 多选模式
const isMultiSelect = ref(false);
const selectedCount = computed(() => reports.value.filter(item => item.selected).length);

// 筛选功能
const showFilter = ref(false);
const filter = reactive({
  worker: '',
  orderNumber: '',
  productName: '',
  processName: '',
  startDate: null,
  endDate: null,
  dateType: 'start' // 'start': 开始时间, 'end': 结束时间
});

// 日期选择
const showDatePicker = ref(false);
const currentDate = ref(new Date());
const datePickerTitle = ref('选择开始日期');

// 列表数据
const originalReports = ref([
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
const reports = ref([]);

// 列表加载状态
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

// 初始化
onMounted(() => {
  loadReports();
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
    // 模拟根据标签筛选数据
    if (activeTab.value === 'all') {
      // 不做筛选，显示所有数据
      reports.value = [...originalReports.value];
    } else if (activeTab.value === 'approved') {
      // 筛选已审批的数据
      reports.value = originalReports.value.filter(item => item.approved);
    } else if (activeTab.value === 'unapproved') {
      // 筛选未审批的数据
      reports.value = originalReports.value.filter(item => !item.approved);
    }
    
    // 模拟加载完成
    loading.value = false;
    if (refreshing.value) refreshing.value = false;
    // 示例状态切换
    finished.value = true;
    
    // 更新统计数据
    updateStats();
  }, 1000);
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
const viewReportDetail = (item) => {
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
    endDate: null,
    dateType: 'start'
  });
  datePickerTitle.value = '选择开始日期';
  currentDate.value = new Date();
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

// 方法: 日期确认
const onDateConfirm = (value) => {
  if (filter.dateType === 'start') {
    filter.startDate = value;
    filter.dateType = 'end';
    datePickerTitle.value = '选择结束日期';
    currentDate.value = filter.endDate || new Date();
    // 如果选择的是开始日期，保持日期选择器打开，切换到选择结束日期
  } else {
    // 选择了结束日期，关闭选择器
    filter.endDate = value;
    showDatePicker.value = false;
    filter.dateType = 'start';
    datePickerTitle.value = '选择开始日期';
  }
};

// 方法: 打开日期选择器
const openDatePicker = () => {
  filter.dateType = 'start';
  datePickerTitle.value = '选择开始日期';
  currentDate.value = filter.startDate || new Date();
  showDatePicker.value = true;
};

// 方法: 格式化日期
const formatDate = (dateStr) => {
  return formatDateHelper(new Date(dateStr), 'yyyy-MM-dd HH:mm');
};

// 方法: 格式化日期范围
const formatDateRange = (start, end) => {
  if (!start && !end) return '';
  if (!start) return `至 ${formatDateHelper(end, 'yyyy-MM-dd')}`;
  if (!end) return `${formatDateHelper(start, 'yyyy-MM-dd')} 起`;
  return `${formatDateHelper(start, 'yyyy-MM-dd')} 至 ${formatDateHelper(end, 'yyyy-MM-dd')}`;
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
    
    // 更新统计数据
    updateStats();
    
    // 如果当前是在"未审批"标签，则需要重新加载数据
    if (activeTab.value === 'unapproved') {
      loadReports();
    }
  });
};

// 方法: 跳转到报工创建页面
const goToReportCreate = () => {
  router.push('/work-report');
};
</script>

<style scoped lang="less">
.report-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom);
}

// 右上角按钮
.action-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  color: #323233;
  
  &.active {
    color: #1989fa;
  }
}

// 统计卡片
.stats-container {
  margin-top: 46px;
  padding: 12px;
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
  background-color: #fff;
  position: sticky;
  top: 46px;
  z-index: 1;
}

// 列表容器
.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
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
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  z-index: 2;
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
</style> 