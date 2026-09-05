# ---- 构建阶段 ----
FROM node:20-alpine AS build
WORKDIR /app
# 项目使用 npm（无 pnpm-lock），直接 npm install 即可
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
# 注入 API 基址：同源 /api（nginx 再反代到后端）
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

# ---- 运行阶段：nginx 托管静态文件 ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
