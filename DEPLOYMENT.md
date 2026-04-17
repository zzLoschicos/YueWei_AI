# 阅微 AI 诊断系统 · 部署教程

> 版本：1.0.0 | 更新：2026-04-17

---

## 方式一：Docker 部署（推荐 ⭐）

### 前置条件
- 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac)
- 或 Docker Engine + Docker Compose (Linux)

### 快速启动

```bash
# 1. 克隆项目
git clone <项目地址>
cd YueWei_AI_Enterprise

# 2. 配置环境变量
cp server/.env.production server/.env
# 编辑 server/.env，填写：
#   - DEEPSEEK_API_KEY（必须）
#   - JWT_SECRET（必须，建议使用随机字符串）

# 3. 启动服务
docker-compose up -d

# 4. 验证服务
curl http://localhost:8080/health
```

**访问地址：**
- 前端：http://localhost:8080
- 教师后台：http://localhost:8080/teacher/
- 学生端：http://localhost:8080/student/
- API：http://localhost:8080/api/

### 生产环境 Nginx 反向代理

```bash
# 使用 Nginx + Docker 组合（已配置反向代理到 /api/）
docker-compose up -d nginx-proxy
```

### 停止服务

```bash
docker-compose down
# 保留数据
docker-compose down -v  # 删除数据
```

---

## 方式二：Railway 部署（免费额度）

### 前置条件
- [Railway](https://railway.app) 账号（可用 GitHub 登录）

### 部署步骤

1. **上传代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **在 Railway 创建项目**
   - 访问 https://railway.app/dashboard
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择刚才上传的仓库

3. **配置环境变量**
   - 进入项目 → Settings → Environment Variables
   - 添加以下变量：
     ```
     DEEPSEEK_API_KEY = sk-xxxxxxxx
     DEEPSEEK_API_URL = https://api.deepseek.com/v1/chat/completions
     JWT_SECRET = <随机字符串，推荐32位>
     NODE_ENV = production
     PORT = 3002
     DB_PATH = /var/data/yuewei.db
     ```

4. **挂载持久化存储**
   - Railway Dashboard → Service → Settings → Disk
   - Add Disk，Size 建议 1GB
   - Mount Path: `/var/data`

5. **部署验证**
   - 访问 `https://<your-railway-app>.up.railway.app/health`
   - 教师后台：`https://<your-railway-app>.up.railway.app/teacher/`

---

## 方式三：Render 部署（免费额度）

### 前置条件
- [Render](https://render.com) 账号

### 部署步骤

1. **上传到 GitHub**（同上）

2. **创建 Web Service**
   - 访问 https://dashboard.render.com
   - 点击 "New" → "Web Service"
   - 连接 GitHub 仓库

3. **配置构建命令**
   ```
   Build Command: cd server && npm install
   Start Command: cd server && node src/index.js
   ```

4. **环境变量**（在 Dashboard 添加）
   - `NODE_ENV = production`
   - `PORT = 3002`
   - `JWT_SECRET`（点击 Generate 生成）
   - `DEEPSEEK_API_KEY = sk-xxx`
   - `DEEPSEEK_API_URL = https://api.deepseek.com/v1/chat/completions`

5. **添加 Persistent Disk**
   - 创建时勾选 或 后续添加
   - Size: 1GB，Mount Path: `/var/data`

6. **自定义域名（可选）**
   - Settings → Custom Domains

---

## 方式四：传统云服务器

### 环境要求
- Ubuntu 20.04+ / CentOS 8+
- Node.js 18+
- Nginx
- Git

### 部署步骤

```bash
# 1. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装 Nginx
sudo apt-get install -y nginx

# 3. 安装 PM2（进程管理）
sudo npm install -g pm2

# 4. 拉取代码
cd /var/www
sudo git clone <repo-url> yuewei
cd yuewei

# 5. 配置
cp server/.env.production server/.env
nano server/.env  # 填写 DEEPSEEK_API_KEY 和 JWT_SECRET

# 6. 安装依赖并构建
cd server
npm install --production

# 7. 配置 Nginx
sudo cp ../nginx/nginx.conf /etc/nginx/sites-available/yuewei
sudo ln -s /etc/nginx/sites-available/yuewei /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. 启动（PM2）
pm2 start server/src/index.js --name yuewei
pm2 save
pm2 startup  # 设置开机自启

# 9. 配置 SSL（Let's Encrypt）
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 前端修改 API 地址

部署到生产环境后，需要修改前端文件的 API 地址：

**文件路径：** `teacher/*.html`, `student/*.html`

找到并替换：
```javascript
const API_BASE = 'http://localhost:3002';  // 开发环境
```

替换为（生产环境）：
```javascript
const API_BASE = 'https://your-backend-domain.com';  // 你的后端地址
```

> **提示：** 如果使用 Nginx 反向代理（`/api/` 路径），且前后端同源部署，前端 `API_BASE` 可直接留空或设为 `/api`。

---

## 验证部署成功

```bash
# 1. 健康检查
curl https://your-domain.com/health
# 预期返回：{"status":"ok","timestamp":"..."}

# 2. 登录测试
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# 预期返回：{"code":0,"data":{"token":"..."}}

# 3. 浏览器访问
# 教师后台：https://your-domain.com/teacher/
# 学生端：https://your-domain.com/student/
```

---

## 常见问题

### Q: Docker 启动失败？
```bash
# 检查端口占用
netstat -an | grep 3002

# 查看容器日志
docker-compose logs backend
```

### Q: 数据库文件权限错误？
```bash
# Linux 下修复权限
sudo chown -R 1000:1000 ./data
```

### Q: API 返回 401 未登录？
- 检查 `JWT_SECRET` 是否设置
- 检查 Token 是否正确传递（`Authorization: Bearer <token>`）

### Q: DeepSeek API 调用失败？
- 检查 `DEEPSEEK_API_KEY` 是否正确
- 检查服务器网络能否访问 `api.deepseek.com`
- 查看后端日志确认具体错误信息

### Q: 免费版冷启动慢？
Railway/Render 免费版闲置后会休眠，首次访问约需 20-30 秒启动，这是正常现象。升级付费版可避免冷启动。

---

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

> ⚠️ 生产环境请立即修改默认密码！
