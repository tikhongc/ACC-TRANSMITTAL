/**
 * Forge Viewer API Service
 *
 * 与后端 Forge Viewer API 通信的服务层
 * 负责：
 * 1. 调用后端 /api/forge-viewer/url 端点生成 Viewer URL
 * 2. 处理网络请求和错误
 */

import { API_BASE_URL } from './config';

/**
 * 生成 Forge Viewer URL
 *
 * @param {string} urn - 文件的 URN (支持短格式和完整格式)
 * @param {Object} options - 可选参数
 * @param {boolean} options.useCurrentToken - 是否使用当前系统 token (默认 true)
 * @param {string} options.token - 自定义 access token
 * @returns {Promise<Object>} API 响应数据，包含 viewer_url
 * @throws {Error} 当请求失败时抛出错误
 */
export async function generateViewerUrl(urn, options = {}) {
  if (!urn) {
    throw new Error('urn is required');
  }

  const { useCurrentToken = true, token = null } = options;

  try {
    const url = `${API_BASE_URL}/api/forge-viewer/url`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urn,
        use_current_token: useCurrentToken,
        token
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate viewer URL');
    }

    return data;
  } catch (error) {
    console.error('Failed to generate viewer URL:', error);
    throw error;
  }
}

/**
 * 批量生成 Forge Viewer URLs
 *
 * @param {Array<string>} urns - 文件 URN 数组
 * @param {Object} options - 可选参数
 * @param {boolean} options.useCurrentToken - 是否使用当前系统 token (默认 true)
 * @param {string} options.token - 自定义 access token
 * @returns {Promise<Object>} API 响应数据，包含 results 数组
 * @throws {Error} 当请求失败时抛出错误
 */
export async function generateBatchViewerUrls(urns, options = {}) {
  if (!urns || !Array.isArray(urns) || urns.length === 0) {
    throw new Error('urns must be a non-empty array');
  }

  const { useCurrentToken = true, token = null } = options;

  try {
    const url = `${API_BASE_URL}/api/forge-viewer/batch-urls`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urns,
        use_current_token: useCurrentToken,
        token
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate batch viewer URLs');
    }

    return data;
  } catch (error) {
    console.error('Failed to generate batch viewer URLs:', error);
    throw error;
  }
}

/**
 * Forge Viewer API 健康检查
 *
 * @returns {Promise<Object>} 健康检查结果
 * @throws {Error} 当请求失败时抛出错误
 */
export async function forgeViewerHealthCheck() {
  try {
    const url = `${API_BASE_URL}/api/forge-viewer/health`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Forge Viewer health check failed:', error);
    throw error;
  }
}
