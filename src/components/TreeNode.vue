<template>
  <div class="tree-node">
    <!-- Folder Node -->
    <div
      v-if="node.type === 'folder'"
      class="folder-node hover:bg-gray-50 transition-colors"
      :style="{ paddingLeft: `${level * 20 + 12}px` }"
    >
      <div class="flex items-center py-2 pr-3 cursor-pointer select-none" @click="handleFolderClick">
        <!-- Expand/Collapse Icon -->
        <div class="w-5 h-5 mr-1 flex items-center justify-center flex-shrink-0">
          <svg
            v-if="hasChildren"
            class="w-4 h-4 text-gray-600 transition-transform duration-200"
            :class="{ 'rotate-90': isExpanded }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <!-- Folder Icon -->
        <div class="mr-2 flex-shrink-0">
          <svg
            class="w-5 h-5"
            :class="isExpanded ? 'text-blue-500' : 'text-gray-400'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              v-if="isExpanded"
              d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
            />
            <path
              v-else
              fill-rule="evenodd"
              d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- Folder Name -->
        <div class="flex-1 min-w-0">
          <span class="text-sm font-medium text-gray-700 truncate block">{{ node.name }}</span>
        </div>

        <!-- File Count Badge -->
        <div
          v-if="fileCount > 0"
          class="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full flex-shrink-0"
        >
          {{ fileCount }}
        </div>
      </div>
    </div>

    <!-- File Node -->
    <div
      v-else-if="node.type === 'file'"
      class="file-node hover:bg-blue-50 transition-colors"
      :class="{ 'bg-blue-50': isSelected }"
      :style="{ paddingLeft: `${level * 20 + 12}px` }"
    >
      <div class="flex items-center py-2 pr-3 cursor-pointer select-none" @click="handleFileClick">
        <!-- Checkbox -->
        <div class="w-5 h-5 mr-1 flex items-center justify-center flex-shrink-0">
          <div
            class="w-4 h-4 border-2 rounded flex items-center justify-center transition-all"
            :class="
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 hover:border-blue-400'
            "
          >
            <svg
              v-if="isSelected"
              class="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <!-- File Icon -->
        <div class="mr-2 flex-shrink-0">
          <svg class="w-5 h-5" :class="getFileIconColor(node.file_type)" viewBox="0 0 20 20">
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- File Name and Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2">
            <span class="text-sm text-gray-700 truncate block">{{ node.name }}</span>
            <span
              v-if="node.file_type"
              class="text-xs text-gray-400 uppercase flex-shrink-0"
            >
              {{ node.file_type }}
            </span>
          </div>
        </div>

        <!-- File Metadata -->
        <div class="ml-2 flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
          <!-- Version -->
          <span v-if="node.version_number" class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            v{{ node.version_number }}
          </span>

          <!-- File Size -->
          <span v-if="node.size" class="hidden sm:inline">
            {{ formatFileSize(node.size) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Children (Recursive) -->
    <div v-if="node.type === 'folder' && isExpanded && hasChildren" class="folder-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-files="selectedFiles"
        :expanded-folders="expandedFolders"
        @toggle-folder="$emit('toggle-folder', $event)"
        @select-file="$emit('select-file', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  selectedFiles: {
    type: Set,
    required: true,
  },
  expandedFolders: {
    type: Set,
    required: true,
  },
});

const emit = defineEmits(['toggle-folder', 'select-file']);

// Check if folder is expanded
const isExpanded = computed(() => {
  return props.node.type === 'folder' && props.expandedFolders.has(props.node.id);
});

// Check if file is selected
const isSelected = computed(() => {
  return props.node.type === 'file' && props.selectedFiles.has(props.node.urn);
});

// Check if folder has children
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

// Count files in folder (recursive)
const fileCount = computed(() => {
  if (props.node.type !== 'folder') return 0;

  function countFiles(node) {
    let count = 0;
    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'file') {
          count++;
        } else if (child.type === 'folder') {
          count += countFiles(child);
        }
      }
    }
    return count;
  }

  return countFiles(props.node);
});

// Handle folder click
function handleFolderClick() {
  emit('toggle-folder', props.node.id);
}

// Handle file click
function handleFileClick() {
  emit('select-file', {
    urn: props.node.urn,
    name: props.node.name,
    file_type: props.node.file_type,
    version_number: props.node.version_number,
  });
}

// Get file icon color based on file type
function getFileIconColor(fileType) {
  const colorMap = {
    pdf: 'text-red-500',
    doc: 'text-blue-600',
    docx: 'text-blue-600',
    xls: 'text-green-600',
    xlsx: 'text-green-600',
    ppt: 'text-orange-500',
    pptx: 'text-orange-500',
    dwg: 'text-purple-500',
    rvt: 'text-indigo-600',
    ifc: 'text-cyan-600',
    jpg: 'text-pink-500',
    jpeg: 'text-pink-500',
    png: 'text-pink-500',
    gif: 'text-pink-500',
    mp4: 'text-purple-600',
    mp3: 'text-yellow-600',
    txt: 'text-gray-500',
    md: 'text-gray-600',
    json: 'text-yellow-500',
    xml: 'text-orange-400',
    csv: 'text-green-500',
  };

  return colorMap[fileType?.toLowerCase()] || 'text-gray-400';
}

// Format file size
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '-';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.folder-node,
.file-node {
  border-bottom: 1px solid transparent;
}

.folder-node:hover,
.file-node:hover {
  border-bottom-color: #e5e7eb;
}

.rotate-90 {
  transform: rotate(90deg);
}
</style>
