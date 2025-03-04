<template>
  <Popup
    :show="visible"
    position="bottom"
    :style="{ height: '70vh' }"
    @close="onClose"
  >
    <div class="popup-title">选择生产人员</div>
    <div class="selector-container">
      <SearchBar
        v-model="searchValue"
        placeholder="搜索姓名或工号"
        @search="onSearch"
      />
      <div v-if="loading" class="loading-container">
        <Loading type="spinner" />
      </div>
      <div v-else-if="workers.length === 0" class="no-data">
        暂无生产人员数据
      </div>
      <div v-else class="worker-list">
        <List>
          <Cell
            v-for="item in filteredWorkers"
            :key="item.id"
            clickable
            @click="selectWorker(item)"
          >
            <div class="worker-item">
              <div class="worker-name">{{ item.name }}</div>
              <div class="worker-info">
                <span>工号: {{ item.workNumber }}</span>
                <span class="department">{{ item.department }}</span>
              </div>
            </div>
          </Cell>
        </List>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Popup, Search as SearchBar, List, Cell, Loading } from 'vant';
import type { Worker } from '@/api/types';
import { getWorkers } from '@/api';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'select', worker: Worker): void;
}>();

const searchValue = ref('');
const workers = ref<Worker[]>([]);
const loading = ref(false);

// 计算过滤后的人员列表
const filteredWorkers = computed(() => {
  if (!searchValue.value) {
    return workers.value;
  }
  const keyword = searchValue.value.toLowerCase();
  return workers.value.filter(
    item => 
      item.name.toLowerCase().includes(keyword) || 
      item.workNumber.toLowerCase().includes(keyword)
  );
});

// 关闭弹窗
const onClose = () => {
  emit('update:visible', false);
};

// 搜索方法
const onSearch = () => {
  // 客户端搜索，无需额外操作
};

// 加载人员数据
const loadWorkers = async () => {
  loading.value = true;
  try {
    workers.value = await getWorkers();
  } catch (error) {
    console.error('加载生产人员失败:', error);
  } finally {
    loading.value = false;
  }
};

// 选择人员
const selectWorker = (worker: Worker) => {
  emit('select', worker);
  emit('update:visible', false);
};

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadWorkers();
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
  
  .worker-list {
    flex: 1;
    overflow-y: auto;
    margin-top: 16px;
  }
  
  .worker-item {
    width: 100%;
    
    .worker-name {
      font-weight: bold;
      font-size: 16px;
    }
    
    .worker-info {
      color: #666;
      margin: 4px 0;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
    }
  }
  
  .department {
    color: #1677ff;
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