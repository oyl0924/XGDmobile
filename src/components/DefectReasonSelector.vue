<template>
  <Popup
    :show="visible"
    position="bottom"
    :style="{ height: '60vh' }"
    @close="onClose"
  >
    <div class="popup-title">选择不良品原因</div>
    <div class="selector-container">
      <SearchBar
        v-model="searchValue"
        placeholder="搜索不良品原因"
        @search="onSearch"
      />
      <div v-if="loading" class="loading-container">
        <Loading type="spinner" />
      </div>
      <div v-else-if="reasons.length === 0" class="no-data">
        暂无不良品原因数据
      </div>
      <div v-else class="reason-list">
        <List>
          <Cell
            v-for="item in filteredReasons"
            :key="item.id"
            clickable
            @click="selectReason(item)"
          >
            <div class="reason-item">
              <div class="reason-name">{{ item.name }}</div>
              <div class="reason-code">编码: {{ item.code }}</div>
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
import type { DefectReason } from '@/api/types';
import { getDefectReasons } from '@/api';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'select', reason: DefectReason): void;
}>();

const searchValue = ref('');
const reasons = ref<DefectReason[]>([]);
const loading = ref(false);

// 计算过滤后的不良品原因列表
const filteredReasons = computed(() => {
  if (!searchValue.value) {
    return reasons.value;
  }
  const keyword = searchValue.value.toLowerCase();
  return reasons.value.filter(
    item => 
      item.name.toLowerCase().includes(keyword) || 
      item.code.toLowerCase().includes(keyword)
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

// 加载不良品原因数据
const loadReasons = async () => {
  loading.value = true;
  try {
    reasons.value = await getDefectReasons();
  } catch (error) {
    console.error('加载不良品原因失败:', error);
  } finally {
    loading.value = false;
  }
};

// 选择不良品原因
const selectReason = (reason: DefectReason) => {
  emit('select', reason);
  emit('update:visible', false);
};

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadReasons();
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
  
  .reason-list {
    flex: 1;
    overflow-y: auto;
    margin-top: 16px;
  }
  
  .reason-item {
    width: 100%;
    
    .reason-name {
      font-weight: bold;
      font-size: 16px;
    }
    
    .reason-code {
      color: #666;
      margin: 4px 0;
      font-size: 14px;
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