FROM node:20-alpine
WORKDIR /app
COPY package.json ./
# 必须装全量依赖：prisma 在 devDependencies，generate / migrate 都需要它
RUN npm install --no-audit --no-fund
COPY . .
RUN npx prisma generate
EXPOSE 3001
# 启动前同步数据库结构：
# 优先 migrate deploy（需 prisma/migrations），
# 若没有迁移记录则退回 db push（直接按 schema 建表），保证容器一定能起
CMD ["sh", "-c", "(npx prisma migrate deploy || npx prisma db push) && node src/index.js"]
