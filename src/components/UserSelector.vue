<template>
  <div class="flex items-center gap-2">
    <label class="text-sm font-medium text-gray-700">Current User:</label>
    <a-select
      v-model="selectedUserId"
      placeholder="Select User..."
      style="min-width: 250px;"
      allow-clear
      @change="handleUserChange"
    >
      <a-option v-for="user in availableUsers" :key="user.autodesk_id" :value="user.autodesk_id">
        {{ user.name }} ({{ user.email }})
      </a-option>
    </a-select>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { getUsers } from '@/api/accountService';

const emit = defineEmits(['update:modelValue', 'user-changed']);
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const availableUsers = ref([]);
const selectedUserId = ref(props.modelValue);

// Current user object
const currentUser = computed(() => {
  if (!selectedUserId.value || !availableUsers.value.length) {
    return { userId: '', autodeskId: '', name: '', email: '' };
  }
  const user = availableUsers.value.find(u => u.autodesk_id === selectedUserId.value);
  return user ? {
    userId: user.user_id,        // UUID for database operations
    autodeskId: user.autodesk_id, // Autodesk ID for display
    name: user.name,
    email: user.email
  } : { userId: '', autodeskId: '', name: '', email: '' };
});

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  selectedUserId.value = newVal;
});

// Watch for internal changes
watch(selectedUserId, (newVal) => {
  emit('update:modelValue', newVal);
  emit('user-changed', currentUser.value);
});

// Handle user change
function handleUserChange() {
  emit('update:modelValue', selectedUserId.value);
  emit('user-changed', currentUser.value);
}

// Load available users
async function loadAvailableUsers() {
  try {
    const response = await getUsers({ page_size: 100 });
    if ((response.success || response.status === 'success') && response.data) {
      availableUsers.value = response.data.users || [];
      // Auto-select first user if none selected
      if (availableUsers.value.length > 0 && !selectedUserId.value) {
        selectedUserId.value = availableUsers.value[0].autodesk_id;
      }
    }
  } catch (err) {
    console.error('Failed to load available users:', err);
    Message.error('Failed to load available users');
  }
}

onMounted(() => {
  loadAvailableUsers();
});

defineExpose({
  currentUser,
});
</script>
