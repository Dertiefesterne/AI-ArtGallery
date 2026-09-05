# AI 艺术画廊 —— 后端服务

Express + Prisma(SQLite) + JWT 的后端，配套前端 `D:\learn\AI-ArtGallery`。

## 目录结构

```
server/
├── .env                 # 本地配置（不要提交）
├── prisma/
│   └── schema.prisma    # 数据模型（User / Artwork / Generation / QueueJob）
└── src/
    ├── index.js         # Express 入口
    ├── db.js            # Prisma 单例
    ├── middleware/auth.js
    └── routes/
        ├── auth.js      # 注册 / 登录 / me
        └── artworks.js  # 作品 CRUD
```

## 首次运行

```bash
cd server
npm install                # 安装依赖
npx prisma generate        # 生成 Prisma Client
npx prisma migrate dev --name init   # 建库（生成仓库根目录 dev.db）
npm run dev                # 启动，默认 http://localhost:3001
```

## 端口 / 跨域

- 后端：`http://localhost:3001`
- 前端（Vite）：`http://localhost:3000`（`vite.config.ts` 里已定）
- `CORS_ORIGIN` 已设为 `http://localhost:3000`，与前端一致

## 说明

- 阶段四（AI 队列）需要的 Redis / BullMQ 暂未引入；AI 服务商确定为 **SiliconFlow**，
  key 从前端 `.env.local` 的 `VITE_SILICONFLOW_API_KEY` 移入本目录 `.env` 的
  `SILICONFLOW_API_KEY`（不要带 `VITE_` 前缀，避免暴露到浏览器）。
- Windows 上跑 Redis 推荐装 **Memurai**（原生），或 Docker Desktop 跑 `redis:7`。
