import { Router } from 'express'
import { prisma } from '../db.js'
import { authRequired, optionalAuth } from '../middleware/auth.js'

const router = Router()

// 列表：公开作品所有人可见；私有仅作者可见
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const where = req.user
      ? { OR: [{ isPublic: true }, { authorId: req.user.id }] }
      : { isPublic: true }
    const artworks = await prisma.artwork.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    })
    res.json(artworks)
  } catch (e) {
    next(e)
  }
})

// 详情
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: req.params.id },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    })
    if (!artwork) return res.status(404).json({ error: '作品不存在' })
    if (!artwork.isPublic && artwork.authorId !== req.user?.id) {
      return res.status(403).json({ error: '无权限查看' })
    }
    res.json(artwork)
  } catch (e) {
    next(e)
  }
})

// 新增（需登录）
router.post('/', authRequired, async (req, res, next) => {
  try {
    const { title, description, imageUrl, thumbnailUrl, tags, isPublic } = req.body
    if (!title || !imageUrl) return res.status(400).json({ error: '标题和图片地址必填' })

    const artwork = await prisma.artwork.create({
      data: {
        title,
        description: description || '',
        imageUrl,
        thumbnailUrl: thumbnailUrl || null,
        tags: tags || '',
        isPublic: isPublic ?? true,
        authorId: req.user.id,
      },
    })
    res.status(201).json(artwork)
  } catch (e) {
    next(e)
  }
})

// 删除（仅作者）
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const artwork = await prisma.artwork.findUnique({ where: { id: req.params.id } })
    if (!artwork) return res.status(404).json({ error: '作品不存在' })
    if (artwork.authorId !== req.user.id) return res.status(403).json({ error: '无权限删除' })
    await prisma.artwork.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

export default router
