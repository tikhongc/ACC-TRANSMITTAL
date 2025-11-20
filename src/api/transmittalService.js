import { API_BASE_URL, PROJECT_ID, apiRequest } from './config';

/**
 * Get transmittal list for project
 * @param {object} params - Query parameters {limit, offset}
 * @returns {Promise<object>} Transmittal list response
 */
export async function getTransmittals(params = {}) {
  const queryParams = new URLSearchParams({
    limit: params.limit || 100,
    offset: params.offset || 0,
    ...params,
  });

  const url = `${API_BASE_URL}/api/transmittals/${PROJECT_ID}/list?${queryParams}`;
  return await apiRequest(url);
}

/**
 * Get documents for a transmittal
 * @param {string} transmittalId - Transmittal ID (UUID)
 * @returns {Promise<object>} Document list response
 */
export async function getTransmittalDocuments(transmittalId) {
  const url = `${API_BASE_URL}/api/transmittals/${transmittalId}/documents`;
  return await apiRequest(url);
}

/**
 * Get recipients for a transmittal
 * @param {string} transmittalId - Transmittal ID (UUID)
 * @returns {Promise<object>} Recipients response (members + non-members)
 */
export async function getTransmittalRecipients(transmittalId) {
  const url = `${API_BASE_URL}/api/transmittals/${transmittalId}/recipients`;
  return await apiRequest(url);
}

/**
 * Mark transmittal as viewed by user
 * @param {string} transmittalId - Transmittal ID (UUID)
 * @param {string} email - User email
 * @returns {Promise<object>} Mark viewed response
 */
export async function markTransmittalViewed(transmittalId, email) {
  const url = `${API_BASE_URL}/api/transmittals/${transmittalId}/mark-viewed`;
  return await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Mark transmittal as downloaded by user
 * @param {string} transmittalId - Transmittal ID (UUID)
 * @param {string} email - User email
 * @returns {Promise<object>} Mark downloaded response
 */
export async function markTransmittalDownloaded(transmittalId, email) {
  const url = `${API_BASE_URL}/api/transmittals/${transmittalId}/mark-downloaded`;
  return await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Download all transmittal files as ZIP
 * @param {string} transmittalId - Transmittal ID (UUID)
 * @param {string} email - User email (optional)
 * @returns {Promise<Blob>} ZIP file blob
 */
export async function downloadTransmittalZip(transmittalId, email = null) {
  const url = `${API_BASE_URL}/api/transmittals/${transmittalId}/download-zip`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(email ? { email } : {}),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Download failed');
  }

  // Get custom headers
  const fileCount = response.headers.get('X-File-Count');
  const totalSize = response.headers.get('X-Total-Size');
  const failedFiles = response.headers.get('X-Failed-Files');

  const blob = await response.blob();

  // Attach metadata to blob
  blob.metadata = {
    fileCount: fileCount ? parseInt(fileCount) : 0,
    totalSize: totalSize ? parseInt(totalSize) : 0,
    failedFiles: failedFiles ? JSON.parse(failedFiles) : [],
  };

  return blob;
}

/**
 * Create a new transmittal
 * @param {object} data - Transmittal data
 * @returns {Promise<object>} Create response with transmittal_id
 */
export async function createTransmittal(data) {
  const url = `${API_BASE_URL}/api/transmittals/create`;
  return await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Add documents to a transmittal
 * @param {string} transmittalId - Transmittal ID (UUID)
 * @param {object} data - Documents data { documents: [...] }
 * @returns {Promise<object>} Add documents response
 */
export async function addTransmittalDocuments(transmittalId, data) {
  const url = `${API_BASE_URL}/api/transmittals/${transmittalId}/documents`;
  return await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Add recipients to a transmittal
 * @param {string} transmittalId - Transmittal ID (UUID)
 * @param {object} data - Recipients data { recipients: [...] }
 * @returns {Promise<object>} Add recipients response
 */
export async function addTransmittalRecipients(transmittalId, data) {
  const url = `${API_BASE_URL}/api/transmittals/${transmittalId}/recipients`;
  return await apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
