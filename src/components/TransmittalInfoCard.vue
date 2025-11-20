<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <!-- Card Header -->
    <div class="px-6 py-3 border-b border-gray-200 bg-gray-50">
      <h2 class="text-base font-semibold text-gray-900">General Information</h2>
    </div>

    <!-- Card Content -->
    <div class="p-4">
      <div class="grid grid-cols-3 gap-4">
        <!-- Title -->
        <div class="border border-gray-200 rounded-md p-3 bg-gray-50/50">
          <div class="text-xs font-medium text-gray-500 mb-1">
            Title
          </div>
          <div class="text-sm text-gray-900 font-medium">
            {{ transmittal.subject || '-' }}
          </div>
        </div>

        <!-- Status -->
        <div class="border border-gray-200 rounded-md p-3 bg-gray-50/50">
          <div class="text-xs font-medium text-gray-500 mb-1">
            Status
          </div>
          <div>
            <span v-if="transmittal.status" :class="getStatusClass(transmittal.status)" class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium">
              {{ transmittal.status }}
            </span>
            <span v-else class="text-sm text-gray-400">-</span>
          </div>
        </div>

        <!-- Document Count -->
        <div class="border border-gray-200 rounded-md p-3 bg-gray-50/50">
          <div class="text-xs font-medium text-gray-500 mb-1">
            Document Count
          </div>
          <div class="text-sm text-gray-900 font-medium">
            {{ transmittal.document_count || 0 }}
          </div>
        </div>

        <!-- Recipient Count -->
        <div class="border border-gray-200 rounded-md p-3 bg-gray-50/50">
          <div class="text-xs font-medium text-gray-500 mb-1">
            Recipient Count
          </div>
          <div class="text-sm text-gray-900 font-medium">
            {{ transmittal.recipient_count || 0 }}
          </div>
        </div>

        <!-- Created By -->
        <div class="col-span-2 border border-gray-200 rounded-md p-3 bg-gray-50/50">
          <div class="text-xs font-medium text-gray-500 mb-1">
            Created By
          </div>
          <div v-if="transmittal.created_by_name">
            <div class="text-sm text-gray-900 font-medium">{{ transmittal.created_by_name }}</div>
            <div v-if="transmittal.created_by_email" class="text-xs text-gray-500 mt-0.5">
              {{ transmittal.created_by_email }}
            </div>
          </div>
          <div v-else class="text-sm text-gray-400">-</div>
        </div>

        <!-- Created At -->
        <div class="border border-gray-200 rounded-md p-3 bg-gray-50/50">
          <div class="text-xs font-medium text-gray-500 mb-1">
            Created At
          </div>
          <div class="text-sm text-gray-900">
            {{ transmittal.created_at ? formatDateTime(transmittal.created_at) : '-' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDateTime } from '@/utils/dateUtils';

defineProps({
  transmittal: {
    type: Object,
    default: () => ({}),
  },
});

function getStatusClass(status) {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'sent':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'draft':
      return 'bg-gray-100 text-gray-700 border border-gray-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    default:
      return 'bg-blue-100 text-blue-700 border border-blue-200';
  }
}
</script>
