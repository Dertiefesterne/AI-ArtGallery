import jwt from 'jsonwebtoken'

/**
 * 从请求里取 token：优先 Authorization: Bearer，其次 SSE 用的 query.token
 */
function extractToken(req) {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return req.query.token
}

// 必须登录
export function authRequired(req, res, next) {
  const token = extractToken(req)
  if (!token) return res.status(401).json({ error: '未登录' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: '登录已过期' })
  }
}

// 可选登录（未带 token 也能访问，只是 req.user 为空）
export function optionalAuth(req, res, next) {
  const token = extractToken(req)
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      // 忽略无效 token，按匿名处理
    }
  }
  next()
}
