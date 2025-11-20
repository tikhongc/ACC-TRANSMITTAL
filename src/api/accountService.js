import { API_BASE_URL, apiRequest } from './config';

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>}
 */
export async function getUsers(params = {}) {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    page_size: params.page_size || 100,
    ...params,
  });

  const url = `${API_BASE_URL}/api/accounts/users?${queryParams}`;
  return await apiRequest(url);
}

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>}
 */
export async function getRoles(params = {}) {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    page_size: params.page_size || 100,
    ...params,
  });

  const url = `${API_BASE_URL}/api/accounts/roles?${queryParams}`;
  return await apiRequest(url);
}

/**
 * 获取公司列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>}
 */
export async function getCompanies(params = {}) {
  const queryParams = new URLSearchParams({
    page: params.page || 1,
    page_size: params.page_size || 100,
    ...params,
  });

  const url = `${API_BASE_URL}/api/accounts/companies?${queryParams}`;
  return await apiRequest(url);
}

export default {
  getUsers,
  getRoles,
  getCompanies,
};
