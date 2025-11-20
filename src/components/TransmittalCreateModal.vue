<template>
  <a-modal
    v-model:visible="visible"
    title="Create Transmittal"
    :width="800"
    :mask-closable="false"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <template #footer>
      <a-button @click="handleCancel">Cancel</a-button>
      <a-button type="primary" :loading="submitting" @click="handleSubmit">
        Create Transmittal
      </a-button>
    </template>

    <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
      <!-- Title -->
      <a-form-item field="title" label="Title" :rules="[{ required: true, message: 'Title is required' }]">
        <a-input
          v-model="formData.title"
          placeholder="Enter transmittal title"
          :max-length="500"
          show-word-limit
        />
      </a-form-item>

      <!-- Message -->
      <a-form-item field="message" label="Message (Optional)">
        <a-textarea
          v-model="formData.message"
          placeholder="Enter a message for the recipients..."
          :max-length="2000"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          show-word-limit
        />
      </a-form-item>

      <!-- Recipients -->
      <a-form-item
        field="recipients"
        label="Recipients"
        :rules="[{ required: true, message: 'At least one recipient is required', validator: validateRecipients }]"
      >
        <RecipientSelector v-model="formData.recipients" />
      </a-form-item>

      <!-- Files -->
      <a-form-item
        field="files"
        label="Files"
        :rules="[{ required: true, message: 'At least one file is required', validator: validateFiles }]"
      >
        <FileSelectionTable v-model="formData.files" :project-id="projectId" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import RecipientSelector from './RecipientSelector.vue';
import FileSelectionTable from './FileSelectionTable.vue';
import { createTransmittal, addTransmittalDocuments, addTransmittalRecipients } from '@/api/transmittalService';
import { PROJECT_ID } from '@/api/config';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  currentUser: {
    type: Object,
    default: () => ({ userId: '', autodeskId: '', name: '', email: '' }),
  },
});

const emit = defineEmits(['update:modelValue', 'created']);

// Local visibility state
const visible = ref(false);
const submitting = ref(false);
const formRef = ref(null);

// Project ID
const projectId = PROJECT_ID;

// Form data
const formData = reactive({
  title: '',
  message: '',
  recipients: [],
  files: [],
});

// Form validation rules
const formRules = {
  title: [
    { required: true, message: 'Title is required' },
  ],
};

// Custom validators
function validateRecipients(value, callback) {
  if (!formData.recipients || formData.recipients.length === 0) {
    callback('At least one recipient is required');
  } else {
    callback();
  }
}

function validateFiles(value, callback) {
  if (!formData.files || formData.files.length === 0) {
    callback('At least one file is required');
  } else {
    callback();
  }
}

// Watch for external visibility changes
watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue;
    if (newValue) {
      resetForm();
    }
  },
  { immediate: true }
);

// Watch for internal visibility changes
watch(visible, (newValue) => {
  emit('update:modelValue', newValue);
});

// Reset form
function resetForm() {
  formData.title = '';
  formData.message = '';
  formData.recipients = [];
  formData.files = [];
  if (formRef.value) {
    formRef.value.clearValidate();
  }
}

// Handle cancel
function handleCancel() {
  visible.value = false;
}

// Handle submit
async function handleSubmit() {
  try {
    // Validate form
    const errors = await formRef.value.validate();
    if (errors) {
      console.log('Validation errors:', errors);
      return;
    }

    // Additional validation
    if (!formData.recipients || formData.recipients.length === 0) {
      Message.error('Please select at least one recipient');
      return;
    }

    if (!formData.files || formData.files.length === 0) {
      Message.error('Please select at least one file');
      return;
    }

    submitting.value = true;

    // Step 1: Create transmittal
    console.log('Creating transmittal...', formData);

    const transmittalResponse = await createTransmittal({
      project_id: projectId.replace('b.', ''), // Remove b. prefix if present
      title: formData.title,
      message: formData.message || null,
      // Use current user from selector - use userId (UUID) for database operations
      created_by_user_id: props.currentUser.userId || null,
      created_by_user_name: props.currentUser.name || 'System User',
      created_by_company_id: null,
      created_by_company_name: null,
    });

    if (!transmittalResponse.success) {
      throw new Error(transmittalResponse.error || 'Failed to create transmittal');
    }

    const transmittalId = transmittalResponse.transmittal_id;
    console.log('Transmittal created:', transmittalId);

    // Step 2: Add documents
    const documentsResponse = await addTransmittalDocuments(transmittalId, {
      documents: formData.files.map((file) => ({
        urn: file.file_urn,
        file_name: file.file_name,
        version_number: file.version_number || 1,
      })),
    });

    if (!documentsResponse.success) {
      console.warn('Warning: Failed to add documents:', documentsResponse.error);
    }

    // Step 3: Add recipients
    const recipientsResponse = await addTransmittalRecipients(transmittalId, {
      recipients: formData.recipients.map((recipient) => ({
        user_id: recipient.user_id,
        user_name: recipient.name,
        email: recipient.email,
        company_name: recipient.company_name || null,
      })),
    });

    if (!recipientsResponse.success) {
      console.warn('Warning: Failed to add recipients:', recipientsResponse.error);
    }

    Message.success('Transmittal created successfully');
    visible.value = false;
    emit('created', transmittalId);
  } catch (err) {
    Message.error('Failed to create transmittal: ' + err.message);
    console.error('Failed to create transmittal:', err);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
:deep(.arco-form-item) {
  margin-bottom: 16px;
}

:deep(.arco-modal-body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
