<template>
  <div class="overflow-hidden">
    <!-- Controls Row -->
    <div class="mb-4 flex justify-between items-center">
      <!-- Group By Selector -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">Group by:</span>
        <a-select v-model="groupBy" size="small" style="width: 120px;">
          <a-option value="none">None</a-option>
          <a-option value="company">Company</a-option>
          <a-option value="status">Status</a-option>
        </a-select>
      </div>

      <!-- Add Recipients Button -->
      <div v-if="transmittalId && canAddRecipients">
        <a-button type="primary" @click="showAddRecipientsModal = true">
          <template #icon><icon-plus /></template>
          Add Recipients
        </a-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!recipients.length" class="text-center py-12 text-gray-500">
      No recipients found
    </div>

    <!-- Grouped Recipients List -->
    <div v-else-if="groupBy !== 'none'" class="space-y-4">
      <div v-for="group in groupedRecipients" :key="group.name" class="border border-gray-200 rounded-lg overflow-hidden">
        <!-- Group Header -->
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <span class="font-medium text-gray-700">{{ group.name }}</span>
          <span class="text-sm text-gray-500">{{ group.recipients.length }} recipient(s)</span>
        </div>
        <!-- Group Recipients -->
        <div class="p-3 space-y-3">
          <div
            v-for="recipient in group.recipients"
            :key="recipient.email"
            class="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
          >
            <!-- Recipient Content (same as ungrouped) -->
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                  {{ getInitials(recipient.name) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-900 truncate">{{ recipient.name || 'Unknown' }}</div>
                  <div class="text-sm text-gray-500 truncate">{{ recipient.email }}</div>
                </div>
              </div>
              <span :class="getStatusClass(recipient)" class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2">
                {{ getStatus(recipient) }}
              </span>
            </div>
            <div class="flex items-start justify-between text-sm mt-3 pt-3 border-t border-gray-100">
              <div class="text-gray-600 space-y-1">
                <div v-if="getRecipientCompany(recipient)" class="flex items-center gap-1">
                  <span class="text-gray-400 text-xs">Company:</span>
                  <span class="text-gray-700">{{ getRecipientCompany(recipient).name }}</span>
                </div>
                <div v-if="getRecipientRoles(recipient).length > 0" class="flex items-start gap-1">
                  <span class="text-gray-400 text-xs">Role:</span>
                  <span class="text-gray-700">{{ getRecipientRoles(recipient).map(r => r.name).join(', ') }}</span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-gray-700 font-medium">{{ getActivityTime(recipient) }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ getActivityLabel(recipient) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ungrouped Recipients List -->
    <div v-else class="space-y-3">
      <div
        v-for="recipient in recipients"
        :key="recipient.email"
        class="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
      >
        <!-- Recipient Header -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- Avatar -->
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              {{ getInitials(recipient.name) }}
            </div>
            <!-- Name & Email -->
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">
                {{ recipient.name || 'Unknown' }}
              </div>
              <div class="text-sm text-gray-500 truncate">
                {{ recipient.email }}
              </div>
            </div>
          </div>

          <!-- Status Badge -->
          <span :class="getStatusClass(recipient)" class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2">
            {{ getStatus(recipient) }}
          </span>
        </div>

        <!-- Role & Company & Timestamp -->
        <div class="flex items-start justify-between text-sm mt-3 pt-3 border-t border-gray-100">
          <div class="text-gray-600 space-y-1">
            <!-- Company -->
            <div v-if="getRecipientCompany(recipient)" class="flex items-center gap-1">
              <span class="text-gray-400 text-xs">Company:</span>
              <span class="text-gray-700">{{ getRecipientCompany(recipient).name }}</span>
            </div>
            <!-- Roles -->
            <div v-if="getRecipientRoles(recipient).length > 0" class="flex items-start gap-1">
              <span class="text-gray-400 text-xs">Role:</span>
              <span class="text-gray-700">
                {{ getRecipientRoles(recipient).map(r => r.name).join(', ') }}
              </span>
            </div>
          </div>

          <div class="text-right flex-shrink-0">
            <div class="text-gray-700 font-medium">
              {{ getActivityTime(recipient) }}
            </div>
            <div class="text-xs text-gray-400 mt-0.5">
              {{ getActivityLabel(recipient) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Recipients Modal -->
    <a-modal
      v-model:visible="showAddRecipientsModal"
      title="Add Recipients"
      :width="600"
      :footer="false"
      @cancel="handleModalCancel"
    >
      <RecipientSelector v-model="newRecipients" />

      <div class="mt-4 flex justify-end gap-2">
        <a-button @click="handleModalCancel">Cancel</a-button>
        <a-button
          type="primary"
          :loading="addingRecipients"
          :disabled="newRecipients.length === 0"
          @click="handleAddRecipients"
        >
          Add {{ newRecipients.length }} Recipient(s)
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { formatDateTime } from '@/utils/dateUtils';
import { getCompanies, getRoles } from '@/api/accountService';
import { addTransmittalRecipients } from '@/api/transmittalService';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
import RecipientSelector from './RecipientSelector.vue';

const props = defineProps({
  recipients: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  transmittalCreatedAt: {
    type: String,
    default: null,
  },
  transmittalId: {
    type: String,
    default: null,
  },
  currentUserEmail: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['recipients-added']);

// Permission check - only recipients can add new recipients
const canAddRecipients = computed(() => {
  if (!props.currentUserEmail || !props.recipients.length) {
    return false;
  }
  return props.recipients.some(
    r => r.email.toLowerCase() === props.currentUserEmail.toLowerCase()
  );
});

// Data state
const companies = ref([]);
const roles = ref([]);
const loadingData = ref(false);

// Add recipients state
const showAddRecipientsModal = ref(false);
const newRecipients = ref([]);
const addingRecipients = ref(false);

// Grouping state
const groupBy = ref('none');

// Grouped recipients computed
const groupedRecipients = computed(() => {
  if (groupBy.value === 'none') {
    return [];
  }

  if (groupBy.value === 'status') {
    // Group by status: Downloaded, Viewed, Received
    const groups = {
      'Downloaded': [],
      'Viewed': [],
      'Received': [],
    };

    for (const recipient of props.recipients) {
      const status = getStatus(recipient);
      groups[status].push(recipient);
    }

    return Object.entries(groups)
      .filter(([_, recipients]) => recipients.length > 0)
      .map(([name, recipients]) => ({ name, recipients }));
  }

  if (groupBy.value === 'company') {
    // Group by company
    const groups = {};

    for (const recipient of props.recipients) {
      const company = getRecipientCompany(recipient);
      const companyName = company ? company.name : 'No Company';

      if (!groups[companyName]) {
        groups[companyName] = [];
      }
      groups[companyName].push(recipient);
    }

    return Object.entries(groups)
      .sort(([a], [b]) => {
        // "No Company" always at the bottom
        if (a === 'No Company') return 1;
        if (b === 'No Company') return -1;
        return a.localeCompare(b);
      })
      .map(([name, recipients]) => ({ name, recipients }));
  }

  return [];
});

// Load companies from API
async function loadCompanies() {
  try {
    const response = await getCompanies({ page_size: 100 });
    if (response.status === 'success' && response.data) {
      companies.value = response.data.companies || [];
    }
  } catch (err) {
    console.error('Failed to load companies:', err);
  }
}

// Load roles from API
async function loadRoles() {
  try {
    const response = await getRoles({ page_size: 100 });
    if (response.status === 'success' && response.data) {
      roles.value = response.data.roles || [];
    }
  } catch (err) {
    console.error('Failed to load roles:', err);
  }
}

// Get recipient's company by matching email
function getRecipientCompany(recipient) {
  return companies.value.find(company =>
    company.users?.some(user => user.email === recipient.email)
  );
}

// Get all recipient's roles by matching email
function getRecipientRoles(recipient) {
  return roles.value.filter(role =>
    role.users?.some(user => user.email === recipient.email)
  );
}

// Handle modal cancel
function handleModalCancel() {
  showAddRecipientsModal.value = false;
  newRecipients.value = [];
}

// Handle add recipients
async function handleAddRecipients() {
  if (!props.transmittalId || newRecipients.value.length === 0) {
    return;
  }

  // Get existing recipient emails
  const existingEmails = new Set(
    props.recipients.map(r => r.email.toLowerCase())
  );

  // Filter out already existing recipients
  const recipientsToAdd = [];
  const duplicateRecipients = [];

  for (const recipient of newRecipients.value) {
    if (existingEmails.has(recipient.email.toLowerCase())) {
      duplicateRecipients.push(recipient.name || recipient.email);
    } else {
      recipientsToAdd.push({
        user_id: recipient.user_id,
        user_name: recipient.name,
        email: recipient.email,
        company_name: recipient.company_name,
      });
    }
  }

  // Show warning for duplicates
  if (duplicateRecipients.length > 0) {
    Message.warning(`The following recipients already exist: ${duplicateRecipients.join(', ')}`);
  }

  // If no new recipients to add
  if (recipientsToAdd.length === 0) {
    Message.info('All selected recipients already exist in this transmittal');
    return;
  }

  try {
    addingRecipients.value = true;

    const response = await addTransmittalRecipients(props.transmittalId, {
      recipients: recipientsToAdd,
    });

    if (response.success) {
      Message.success(`Successfully added ${response.recipients_added} recipient(s)`);
      showAddRecipientsModal.value = false;
      newRecipients.value = [];
      // Emit event to parent to refresh the list
      emit('recipients-added');
    } else {
      Message.error(response.error || 'Failed to add recipients');
    }
  } catch (err) {
    console.error('Failed to add recipients:', err);
    Message.error('Failed to add recipients: ' + err.message);
  } finally {
    addingRecipients.value = false;
  }
}

// Load data on mount
onMounted(async () => {
  loadingData.value = true;
  try {
    await Promise.all([loadCompanies(), loadRoles()]);
  } finally {
    loadingData.value = false;
  }
});

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getStatus(record) {
  if (record.downloaded_at) return 'Downloaded';
  if (record.viewed_at) return 'Viewed';
  return 'Received';
}

function getStatusClass(record) {
  if (record.downloaded_at) {
    return 'bg-green-100 text-green-700';
  }
  if (record.viewed_at) {
    return 'bg-blue-100 text-blue-700';
  }
  return 'bg-gray-100 text-gray-600';
}

function getActivityTime(record) {
  if (record.downloaded_at) {
    return formatDateTime(record.downloaded_at);
  }
  if (record.viewed_at) {
    return formatDateTime(record.viewed_at);
  }
  // Use transmittal created_at for "Received" status
  return props.transmittalCreatedAt ? formatDateTime(props.transmittalCreatedAt) : '-';
}

function getActivityLabel(record) {
  if (record.downloaded_at) return 'Downloaded';
  if (record.viewed_at) return 'Viewed';
  return 'Received';
}
</script>
