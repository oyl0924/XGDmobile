<template>
  <div class="work-report">
    <NavBar
      title="提交报工"
      left-text="返回"
      right-text="提交"
      @click-left="goBack"
      @click-right="submitReport"
    />
    
    <div class="page-container">
      <!-- 选择栏 -->
      <div class="section-title">选择信息</div>
      <div class="select-section">
        <List>
          <Cell
            clickable
            @click="showWorkOrderSelector = true"
          >
            <template #title>
              <div class="label-content">
                <div class="label-left">
                  <span class="required-field">工单号</span>
                </div>
                <div class="label-right">
                  <span v-if="selectedWorkOrder">{{ selectedWorkOrder.orderNumber }}</span>
                  <span v-else class="placeholder">点击选择工单</span>
                  <Icon v-if="selectedWorkOrder" name="clear" class="clear-icon" @click.stop="clearWorkOrder" />
                </div>
              </div>
            </template>
          </Cell>
          
          <Cell
            clickable
            @click="showWorkerSelector = true"
          >
            <template #title>
              <div class="label-content">
                <div class="label-left">
                  <span class="required-field">生产人员</span>
                </div>
                <div class="label-right">
                  <span v-if="selectedWorker">{{ selectedWorker.name }} ({{ selectedWorker.workNumber }})</span>
                  <span v-else class="placeholder">点击选择生产人员</span>
                  <Icon v-if="selectedWorker" name="clear" class="clear-icon" @click.stop="clearWorker" />
                </div>
              </div>
            </template>
          </Cell>
          
          <Cell
            clickable
            @click="handleSelectProcess"
          >
            <template #title>
              <div class="label-content">
                <div class="label-left">
                  <span class="required-field">工序名称</span>
                </div>
                <div class="label-right">
                  <span v-if="selectedProcess">{{ selectedProcess.name }}</span>
                  <span v-else class="placeholder">点击选择工序</span>
                  <Icon v-if="selectedProcess" name="clear" class="clear-icon" @click.stop="clearProcess" />
                </div>
              </div>
            </template>
          </Cell>
        </List>
      </div>
      
      <!-- 报工提交信息 -->
      <template v-if="selectedProcess">
        <div class="section-title">报工提交信息</div>
        <List>
          <Cell title="任务数量（计划数/完成数）">
            {{ selectedProcess.planQuantity }} / {{ selectedProcess.completedQuantity }}
          </Cell>
          
          <Cell title="工序状态" :title-style="{ flex: '0 0 60px' }">
            <div class="process-status">
              <RadioGroup v-model="processStatus" direction="horizontal" @change="handleStatusChange">
                <Radio name="未开始" class="status-radio">未开始</Radio>
                <Radio name="执行中" class="status-radio">执行中</Radio>
                <Radio name="已结束" class="status-radio">已结束</Radio>
              </RadioGroup>
            </div>
          </Cell>
          
          <Cell title="报工数量">
            {{ Number(goodQuantity || 0) + Number(defectQuantity || 0) }}
          </Cell>
          
          <Cell title="良品数">
            <input
              v-model="goodQuantity"
              type="number"
              class="input-field"
              placeholder="请输入"
              :disabled="!selectedProcess"
              @input="updateReportQuantity"
            />
          </Cell>
          
          <Cell title="不良品数">
            <button class="defect-button" @click="handleDefectInput">
              {{ hasDefects ? '已选择' + totalDefectQuantity + '件' : '请选择' }}
            </button>
          </Cell>
          
          <Cell title="不良品原因">
            <div v-if="hasDefects" class="defect-tags">
              <span 
                v-for="item in defectReasons" 
                :key="item.id" 
                v-show="item.quantity > 0"
                :class="['defect-tag', getDefectTagClass(item.code)]"
              >
                {{ item.name }}: {{ item.quantity }}
              </span>
            </div>
            <span v-else>无</span>
          </Cell>
        </List>
      </template>
      
      <!-- 工单信息 -->
      <template v-if="selectedWorkOrder">
        <div class="section-title">工单信息</div>
        <List>
          <Cell title="工单数量" :value="selectedWorkOrder.quantity" />
          
          <Cell title="工单状态">
            <Tag :type="getStatusType(selectedWorkOrder.status)">{{ selectedWorkOrder.status }}</Tag>
          </Cell>
          
          <Cell title="工单开始时间" :value="selectedWorkOrder.startTime" />
          
          <Cell title="工单结束时间" :value="selectedWorkOrder.endTime" />
          
          <Cell title="是否加急">
            <Tag v-if="selectedWorkOrder.isUrgent" type="danger">加急</Tag>
            <span v-else>否</span>
          </Cell>
          
          <Cell title="备注" :value="selectedWorkOrder.remark || '无'" />
        </List>
        
        <!-- 工单自定义字段 -->
        <div class="section-title">工单自定义</div>
        <List>
          <Cell title="工单文本自定义" :value="selectedWorkOrder.customText || '无'" />
          
          <Cell title="工单数字自定义" :value="selectedWorkOrder.customNumber || '无'" />
          
          <Cell title="工单日期自定义" :value="selectedWorkOrder.customDate || '无'" />
          
          <Cell title="工单图片自定义">
            <Image
              v-if="selectedWorkOrder.customImage"
              :src="selectedWorkOrder.customImage"
              width="80"
              height="80"
              fit="cover"
            />
            <span v-else>无</span>
          </Cell>
        </List>
        
        <!-- 产品信息 -->
        <div class="section-title">产品信息</div>
        <List>
          <Cell title="产品编号" :value="selectedWorkOrder.product.productNumber" />
          
          <Cell title="产品名称" :value="selectedWorkOrder.product.productName" />
          
          <Cell title="规格" :value="selectedWorkOrder.product.specification" />
          
          <Cell title="型号" :value="selectedWorkOrder.product.model" />
          
          <Cell title="单位" :value="selectedWorkOrder.product.unit" />
          
          <Cell title="产品备注" :value="selectedWorkOrder.product.remark || '无'" />
        </List>
        
        <!-- 产品自定义字段 -->
        <div class="section-title">产品自定义</div>
        <List>
          <Cell title="产品文本自定义" :value="selectedWorkOrder.product.customText || '无'" />
          
          <Cell title="产品数字自定义" :value="selectedWorkOrder.product.customNumber || '无'" />
          
          <Cell title="产品日期自定义" :value="selectedWorkOrder.product.customDate || '无'" />
          
          <Cell title="产品图片自定义">
            <Image
              v-if="selectedWorkOrder.product.customImage"
              :src="selectedWorkOrder.product.customImage"
              width="80"
              height="80"
              fit="cover"
            />
            <span v-else>无</span>
          </Cell>
        </List>
      </template>
    </div>
    
    <!-- 工单选择弹窗 -->
    <work-order-selector 
      v-model:visible="showWorkOrderSelector"
      @select="selectWorkOrder"
    />
    
    <!-- 工序选择弹窗 -->
    <process-selector 
      v-model:visible="showProcessSelector"
      :work-order-id="selectedWorkOrder?.id"
      @select="selectProcess"
    />
    
    <!-- 人员选择弹窗 -->
    <worker-selector 
      v-model:visible="showWorkerSelector"
      @select="selectWorker"
    />
    
    <!-- 不良品原因选择弹窗 -->
    <Popup v-model:show="showDefectReasonSelector" position="bottom" round>
      <div class="defect-list">
        <div v-for="item in defectReasons" :key="item.id" class="defect-item">
          <span class="defect-name">{{ item.name }}</span>
          <Stepper 
            v-model="item.quantity" 
            :min="0"
            @change="updateDefectQuantity"
          />
        </div>
        <div style="margin-top: 16px; text-align: center;">
          <van-button type="primary" block @click="confirmDefect">确定</van-button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, NavBar, List, Cell, Tag, Image, Radio, RadioGroup, Icon, Popup, Stepper } from 'vant';
import type { WorkOrder, Process, Worker, DefectReason } from '@/api/types';
import WorkOrderSelector from '@/components/WorkOrderSelector.vue';
import ProcessSelector from '@/components/ProcessSelector.vue';
import WorkerSelector from '@/components/WorkerSelector.vue';

const router = useRouter();

// 选择项状态
const selectedWorkOrder = ref<WorkOrder | null>(null);
const selectedProcess = ref<Process | null>(null);
const selectedWorker = ref<Worker | null>(null);
const selectedDefectReason = ref<DefectReason | null>(null);
const processStatus = ref<string>('未开始');

// 弹窗显示状态
const showWorkOrderSelector = ref(false);
const showProcessSelector = ref(false);
const showWorkerSelector = ref(false);
const showDefectReasonSelector = ref(false);

// 报工数据
const goodQuantity = ref<number | null>(null);
const defectQuantity = ref<number | null>(null);

// 不良品相关状态
const defectReasons = ref<(DefectReason & { quantity: number })[]>([]);
const hasDefects = computed(() => defectReasons.value.some(item => item.quantity > 0));
const totalDefectQuantity = computed(() => 
  defectReasons.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
);

// 根据状态获取标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '未开始':
      return 'default';
    case '执行中':
      return 'primary';
    case '已结束':
      return 'success';
    default:
      return 'default';
  }
};

// 获取不良品标签样式类
const getDefectTagClass = (code: string) => {
  switch (code.toLowerCase()) {
    case 'size':
      return 'size';
    case 'surface':
      return 'surface';
    case 'assembly':
      return 'assembly';
    default:
      return 'other';
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 选择工单
const selectWorkOrder = (order: WorkOrder) => {
  selectedWorkOrder.value = order;
  // 重置工序
  selectedProcess.value = null;
};

// 选择工序
const selectProcess = (process: Process) => {
  selectedProcess.value = process;
  // 重置报工数据
  goodQuantity.value = null;
  defectQuantity.value = null;
  selectedDefectReason.value = null;
};

// 选择人员
const selectWorker = (worker: Worker) => {
  selectedWorker.value = worker;
};

// 选择不良品原因
const selectDefectReason = (reason: DefectReason) => {
  selectedDefectReason.value = reason;
};

// 点击选择工序
const handleSelectProcess = () => {
  if (!selectedWorkOrder.value) {
    showToast({
      message: '请先选择工单',
      position: 'bottom',
    });
    return;
  }
  showProcessSelector.value = true;
};

// 处理不良品输入
const handleDefectInput = () => {
  if (!selectedProcess.value) {
    showToast({
      message: '请先选择工序',
      position: 'bottom',
    });
    return;
  }
  
  // 初始化不良品原因列表
  if (defectReasons.value.length === 0) {
    // 这里应该从API获取不良品原因列表
    defectReasons.value = [
      { id: '1', name: '尺寸偏差', code: 'SIZE', quantity: 0 },
      { id: '2', name: '表面缺陷', code: 'SURFACE', quantity: 0 },
      { id: '3', name: '装配错误', code: 'ASSEMBLY', quantity: 0 },
      { id: '4', name: '其他', code: 'OTHER', quantity: 0 },
    ];
  }
  
  showDefectReasonSelector.value = true;
};

// 更新报工数量
const updateReportQuantity = () => {
  // 确保至少一项有输入
  if ((goodQuantity.value || 0) + (defectQuantity.value || 0) === 0) {
    showToast({
      message: '良品数和不良品数至少填写一项',
      position: 'bottom',
    });
  }
  
  // 如果不良品数量为0，清空不良品原因
  if (!defectQuantity.value || defectQuantity.value === 0) {
    selectedDefectReason.value = null;
  }
  
  // 如果不良品数量大于0，提示选择不良品原因
  if (defectQuantity.value && defectQuantity.value > 0 && !selectedDefectReason.value) {
    showDefectReasonSelector.value = true;
  }
};

// 更新不良品数量
const updateDefectQuantity = () => {
  defectQuantity.value = totalDefectQuantity.value;
};

// 确认不良品选择
const confirmDefect = () => {
  updateDefectQuantity();
  showDefectReasonSelector.value = false;
};

// 提交报工
const submitReport = () => {
  // 验证必填项
  if (!selectedWorkOrder.value) {
    showToast({
      message: '请选择工单',
      position: 'bottom',
    });
    return;
  }
  
  if (!selectedWorker.value) {
    showToast({
      message: '请选择生产人员',
      position: 'bottom',
    });
    return;
  }
  
  if (!selectedProcess.value) {
    showToast({
      message: '请选择工序',
      position: 'bottom',
    });
    return;
  }
  
  const totalQuantity = (goodQuantity.value || 0) + (defectQuantity.value || 0);
  if (totalQuantity <= 0) {
    showToast({
      message: '良品数和不良品数至少填写一项',
      position: 'bottom',
    });
    return;
  }
  
  if (defectQuantity.value && defectQuantity.value > 0 && !selectedDefectReason.value) {
    showToast({
      message: '请选择不良品原因',
      position: 'bottom',
    });
    return;
  }
  
  // 构建提交数据
  const submitData = {
    workOrderId: selectedWorkOrder.value!.id,
    processId: selectedProcess.value!.id,
    workerId: selectedWorker.value!.id,
    goodQuantity: goodQuantity.value || 0,
    defectQuantity: defectQuantity.value || 0,
    defectDetails: defectReasons.value
      .filter(item => item.quantity > 0)
      .map(item => ({
        reasonId: item.id,
        quantity: item.quantity
      })),
    reportTime: new Date().toISOString()
  };
  
  // 模拟提交
  console.log('提交数据:', submitData);
  
  showToast({
    type: 'success',
    message: '报工提交成功',
    position: 'bottom',
  });
  
  // 只重置工序相关数据
  selectedProcess.value = null;
  goodQuantity.value = null;
  defectQuantity.value = null;
  defectReasons.value.forEach(item => item.quantity = 0);
};

// 清除选择
const clearWorkOrder = () => {
  selectedWorkOrder.value = null;
  // 清除工序相关数据
  selectedProcess.value = null;
  goodQuantity.value = null;
  defectQuantity.value = null;
  selectedDefectReason.value = null;
};

const clearWorker = () => {
  selectedWorker.value = null;
};

const clearProcess = () => {
  selectedProcess.value = null;
  // 清除报工数据
  goodQuantity.value = null;
  defectQuantity.value = null;
  selectedDefectReason.value = null;
};

// 在 script setup 部分添加处理函数
const handleStatusChange = (value: string) => {
  showToast({
    message: `工序状态已切换为：${value}`,
    position: 'bottom',
  });
};
</script>

<style scoped lang="less">
.work-report {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 20px;
  -webkit-overflow-scrolling: touch;
}

.required-field::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}

.placeholder {
  color: #bbb;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 16px 0 8px;
  padding-left: 8px;
  border-left: 3px solid #1677ff;
}

.label-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .label-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .label-right {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
}

.clear-icon {
  color: #999;
  font-size: 16px;
  padding: 4px;
}

.input-field {
  width: 120px;
  height: 32px;
  padding: 0 8px;
  text-align: right;
  border: none;
  outline: none;
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.process-status {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  
  :deep(.van-radio-group) {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  }
}

.status-radio {
  flex: 1;
  min-width: 0;
  
  :deep(.van-radio__label) {
    color: inherit;
    font-size: 13px;
  }
  
  :deep(.van-radio) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }
}

.defect-button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  
  &:active {
    background: #f5f5f5;
  }
}

.defect-list {
  padding: 16px;
  
  .defect-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .defect-name {
      flex: 1;
    }
  }
}

.defect-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .defect-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    
    &.size {
      background-color: #e6f4ff;
      color: #1677ff;
    }
    
    &.surface {
      background-color: #fff7e6;
      color: #fa8c16;
    }
    
    &.assembly {
      background-color: #f6ffed;
      color: #52c41a;
    }
    
    &.other {
      background-color: #f5f5f5;
      color: #666;
    }
  }
}
</style> 