<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Transmittals</h1>
        <p class="text-text-secondary text-sm mt-1">
          Manage and track document transmittals
        </p>
      </div>
      <div class="flex gap-3 items-center">
        <!-- User Selector -->
        <UserSelector v-model="selectedUserId" @user-changed="handleUserChanged" />
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <a-input-search
        v-model="filters.searchTerm"
        placeholder="Search transmittals..."
        class="w-64"
        @search="handleSearch"
      />
      <a-select
        v-model="filters.status"
        placeholder="Status"
        class="w-40"
        allow-clear
        @change="handleFilterChange"
      >
        <a-option value="DRAFT">Draft</a-option>
        <a-option value="SENT">Sent</a-option>
        <a-option value="COMPLETED">Completed</a-option>
        <a-option value="CANCELLED">Cancelled</a-option>
      </a-select>
      <a-button @click="handleRefresh">
        <template #icon>
          <icon-refresh />
        </template>
        Refresh
      </a-button>
    </div>

    <!-- Transmittal Table -->
    <div class="card">
      <TransmittalTable
        :transmittals="filteredTransmittals"
        :loading="loading"
        :current-user="currentUser"
        @row-click="handleRowClick"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconRefresh } from '@arco-design/web-vue/es/icon';
import TransmittalTable from '@/components/TransmittalTable.vue';
import UserSelector from '@/components/UserSelector.vue';
import { getTransmittals, getTransmittalRecipients } from '@/api/transmittalService';

const router = useRouter();

// User selection
const selectedUserId = ref('');
const currentUser = ref({ userId: '', autodeskId: '', name: '', email: '' });

// Transmittals data
const transmittals = ref([]);
const loading = ref(false);

// Filters
const filters = reactive({
  searchTerm: '',
  status: undefined,
});

// Filtered transmittals
const filteredTransmittals = computed(() => {
  let result = transmittals.value;

  // Search filter
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    result = result.filter((transmittal) =>
      transmittal.transmittal_number?.toLowerCase().includes(term) ||
      transmittal.subject?.toLowerCase().includes(term)
    );
  }

  // Status filter
  if (filters.status) {
    result = result.filter((transmittal) => transmittal.status === filters.status);
  }

  return result;
});

// Handle user change
function handleUserChanged(user) {
  currentUser.value = user;
  // Optionally reload transmittals based on user
  loadTransmittals();
}

// Handle search
function handleSearch() {
  // Search is handled by computed property
}

// Handle filter change
function handleFilterChange() {
  // Filter is handled by computed property
}

// Handle refresh
async function handleRefresh() {
  await loadTransmittals();
}

// Handle row click - navigate to detail page
function handleRowClick(record) {
  router.push({
    name: 'TransmittalDetail',
    params: { id: record.id },
  });
}

// Load transmittals
async function loadTransmittals() {
  loading.value = true;
  try {
    const response = await getTransmittals();
    if (response.success && response.data) {
      // Sort by created_at ascending (oldest first) and add display_index
      const sorted = response.data.sort((a, b) => {
        return new Date(a.created_at) - new Date(b.created_at);
      });
      // Add display_index to each transmittal for sorting
      transmittals.value = sorted.map((t, index) => ({
        ...t,
        display_index: index + 1,
      }));
      console.log('[TransmittalList] Loaded and sorted transmittals:', transmittals.value.length);

      // Load recipients for each transmittal
      await Promise.all(
        transmittals.value.map(async (transmittal) => {
          try {
            console.log(`[TransmittalList] Loading recipients for transmittal ${transmittal.id}...`);
            const recipientsResponse = await getTransmittalRecipients(transmittal.id);
            console.log(`[TransmittalList] Recipients response for ${transmittal.id}:`, recipientsResponse);

            if (recipientsResponse.success && recipientsResponse.data) {
              // The data is directly an array of recipients
              const allRecipients = Array.isArray(recipientsResponse.data)
                ? recipientsResponse.data
                : [];
              transmittal.recipients = allRecipients;
              console.log(`[TransmittalList] Set ${allRecipients.length} recipients for transmittal ${transmittal.id}`);
            } else {
              transmittal.recipients = [];
              console.log(`[TransmittalList] No recipients data for transmittal ${transmittal.id}`);
            }
          } catch (err) {
            console.error(`Failed to load recipients for transmittal ${transmittal.id}:`, err);
            transmittal.recipients = [];
          }
        })
      );

      console.log('[TransmittalList] Final transmittals with recipients:', transmittals.value);
    } else {
      Message.error('Failed to load transmittals');
    }
  } catch (err) {
    console.error('Failed to load transmittals:', err);
    Message.error(err.message || 'Failed to load transmittals');
  } finally {
    loading.value = false;
  }
}

// Load data on mount
onMounted(() => {
  loadTransmittals();
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.filters-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}
</style>
