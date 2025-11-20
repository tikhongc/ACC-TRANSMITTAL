<template>
  <div class="recipient-selector">
    <!-- Tabs for Users/Companies/Roles -->
    <a-tabs v-model:active-key="activeTab" type="line">
      <!-- Users Tab -->
      <a-tab-pane key="users" title="Users">
        <div class="tab-content">
          <!-- Search -->
          <a-input-search
            v-model="userSearchQuery"
            placeholder="Search users..."
            class="mb-3"
          />

          <!-- Loading -->
          <div v-if="loadingUsers" class="flex justify-center py-4">
            <a-spin />
          </div>

          <!-- Users List -->
          <div v-else class="max-h-[300px] overflow-y-auto">
            <div v-if="filteredUsers.length === 0" class="text-center text-gray-500 py-4">
              No users found
            </div>
            <div
              v-for="user in filteredUsers"
              :key="user.user_id"
              class="flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
              @click="toggleUserSelection(user)"
            >
              <a-checkbox
                :model-value="isUserSelected(user)"
                @click.stop
                @change="toggleUserSelection(user)"
              />
              <div class="ml-3 flex-1">
                <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                <div class="text-xs text-gray-500">{{ user.email }}</div>
              </div>
              <div v-if="user.company_name" class="text-xs text-gray-400">
                {{ user.company_name }}
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- Companies Tab -->
      <a-tab-pane key="companies" title="Companies">
        <div class="tab-content">
          <!-- Search -->
          <a-input-search
            v-model="companySearchQuery"
            placeholder="Search companies..."
            class="mb-3"
          />

          <!-- Loading -->
          <div v-if="loadingCompanies" class="flex justify-center py-4">
            <a-spin />
          </div>

          <!-- Companies List with Expandable Users -->
          <div v-else class="max-h-[300px] overflow-y-auto">
            <div v-if="filteredCompanies.length === 0" class="text-center text-gray-500 py-4">
              No companies found
            </div>
            <a-collapse
              v-else
              :bordered="false"
              expand-icon-position="right"
            >
              <a-collapse-item
                v-for="company in filteredCompanies"
                :key="company.company_id"
                :header="company.name"
              >
                <template #header>
                  <div class="flex items-center w-full" @click.stop>
                    <a-checkbox
                      :model-value="isCompanySelected(company)"
                      @change="toggleCompanySelection(company)"
                      @click.stop
                    />
                    <div class="ml-3 flex-1">
                      <div class="text-sm font-medium text-gray-900">{{ company.name }}</div>
                      <div class="text-xs text-gray-500">
                        {{ getUsersByCompanyId(company.company_id).length }} users
                        <span v-if="company.trade" class="ml-2">| {{ company.trade }}</span>
                      </div>
                    </div>
                  </div>
                </template>
                <!-- Users under this company -->
                <div class="pl-8">
                  <div
                    v-for="user in getUsersByCompanyId(company.company_id)"
                    :key="user.user_id"
                    class="flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                    @click="toggleUserSelection(user)"
                  >
                    <a-checkbox
                      :model-value="isUserSelected(user)"
                      @click.stop
                      @change="toggleUserSelection(user)"
                    />
                    <div class="ml-3 flex-1">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-xs text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                  <div v-if="getUsersByCompanyId(company.company_id).length === 0" class="text-center text-gray-400 py-2 text-xs">
                    No users in this company
                  </div>
                </div>
              </a-collapse-item>
            </a-collapse>
          </div>
        </div>
      </a-tab-pane>

      <!-- Roles Tab -->
      <a-tab-pane key="roles" title="Roles">
        <div class="tab-content">
          <!-- Search -->
          <a-input-search
            v-model="roleSearchQuery"
            placeholder="Search roles..."
            class="mb-3"
          />

          <!-- Loading -->
          <div v-if="loadingRoles" class="flex justify-center py-4">
            <a-spin />
          </div>

          <!-- Roles List with Expandable Users -->
          <div v-else class="max-h-[300px] overflow-y-auto">
            <div v-if="filteredRoles.length === 0" class="text-center text-gray-500 py-4">
              No roles found
            </div>
            <a-collapse
              v-else
              :bordered="false"
              expand-icon-position="right"
            >
              <a-collapse-item
                v-for="role in filteredRoles"
                :key="role.role_id"
                :header="role.name"
              >
                <template #header>
                  <div class="flex items-center w-full" @click.stop>
                    <a-checkbox
                      :model-value="isRoleSelected(role)"
                      @change="toggleRoleSelection(role)"
                      @click.stop
                    />
                    <div class="ml-3 flex-1">
                      <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
                      <div class="text-xs text-gray-500">
                        {{ getUsersByRoleId(role.role_id).length }} users
                      </div>
                    </div>
                  </div>
                </template>
                <!-- Users under this role -->
                <div class="pl-8">
                  <div
                    v-for="user in getUsersByRoleId(role.role_id)"
                    :key="user.user_id"
                    class="flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                    @click="toggleUserSelection(user)"
                  >
                    <a-checkbox
                      :model-value="isUserSelected(user)"
                      @click.stop
                      @change="toggleUserSelection(user)"
                    />
                    <div class="ml-3 flex-1">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-xs text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                  <div v-if="getUsersByRoleId(role.role_id).length === 0" class="text-center text-gray-400 py-2 text-xs">
                    No users in this role
                  </div>
                </div>
              </a-collapse-item>
            </a-collapse>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- Selected Recipients Summary -->
    <div v-if="selectedRecipients.length > 0" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-blue-900">
          Selected {{ selectedRecipients.length }} recipient(s)
        </span>
        <button
          @click="clearSelection"
          class="text-xs text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <a-tag
          v-for="recipient in selectedRecipients.slice(0, 10)"
          :key="recipient.user_id"
          closable
          @close="removeRecipient(recipient)"
          size="small"
        >
          {{ recipient.name || recipient.email }}
        </a-tag>
        <span v-if="selectedRecipients.length > 10" class="text-xs text-blue-600">
          +{{ selectedRecipients.length - 10 }} more
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { getUsers, getCompanies, getRoles } from '@/api/accountService';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

// Tab state
const activeTab = ref('users');

// Search queries
const userSearchQuery = ref('');
const companySearchQuery = ref('');
const roleSearchQuery = ref('');

// Data
const users = ref([]);
const companies = ref([]);
const roles = ref([]);

// Loading states
const loadingUsers = ref(false);
const loadingCompanies = ref(false);
const loadingRoles = ref(false);

// Selection tracking
const selectedUserIds = ref(new Set());
const selectedCompanyIds = ref(new Set());
const selectedRoleIds = ref(new Set());

// Load users
async function loadUsers() {
  try {
    loadingUsers.value = true;
    const response = await getUsers({ page_size: 100 });
    if (response.status === 'success' && response.data) {
      users.value = response.data.users || [];
    }
  } catch (err) {
    Message.error('Failed to load users: ' + err.message);
    console.error('Failed to load users:', err);
  } finally {
    loadingUsers.value = false;
  }
}

// Load companies
async function loadCompanies() {
  try {
    loadingCompanies.value = true;
    const response = await getCompanies({ page_size: 100 });
    if (response.status === 'success' && response.data) {
      companies.value = response.data.companies || [];
    }
  } catch (err) {
    Message.error('Failed to load companies: ' + err.message);
    console.error('Failed to load companies:', err);
  } finally {
    loadingCompanies.value = false;
  }
}

// Load roles
async function loadRoles() {
  try {
    loadingRoles.value = true;
    const response = await getRoles({ page_size: 100 });
    if (response.status === 'success' && response.data) {
      roles.value = response.data.roles || [];
      console.log('[RecipientSelector] Loaded roles:', roles.value.length);
      roles.value.forEach(role => {
        console.log(`Role: ${role.name}, Users count: ${role.users?.length || 0}`);
      });
    }
  } catch (err) {
    Message.error('Failed to load roles: ' + err.message);
    console.error('Failed to load roles:', err);
  } finally {
    loadingRoles.value = false;
  }
}

// Filtered lists
const filteredUsers = computed(() => {
  if (!userSearchQuery.value.trim()) {
    return users.value;
  }
  const query = userSearchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
  );
});

const filteredCompanies = computed(() => {
  if (!companySearchQuery.value.trim()) {
    return companies.value;
  }
  const query = companySearchQuery.value.toLowerCase();
  return companies.value.filter((company) =>
    company.name?.toLowerCase().includes(query)
  );
});

const filteredRoles = computed(() => {
  if (!roleSearchQuery.value.trim()) {
    return roles.value;
  }
  const query = roleSearchQuery.value.toLowerCase();
  return roles.value.filter((role) =>
    role.name?.toLowerCase().includes(query)
  );
});

// Get users by company ID
function getUsersByCompanyId(companyId) {
  // First try to get users from the company object itself (if loaded from API)
  const company = companies.value.find(c => c.company_id === companyId);
  if (company && company.users) {
    return company.users;
  }

  // Fallback: filter from users list by company_id
  return users.value.filter(user => user.company_id === companyId);
}

// Get users by role ID
function getUsersByRoleId(roleId) {
  // First try to get users from the role object itself (if loaded from API)
  const role = roles.value.find(r => r.role_id === roleId);
  if (role && role.users) {
    return role.users;
  }

  // Fallback: filter from users list by checking user.roles field
  return users.value.filter(user =>
    user.roles && user.roles.some(r => r.role_id === roleId || r.id === roleId)
  );
}

// Selection helpers
function isUserSelected(user) {
  return selectedUserIds.value.has(user.user_id);
}

function isCompanySelected(company) {
  return selectedCompanyIds.value.has(company.company_id);
}

function isRoleSelected(role) {
  return selectedRoleIds.value.has(role.role_id);
}

// Toggle selection
function toggleUserSelection(user) {
  if (selectedUserIds.value.has(user.user_id)) {
    selectedUserIds.value.delete(user.user_id);
  } else {
    selectedUserIds.value.add(user.user_id);
  }
  selectedUserIds.value = new Set(selectedUserIds.value);
  updateModelValue();
}

function toggleCompanySelection(company) {
  if (selectedCompanyIds.value.has(company.company_id)) {
    selectedCompanyIds.value.delete(company.company_id);
  } else {
    selectedCompanyIds.value.add(company.company_id);
  }
  selectedCompanyIds.value = new Set(selectedCompanyIds.value);
  updateModelValue();
}

function toggleRoleSelection(role) {
  if (selectedRoleIds.value.has(role.role_id)) {
    selectedRoleIds.value.delete(role.role_id);
  } else {
    selectedRoleIds.value.add(role.role_id);
  }
  selectedRoleIds.value = new Set(selectedRoleIds.value);
  updateModelValue();
}

// Clear all selections
function clearSelection() {
  selectedUserIds.value = new Set();
  selectedCompanyIds.value = new Set();
  selectedRoleIds.value = new Set();
  updateModelValue();
}

// Remove single recipient
function removeRecipient(recipient) {
  selectedUserIds.value.delete(recipient.user_id);
  selectedUserIds.value = new Set(selectedUserIds.value);
  updateModelValue();
}

// Compute deduplicated recipient list
const selectedRecipients = computed(() => {
  const recipientMap = new Map(); // key: email, value: user object

  // Add directly selected users
  for (const userId of selectedUserIds.value) {
    const user = users.value.find((u) => u.user_id === userId);
    if (user && user.email) {
      recipientMap.set(user.email, {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        company_name: user.company_name,
      });
    }
  }

  // Add users from selected companies
  for (const companyId of selectedCompanyIds.value) {
    const company = companies.value.find((c) => c.company_id === companyId);
    if (company && company.users) {
      for (const user of company.users) {
        if (user.email) {
          recipientMap.set(user.email, {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            company_name: company.name,
          });
        }
      }
    }
  }

  // Add users from selected roles
  for (const roleId of selectedRoleIds.value) {
    const role = roles.value.find((r) => r.role_id === roleId);
    if (role && role.users) {
      for (const user of role.users) {
        if (user.email) {
          recipientMap.set(user.email, {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            company_name: user.company_name,
          });
        }
      }
    }
  }

  return Array.from(recipientMap.values());
});

// Update v-model with deduplicated recipients
function updateModelValue() {
  emit('update:modelValue', selectedRecipients.value);
}

// Watch for changes in selection to emit updates
watch(selectedRecipients, () => {
  emit('update:modelValue', selectedRecipients.value);
});

// Load data on mount
onMounted(() => {
  loadUsers();
  loadCompanies();
  loadRoles();
});
</script>

<style scoped>
.recipient-selector {
  width: 100%;
}

.tab-content {
  padding: 12px 0;
}

/* Custom scrollbar */
.max-h-\[300px\] {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.max-h-\[300px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[300px\]::-webkit-scrollbar-track {
  background: #f7fafc;
}

.max-h-\[300px\]::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}
</style>
