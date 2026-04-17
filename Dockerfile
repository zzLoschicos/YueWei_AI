# 阅微 AI 诊断系统 · Docker 配置
FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY server/package*.json ./
RUN npm ci --only=production

# 复制后端代码
COPY server/src ./src
COPY server/data ./data

# 暴露端口
EXPOSE 3002

# 环境变量（生产环境请通过 -e 参数或 docker-compose 传入）
ENV NODE_ENV=production
ENV PORT=3002
ENV HOST=0.0.0.0

# 启动命令
CMD ["node", "src/index.js"]
