// 登录
export function loginAPI(data) {
  return request({
    url: '/login',       // 🌟 注意：不含 /api
    method: 'post',
    data                 // 请求体参数
  })
}

/**
 * 退出登录
 */
export function logoutAPI() {
  return request({
    url: '/logout',
    method: 'get'
  })
}

/**
 * 获取用户信息
 */
export function getUserInfoAPI() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}