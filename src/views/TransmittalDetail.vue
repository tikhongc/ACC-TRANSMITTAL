<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center gap-4">
        <a-button @click="goBack">
          <template #icon>
            <icon-left />
          </template>
          Back
        </a-button>
        <div>
          <h1 class="page-title">{{ transmittal.subject || 'Transmittal Details' }}</h1>
        </div>
      </div>
      <div class="flex gap-3 items-center">
        <!-- User Selector -->
        <UserSelector v-model="selectedUserId" @user-changed="handleUserChanged" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- General Information -->
      <TransmittalInfoCard :transmittal="transmittal" />

      <!-- Documents and Recipients Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="flex h-full divide-x divide-gray-200">
          <!-- Documents Section (Left) -->
          <div class="flex-1">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 class="text-lg font-semibold text-gray-900">Documents</h2>
              <button
                :disabled="!documents.length || downloadingZip"
                @click="handleDownloadZip"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <icon-download v-if="!downloadingZip" class="w-4 h-4" />
                <span v-if="downloadingZip">Downloading...</span>
                <span v-else>Download All as ZIP</span>
              </button>
            </div>
            <div class="p-6">
              <DocumentTable
                :documents="documents"
                :loading="loadingDocuments"
                @download-document="handleDownloadDocument"
              />
            </div>
          </div>

          <!-- Recipients Section (Right) -->
          <div class="w-[500px]">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 class="text-lg font-semibold text-gray-900">Recipients</h2>
              <span class="text-sm text-gray-500">
                {{ recipients.length }} recipient(s)
              </span>
            </div>
            <div class="p-6">
              <RecipientList
                :recipients="recipients"
                :loading="loadingRecipients"
                :transmittal-created-at="transmittal.created_at"
                :transmittal-id="transmittalId"
                :current-user-email="currentUser.email"
                @recipients-added="loadRecipients"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconLeft, IconDownload } from '@arco-design/web-vue/es/icon';
import DocumentTable from '@/components/DocumentTable.vue';
import RecipientList from '@/components/RecipientList.vue';
import TransmittalInfoCard from '@/components/TransmittalInfoCard.vue';
import UserSelector from '@/components/UserSelector.vue';
import {
  getTransmittals,
  getTransmittalDocuments,
  getTransmittalRecipients,
  markTransmittalViewed,
  downloadTransmittalZip,
} from '@/api/transmittalService';
import { downloadBlob, getFileName, formatFileSize } from '@/utils/downloadUtils';

const router = useRouter();
const route = useRoute();

// User selection
const selectedUserId = ref('');
const currentUser = ref({ autodeskId: '', name: '', email: '' });

// Data
const transmittal = ref({});
const documents = ref([]);
const recipients = ref([]);

// Loading states
const loading = ref(true);
const loadingDocuments = ref(false);
const loadingRecipients = ref(false);
const downloadingZip = ref(false);

// Get transmittal ID from route
const transmittalId = route.params.id;

// Handle user change
function handleUserChanged(user) {
  currentUser.value = user;
  // Mark as viewed only if user is a recipient
  if (user.email && isUserRecipient(user.email)) {
    markAsViewed(user.email);
  }
  // Reload recipients to update status
  loadRecipients();
}

// Check if user is a recipient of this transmittal
function isUserRecipient(email) {
  if (!email || !recipients.value.length) {
    return false;
  }
  return recipients.value.some(recipient =>
    recipient.email && recipient.email.toLowerCase() === email.toLowerCase()
  );
}

// Go back to list
function goBack() {
  router.push({ name: 'TransmittalList' });
}

// Mark transmittal as viewed
async function markAsViewed(email) {
  try {
    await markTransmittalViewed(transmittalId, email);
  } catch (err) {
    console.error('Failed to mark as viewed:', err);
    // Don't show error message as this is a background operation
  }
}

// Handle download ZIP
async function handleDownloadZip() {
  if (!documents.value.length) {
    Message.warning('No documents to download');
    return;
  }

  const userEmail = currentUser.value.email;
  console.log('[Download] Current user email:', userEmail);
  console.log('[Download] Is recipient:', isUserRecipient(userEmail));
  console.log('[Download] Transmittal ID:', transmittalId);
  console.log('[Download] Current recipients:', recipients.value);

  downloadingZip.value = true;
  try {
    // Download ZIP with user email for tracking
    const blob = await downloadTransmittalZip(
      transmittalId,
      userEmail || null
    );

    // Extract metadata from blob
    const { fileCount, totalSize, failedFiles } = blob.metadata || {};

    // Download the file
    const filename = `transmittal_${transmittal.value.transmittal_number || transmittalId}.zip`;
    downloadBlob(blob, filename);

    // Show success message with metadata
    let message = `Downloaded ${fileCount || documents.value.length} files`;
    if (totalSize) {
      message += ` (${formatFileSize(totalSize)})`;
    }
    if (failedFiles && failedFiles.length > 0) {
      message += `\n${failedFiles.length} file(s) failed to download`;
      Message.warning(message);
    } else {
      Message.success(message);
    }

    // Reload recipients to update download status
    // Wait a bit longer to ensure backend has updated
    console.log('[Download] Waiting before reload...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('[Download] Reloading recipients...');
    await loadRecipients();
    console.log('[Download] Recipients after reload:', recipients.value);
  } catch (err) {
    console.error('Failed to download ZIP:', err);
    Message.error(err.message || 'Failed to download ZIP file');
  } finally {
    downloadingZip.value = false;
  }
}

// Handle download single document
async function handleDownloadDocument(doc) {
  try {
    Message.info(`Downloading ${doc.display_name}...`);

    // For now, open the document URN in a new tab
    // TODO: Implement proper single file download endpoint
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/transmittals/${transmittalId}/documents/${doc.id}/download`;

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = doc.display_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Message.success(`Download started for ${doc.display_name}`);
  } catch (err) {
    console.error('Failed to download document:', err);
    Message.error(`Failed to download ${doc.display_name}`);
  }
}

// Load transmittal details
async function loadTransmittal() {
  try {
    const response = await getTransmittals();
    if (response.success && response.data) {
      const found = response.data.find(t => t.id === transmittalId);
      if (found) {
        transmittal.value = found;
      } else {
        Message.error('Transmittal not found');
        router.push({ name: 'TransmittalList' });
      }
    }
  } catch (err) {
    console.error('Failed to load transmittal:', err);
    Message.error('Failed to load transmittal details');
  }
}

// Load documents
async function loadDocuments() {
  loadingDocuments.value = true;
  try {
    const response = await getTransmittalDocuments(transmittalId);
    if (response.success && response.data) {
      documents.value = response.data;
    }
  } catch (err) {
    console.error('Failed to load documents:', err);
    Message.error('Failed to load documents');
  } finally {
    loadingDocuments.value = false;
  }
}

// Load recipients
async function loadRecipients() {
  loadingRecipients.value = true;
  try {
    const response = await getTransmittalRecipients(transmittalId);
    if (response.success && response.data) {
      recipients.value = response.data;
    }
  } catch (err) {
    console.error('Failed to load recipients:', err);
    Message.error('Failed to load recipients');
  } finally {
    loadingRecipients.value = false;
  }
}

// Load all data
async function loadAllData() {
  loading.value = true;
  try {
    await Promise.all([
      loadTransmittal(),
      loadDocuments(),
      loadRecipients(),
    ]);
  } finally {
    loading.value = false;
  }
}

// Load data on mount
onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
.page-container {
  @apply min-h-screen p-6 bg-gray-50;
}

.page-header {
  @apply flex justify-between items-start mb-6;
}

.page-title {
  @apply text-2xl font-semibold text-gray-900 m-0;
}

.loading-container {
  @apply flex justify-center items-center min-h-[400px];
}
</style>
