<template>
  <Popup
    :show="visible"
    position="bottom"
    :style="{ height: '70vh' }"
    @close="onClose"
  >
    <div class="popup-title">选择工单</div>
    <div class="selector-container">
      <SearchBar
        v-model="searchValue"
        placeholder="搜索工单号或产品"
        @search="onSearch"
      />
      <div class="order-list">
        <List>
          <Cell
            v-for="item in filteredOrders"
            :key="item.id"
            clickable
            @click="selectOrder(item)"
          >
            <div class="order-item">
              <div class="order-id">
                {{ item.orderNumber }}
                <Tag 
                  v-if="item.isUrgent" 
                  type="danger"
                  class="urgent-tag"
                >
                  加急
                </Tag>
              </div>
              <div class="order-product">{{ item.product.productName }}</div>
              <div class="order-status">
                <Tag :type="getStatusType(item.status)">{{ item.status }}</Tag>
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
import { Popup, Search as SearchBar, List, Cell, Tag, Loading } from 'vant';
import type { WorkOrder } from '@/api/types';
import { getWorkOrders } from '@/api';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'select', workOrder: WorkOrder): void;
}>();

const searchValue = ref('');
const orders = ref<WorkOrder[]>([]);
const loading = ref(false);

// 计算过滤后的工单列表
const filteredOrders = computed(() => {
  if (!searchValue.value) {
    return orders.value;
  }
  const keyword = searchValue.value.toLowerCase();
  return orders.value.filter(
    item => 
      item.orderNumber.toLowerCase().includes(keyword) || 
      item.product.productName.toLowerCase().includes(keyword)
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

// 加载工单数据
const loadOrders = async () => {
  loading.value = true;
  try {
    orders.value = await getWorkOrders();
  } catch (error) {
    console.error('加载工单失败:', error);
  } finally {
    loading.value = false;
  }
};

// 选择工单
const selectOrder = (order: WorkOrder) => {
  emit('select', order);
  emit('update:visible', false);
};

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadOrders();
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
  
  .order-list {
    flex: 1;
    overflow-y: auto;
    margin-top: 16px;
  }
  
  .order-item {
    width: 100%;
    
    .order-id {
      font-weight: bold;
      font-size: 16px;
      display: flex;
      align-items: center;
    }
    
    .order-product {
      color: #666;
      margin: 4px 0;
    }
    
    .order-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.urgent-tag {
  margin-left: 8px;
}
</style> 