<template>
  <Popup
    :show="visible"
    position="bottom"
    :style="{ height: '70vh' }"
    @close="onClose"
  >
    <div class="popup-title">选择工序</div>
    <div class="selector-container">
      <div v-if="!workOrderId" class="no-data">
        请先选择工单
      </div>
      <template v-else>
        <SearchBar
          v-model="searchValue"
          placeholder="搜索工序名称"
          @search="onSearch"
        />
        <div v-if="loading" class="loading-container">
          <Loading type="spinner" />
        </div>
        <div v-else-if="processes.length === 0" class="no-data">
          当前工单没有工序数据
        </div>
        <div v-else class="process-list">
          <List>
            <Cell
              v-for="item in filteredProcesses"
              :key="item.id"
              clickable
              @click="selectProcess(item)"
            >
              <div class="process-item">
                <div class="process-name">{{ item.name }}</div>
                <div class="process-quantity">
                  计划数量: {{ item.planQuantity }} / 已完成: {{ item.completedQuantity }}
                </div>
                <div class="process-status">
                  <Tag :type="getStatusType(item.status)">{{ item.status }}</Tag>
                </div>
              </div>
            </Cell>
          </List>
        </div>
      </template>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Popup, Search as SearchBar, List, Cell, Tag, Loading } from 'vant';
import type { Process } from '@/api/types';
import { getProcessesByWorkOrderId } from '@/api';

const props = defineProps<{
  visible: boolean;
  workOrderId?: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'select', process: Process): void;
}>();

const searchValue = ref('');
const processes = ref<Process[]>([]);
const loading = ref(false);

// 计算过滤后的工序列表
const filteredProcesses = computed(() => {
  if (!searchValue.value) {
    return processes.value;
  }
  const keyword = searchValue.value.toLowerCase();
  return processes.value.filter(
    item => item.name.toLowerCase().includes(keyword)
  );
});

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

// 关闭弹窗
const onClose = () => {
  emit('update:visible', false);
};

// 搜索方法
const onSearch = () => {
  // 客户端搜索，无需额外操作
};

// 加载工序数据
const loadProcesses = async () => {
  if (!props.workOrderId) {
    processes.value = [];
    return;
  }
  
  loading.value = true;
  try {
    processes.value = await getProcessesByWorkOrderId(props.workOrderId);
  } catch (error) {
    console.error('加载工序失败:', error);
  } finally {
    loading.value = false;
  }
};

// 选择工序
const selectProcess = (process: Process) => {
  emit('select', process);
  emit('update:visible', false);
};

// 监听工单ID变化
watch(
  () => props.workOrderId,
  (newVal) => {
    if (newVal) {
      loadProcesses();
    } else {
      processes.value = [];
    }
  }
);

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.workOrderId) {
      loadProcesses();
    }
  }
);
</script>

<style scoped lang="less">
.popup-title {
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.selector-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px);
  padding: 12px;
  
  .process-list {
    flex: 1;
    overflow-y: auto;
    margin-top: 16px;
  }
  
  .process-item {
    width: 100%;
    
    .process-name {
      font-weight: bold;
      font-size: 16px;
    }
    
    .process-quantity {
      color: #666;
      margin: 4px 0;
      font-size: 14px;
    }
    
    .process-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #999;
  }
  
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }
}
</style> 