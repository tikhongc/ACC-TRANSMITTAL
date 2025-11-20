<template>
  <div class="overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!documents.length" class="text-center py-12 text-gray-500">
      No documents found
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              File Name
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Version
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
              Last Modified
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
              Last Modified User
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
              Action
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="doc in documents"
            :key="doc.id"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="handleRowClick(doc)"
          >
            <!-- File Name -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span class="text-sm text-gray-900 truncate">{{ doc.display_name }}</span>
              </div>
            </td>

            <!-- Version -->
            <td class="px-4 py-4">
              <span v-if="doc.version_number" class="text-sm text-gray-600">
                v{{ doc.version_number }}
              </span>
              <span v-else class="text-sm text-gray-400">-</span>
            </td>

            <!-- Last Modified -->
            <td class="px-4 py-4">
              <span class="text-sm text-gray-600">
                {{ doc.last_modified_time ? formatDateTime(doc.last_modified_time) : '-' }}
              </span>
            </td>

            <!-- Last Modified User -->
            <td class="px-4 py-4">
              <span class="text-sm text-gray-600">
                {{ doc.last_modified_user_name || '-' }}
              </span>
            </td>

            <!-- Download Action -->
            <td class="px-4 py-4">
              <div class="flex justify-center">
                <button
                  @click.stop="$emit('download-document', doc)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  :title="`Download ${doc.display_name}`"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue';
import { formatDateTime } from '@/utils/dateUtils';
import { generateViewerUrl } from '@/api/forgeViewerService';

defineProps({
  documents: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

/**
 * 处理文档行点击事件
 * 获取文档的 URN，调用后端 API 生成 Forge Viewer URL，然后在新标签页打开
 */
const handleRowClick = async (doc) => {
  // 从文档数据中提取 URN
  // 支持短格式（如 "5PfUdMeESQ6S8XmZ5lCPaw"）和完整格式
  const urn = doc?.urn || doc?.URN;

  if (!urn) {
    console.warn('Document does not have URN, cannot open viewer:', doc);
    Message.warning('此文档无法预览（缺少 URN）');
    return;
  }

  try {
    console.log('Generating viewer URL for document:', {
      fileName: doc.display_name,
      urn: urn,
      version: doc.version_number
    });

    // 调用后端 API 生成 Forge Viewer URL
    const response = await generateViewerUrl(urn, {
      useCurrentToken: true
    });

    if (response.success && response.data?.viewer_url) {
      const viewerUrl = response.data.viewer_url;

      // 在新标签页打开 Forge Viewer
      window.open(viewerUrl, '_blank', 'noopener,noreferrer');

      console.log('Viewer URL generated successfully:', {
        urn,
        viewerUrl,
        fileName: doc.display_name
      });
    } else {
      throw new Error('Failed to generate viewer URL');
    }
  } catch (error) {
    console.error('Failed to open Forge Viewer:', error);
    Message.error(`无法打开预览: ${error.message || '未知错误'}`);
  }
};
</script>
