import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import artworkRoutes from './routes/artworks.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())

// 静态资源：上传的图片（阶段三使用）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.use('/api/auth', authRoutes)
app.use('/api/artworks', artworkRoutes)

// 404
app.use((req, res) => res.status(404).json({ error: 'Not Found' }))

// 统一错误处理
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`🚀 后端运行在 http://localhost:${PORT}`)
})
