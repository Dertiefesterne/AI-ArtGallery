import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, avatar: u.avatar }
}

// 注册
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: '邮箱和密码必填' })
    if (String(password).length < 6) return res.status(400).json({ error: '密码至少 6 位' })

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: '该邮箱已注册' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hashed, name } })
    const token = signToken(user)
    res.status(201).json({ token, user: publicUser(user) })
  } catch (e) {
    next(e)
  }
})

// 登录
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: '邮箱和密码必填' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: '邮箱或密码错误' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: '邮箱或密码错误' })

    const token = signToken(user)
    res.json({ token, user: publicUser(user) })
  } catch (e) {
    next(e)
  }
})

// 获取当前用户（SSE 也可通过 ?token=xxx 访问）
router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user })
})

export default router
