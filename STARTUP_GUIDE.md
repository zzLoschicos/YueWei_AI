# 阅微 AI 诊断系统 · 启动指南

> 版本：1.0.0
> 更新：2026-04-17

---

## 系统架构

```
┌─────────────────┐         ┌─────────────────┐
│   前端 (HTML)    │ ──────▶ │   后端 (Node.js) │
│   localhost:3001 │ HTTP    │   localhost:3002 │
└─────────────────┘         └─────────────────┘
```

---

## 快速启动

### 方式一：一键启动（推荐）

```bash
# 在项目根目录执行
cd F:/013.\ Obsidian/docs/Edu_Project/YueWei_AI_Enterprise

# Windows
start.bat

# 或手动启动两个终端
```

### 方式二：分别启动

**1. 启动后端服务**

```bash
cd server

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key

# 启动服务
npm start
```

后端运行在：`http://localhost:3002`

**2. 启动前端服务**

```bash
# 安装静态服务器（如果还没有）
npm install -g serve

# 在 frontend 目录启动
serve . -l 3001
```

前端运行在：`http://localhost:3001`

---

## 环境配置

### 1. 配置 DeepSeek API Key

编辑 `server/.env` 文件：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
JWT_SECRET=your_jwt_secret_here
PORT=3002
```

### 2. 获取 DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册并登录账号
3. 在「API Keys」页面创建新的 Key
4. 复制并填入 `.env` 文件

---

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `admin123` |

---

## 访问地址

| 服务 | 地址 |
|------|------|
| 前端首页 | http://localhost:3001 |
| 教师端 | http://localhost:3001/teacher/dashboard.html |
| 学生端 | http://localhost:3001/student/submit.html |
| 后端 API | http://localhost:3002 |
| 健康检查 | http://localhost:3002/health |

---

## 目录结构

```
YueWei_AI_Enterprise/
│
├── index.html              # 前端入口页
│
├── css/
│   └── styles.css          # 样式文件
│
├── js/
│   └── app.js              # 前端核心 JS
│
├── teacher/                # 教师端页面
│   ├── login.html          # 登录页
│   ├── dashboard.html      # 数据看板
│   ├── invite-codes.html   # 邀请码管理
│   ├── questions.html      # 题目管理
│   ├── reports.html        # 报告查看
│   ├── methodology.html    # 方法论标准库
│   └── settings.html       # 系统设置
│
├── student/                # 学生端页面
│   ├── submit.html         # 智能诊断舱
│   └── archive.html        # 历史档案库
│
└── server/                # 后端服务
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js        # 入口文件
        ├── app.js          # Fastify 配置
        ├── plugins/        # 插件
        ├── routes/         # 路由
        └── db/             # 数据库
```

---

## 常见问题

### 1. 后端启动失败

**错误**：端口已被占用
```bash
# 检查端口占用
netstat -ano | findstr :3002

# 或修改 .env 中的 PORT
```

**错误**：缺少依赖
```bash
cd server
npm install
```

### 2. 前端无法连接后端

**问题**：跨域错误
**解决**：确保后端已启动在 3002 端口，且前端页面通过 `serve` 启动（不要直接打开 HTML 文件）

**问题**：网络错误
**解决**：检查浏览器控制台，确认后端服务是否正常运行

### 3. AI 诊断功能不可用

**问题**：DeepSeek API 返回错误
**解决**：
1. 确认 `.env` 中 API Key 正确
2. 检查 API 额度是否充足
3. 查看后端控制台日志

---

## 开发模式

```bash
# 后端热重载
cd server
npm run dev

# 前端热重载（需要 serve）
serve . -l 3001 -i
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + JavaScript (ES6+) + Tailwind CDN |
| 后端 | Node.js + Fastify + better-sqlite3 |
| AI | DeepSeek API |
| 数据库 | SQLite |

---

## 部署到生产环境

### Railway（推荐）

1. 将代码推送到 GitHub
2. 在 Railway 中导入项目
3. 配置环境变量 `DEEPSEEK_API_KEY`
4. Railway 自动部署

### 手动部署

```bash
# 1. 打包前端
zip -r frontend.zip css js teacher student index.html

# 2. 部署后端
pm2 start server/src/index.js --name yuewei-ai

# 3. 配置 Nginx 反向代理
```

---

*有问题？请查看 DEV_DOCUMENT.md 或提交 Issue*
