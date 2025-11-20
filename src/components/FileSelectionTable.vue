<template>
  <div class="file-tree-container">
    <!-- Search bar -->
    <div class="mb-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search files and folders..."
          class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          class="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <!-- File tree -->
    <div class="file-tree-content border border-gray-200 rounded-lg overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="error" class="p-4 text-red-600">
        {{ error }}
      </div>

      <div v-else class="max-h-[500px] overflow-y-auto">
        <!-- Tree nodes -->
        <div class="divide-y divide-gray-100">
          <TreeNode
            v-for="node in filteredTreeData"
            :key="node.id"
            :node="node"
            :level="0"
            :selected-files="selectedFileUrns"
            :expanded-folders="expandedFolders"
            @toggle-folder="toggleFolder"
            @select-file="handleFileSelect"
          />
        </div>

        <div v-if="filteredTreeData.length === 0" class="p-8 text-center text-gray-500">
          <svg
            class="mx-auto h-12 w-12 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p>No files or folders found</p>
        </div>
      </div>
    </div>

    <!-- Selected files summary -->
    <div v-if="selectedFiles.length > 0" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-sm font-medium text-blue-900">
            Selected <strong>{{ selectedFiles.length }}</strong> file(s)
          </span>
        </div>
        <button
          @click="clearSelection"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear All
        </button>
      </div>

      <!-- Selected files list (collapsed) -->
      <div v-if="selectedFiles.length > 0 && selectedFiles.length <= 5" class="mt-2 space-y-1">
        <div
          v-for="file in selectedFiles"
          :key="file.urn"
          class="text-xs text-blue-800 flex items-center gap-1"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ file.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { getFileTree } from '@/api/fileService';
import TreeNode from './TreeNode.vue';

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const treeData = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const expandedFolders = ref(new Set());
const selectedFileUrns = ref(new Set());

// Load file tree
async function loadFileTree() {
  try {
    loading.value = true;
    error.value = null;
    const response = await getFileTree();

    console.log('File tree response:', response);

    // Extract root data from response
    let rootData = null;
    if (response.data && Array.isArray(response.data.root)) {
      rootData = response.data.root;
    } else if (response.success && response.data && Array.isArray(response.data.root)) {
      rootData = response.data.root;
    } else if (Array.isArray(response.data)) {
      rootData = response.data;
    } else if (response.success && Array.isArray(response.data)) {
      rootData = response.data;
    }

    if (!Array.isArray(rootData)) {
      throw new Error('Invalid file tree data format');
    }

    treeData.value = rootData;
    console.log('Loaded tree data:', treeData.value);
  } catch (err) {
    error.value = `Failed to load files: ${err.message}`;
    Message.error(error.value);
    console.error('Failed to load files:', err);
  } finally {
    loading.value = false;
  }
}

// Filter tree data based on search query
const filteredTreeData = computed(() => {
  if (!searchQuery.value.trim()) {
    return treeData.value;
  }

  const query = searchQuery.value.toLowerCase();

  function filterNode(node) {
    const nameMatch = node.name.toLowerCase().includes(query);

    if (node.type === 'file') {
      return nameMatch ? node : null;
    }

    // For folders, check if name matches or any children match
    const filteredChildren = node.children
      ? node.children.map(filterNode).filter(Boolean)
      : [];

    if (nameMatch || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  }

  return treeData.value.map(filterNode).filter(Boolean);
});

// Toggle folder expansion
function toggleFolder(folderId) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId);
  } else {
    expandedFolders.value.add(folderId);
  }
  // Trigger reactivity
  expandedFolders.value = new Set(expandedFolders.value);
}

// Handle file selection
function handleFileSelect(file) {
  if (selectedFileUrns.value.has(file.urn)) {
    selectedFileUrns.value.delete(file.urn);
  } else {
    selectedFileUrns.value.add(file.urn);
  }
  // Trigger reactivity
  selectedFileUrns.value = new Set(selectedFileUrns.value);
  updateModelValue();
}

// Clear all selections
function clearSelection() {
  selectedFileUrns.value.clear();
  selectedFileUrns.value = new Set();
  updateModelValue();
}

// Get all selected files with details
const selectedFiles = computed(() => {
  const files = [];

  function collectFiles(nodes) {
    for (const node of nodes) {
      if (node.type === 'file' && selectedFileUrns.value.has(node.urn)) {
        files.push({
          urn: node.urn,
          name: node.name,
          file_type: node.file_type,
          version_number: node.version_number || 1,
          size: node.size,
        });
      }
      if (node.children && node.children.length > 0) {
        collectFiles(node.children);
      }
    }
  }

  collectFiles(treeData.value);
  return files;
});

// Update v-model
function updateModelValue() {
  const selectedFileData = selectedFiles.value
    .filter((file) => file.urn) // Only include files with valid URN
    .map((file) => ({
      file_urn: file.urn,
      file_name: file.name,
      version_number: file.version_number,
    }));
  emit('update:modelValue', selectedFileData);
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      selectedFileUrns.value = new Set(newValue.map((file) => file.file_urn));
    } else {
      selectedFileUrns.value = new Set();
    }
  },
  { immediate: true }
);

// Watch search query to auto-expand matching folders
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    // Auto-expand all folders when searching
    function expandAll(nodes) {
      for (const node of nodes) {
        if (node.type === 'folder') {
          expandedFolders.value.add(node.id);
          if (node.children && node.children.length > 0) {
            expandAll(node.children);
          }
        }
      }
    }
    expandAll(treeData.value);
    expandedFolders.value = new Set(expandedFolders.value);
  }
});

onMounted(() => {
  loadFileTree();
});
</script>

<style scoped>
.file-tree-container {
  width: 100%;
}

.file-tree-content {
  background-color: white;
}

/* Custom scrollbar */
.file-tree-content > div {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.file-tree-content > div::-webkit-scrollbar {
  width: 8px;
}

.file-tree-content > div::-webkit-scrollbar-track {
  background: #f7fafc;
}

.file-tree-content > div::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
}

.file-tree-content > div::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style>
