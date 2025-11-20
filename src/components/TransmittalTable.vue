<template>
  <div>
    <!-- Header with Create Button -->
    <div class="flex justify-between items-center mb-4">
      <slot name="header"></slot>
      <a-button type="primary" @click="showCreateModal = true">
        <template #icon>
          <icon-plus />
        </template>
        Create Transmittal
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data="transmittals"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      :hoverable="true"
      @row-click="handleRowClick"
    >
      <!-- Transmittal ID column -->
      <template #transmittal_id="{ record }">
        {{ record.display_index }}
      </template>

      <!-- Status column -->
      <template #status="{ record }">
        <span v-if="record.status" :class="`status-tag status-${record.status.toLowerCase()}`">
          {{ record.status }}
        </span>
        <span v-else class="text-text-disabled">-</span>
      </template>

      <!-- Creator column -->
      <template #creator="{ record }">
        <div class="flex items-center gap-2">
          <UserAvatar
            :name="record.created_by_name || record.created_by_user_name || 'Unknown'"
            :email="record.created_by_email || ''"
            :size="28"
          />
          <span class="text-sm">{{ record.created_by_name || record.created_by_user_name || 'Unknown' }}</span>
        </div>
      </template>

      <!-- Recipients column -->
      <template #recipients="{ record }">
        <div class="flex items-center gap-1 flex-wrap">
          <template v-if="record.recipients && record.recipients.length > 0">
            <UserAvatar
              v-for="(recipient, index) in record.recipients"
              :key="index"
              :name="recipient.name || recipient.email"
              :email="recipient.email"
              :size="28"
            />
          </template>
          <span v-else class="text-text-disabled text-sm">-</span>
        </div>
      </template>

      <!-- Document count column -->
      <template #documents="{ record }">
        {{ record.document_count || 0 }}
      </template>

      <!-- Created at column -->
      <template #created_at="{ record }">
        {{ formatDateTime(record.created_at) }}
      </template>
    </a-table>

    <!-- Create Modal -->
    <TransmittalCreateModal
      v-model="showCreateModal"
      :current-user="currentUser"
      @created="handleTransmittalCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
import { formatDateTime } from '@/utils/dateUtils';
import TransmittalCreateModal from './TransmittalCreateModal.vue';
import UserAvatar from './UserAvatar.vue';

const props = defineProps({
  transmittals: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  currentUser: {
    type: Object,
    default: () => ({ userId: '', autodeskId: '', name: '', email: '' }),
  },
});

const emit = defineEmits(['row-click', 'created']);

// Modal visibility
const showCreateModal = ref(false);

const columns = [
  {
    title: 'Transmittal ID',
    dataIndex: 'display_index',
    slotName: 'transmittal_id',
    width: 120,
    sortable: {
      sortDirections: ['ascend', 'descend'],
    },
  },
  {
    title: 'Title',
    dataIndex: 'subject',
    ellipsis: true,
    tooltip: true,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    slotName: 'status',
    width: 120,
  },
  {
    title: 'Creator',
    dataIndex: 'created_by_name',
    slotName: 'creator',
    width: 200,
  },
  {
    title: 'Recipients',
    dataIndex: 'recipients',
    slotName: 'recipients',
    width: 300,
  },
  {
    title: 'Documents',
    dataIndex: 'document_count',
    slotName: 'documents',
    width: 100,
    align: 'center',
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    slotName: 'created_at',
    width: 180,
  },
];

const pagination = computed(() => ({
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100],
}));

function handleRowClick(record) {
  emit('row-click', record);
}

function handleTransmittalCreated(transmittalId) {
  emit('created', transmittalId);
}
</script>

<style scoped>
:deep(.arco-table-tr) {
  cursor: pointer;
}

:deep(.arco-table-tr:hover) {
  background-color: #F7F8FA;
}
</style>
