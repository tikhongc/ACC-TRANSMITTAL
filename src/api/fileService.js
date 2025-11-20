import { API_BASE_URL, PROJECT_ID, apiRequest } from './config';

/**
 * Get project file tree
 * @returns {Promise<Object>}
 */
export async function getFileTree() {
  const url = `${API_BASE_URL}/api/file-tree?project_id=${PROJECT_ID}`;
  return await apiRequest(url);
}

/**
 * Get folder contents
 * @param {string} folderId - Folder ID
 * @returns {Promise<Object>}
 */
export async function getFolderContents(folderId) {
  const url = `${API_BASE_URL}/api/folders/${folderId}/contents?project_id=${PROJECT_ID}`;
  return await apiRequest(url);
}

/**
 * Get file versions
 * @param {string} fileUrn - File URN
 * @returns {Promise<Object>}
 */
export async function getFileVersions(fileUrn) {
  const url = `${API_BASE_URL}/api/files/${encodeURIComponent(fileUrn)}/versions`;
  return await apiRequest(url);
}

/**
 * Search files
 * @param {string} searchTerm - Search keyword
 * @returns {Promise<Object>}
 */
export async function searchFiles(searchTerm) {
  const params = new URLSearchParams({
    project_id: PROJECT_ID,
    q: searchTerm,
  });

  const url = `${API_BASE_URL}/api/files/search?${params}`;
  return await apiRequest(url);
}
