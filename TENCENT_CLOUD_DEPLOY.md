# 阅微 AI 诊断系统 · 腾讯云部署教程

> 目标：前端 Vercel，后端 + 数据库在自己的腾讯云服务器
> 服务器系统：Ubuntu 22.04

---

## 一、前置准备

### 1.1 服务器环境确认

通过 SSH 连接到你的腾讯云服务器：

```bash
ssh root@你的服务器IP
# 或
ssh ubuntu@你的服务器IP
```

确认系统信息：

```bash
cat /etc/os-release
# 确认显示 Ubuntu 22.04
```

### 1.2 安装基础软件

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 Nginx
apt install -y nginx

# 安装 PM2（进程管理器）
npm install -g pm2

# 安装 Certbot（SSL 证书）
apt install -y certbot python3-certbot-nginx

# 确认版本
node -v    # 应该显示 v18.x.x
npm -v
nginx -v
pm2 -v
```

### 1.3 开放防火墙端口

在腾讯云控制台「安全组」中开放以下端口：

| 端口 | 用途 |
|------|------|
| 22 | SSH（已开放） |
| 80 | HTTP（HTTP 访问） |
| 443 | HTTPS（SSL 证书） |
| 3002 | 后端 API（仅 Nginx 代理访问，对外不开放） |

```bash
# 在服务器上确认防火墙
ufw status
# 如果是 active，开放端口
ufw allow 80/tcp
ufw allow 443/tcp
```

---

## 二、后端部署（腾讯云服务器）

### 2.1 创建项目目录

```bash
mkdir -p /var/www/yuewei
cd /var/www/yuewei

# 创建数据目录（SQLite 数据库）
mkdir -p data logs
```

### 2.2 上传代码到服务器

**方式 A：通过 Git（推荐）**

如果代码在 GitHub/Gitee：

```bash
cd /var/www/yuewei
git clone <你的仓库地址> .
```

**方式 B：直接打包上传**

如果不能 Git，在本地打包后用 scp 上传：

```bash
# 本地电脑执行（PowerShell 或 Git Bash）
scp -r ./YueWei_AI_Enterprise root@你的服务器IP:/var/www/yuewei
```

### 2.3 配置环境变量

```bash
cd /var/www/yuewei/server
cp .env.production .env
nano .env
```

填写以下内容：

```bash
# 必须填写
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=这里写一个随机字符串（至少32位）

# 建议填写（保持默认也可以）
PORT=3002
HOST=0.0.0.0
NODE_ENV=production
DB_PATH=/var/www/yuewei/server/data/yuewei.db
```

**生成随机 JWT_SECRET：**
```bash
openssl rand -base64 32
# 复制输出的字符串填入 JWT_SECRET
```

### 2.4 安装依赖并测试

```bash
cd /var/www/yuewei/server
npm install

# 启动测试（先不后台运行）
node src/index.js
```

看到类似输出说明启动成功：
```
Server running at http://localhost:3002
```

按 `Ctrl+C` 停止测试。

### 2.5 使用 PM2 后台运行

```bash
cd /var/www/yuewei/server

# 启动服务
pm2 start src/index.js --name yuewei

# 设置开机自启
pm2 save
pm2 startup

# 查看状态
pm2 status
pm2 logs yuewei
```

---

## 三、配置 Nginx 反向代理

### 3.1 创建 Nginx 配置

```bash
nano /etc/nginx/sites-available/yuewei
```

粘贴以下内容（把 `your_server_ip` 替换成你的服务器 IP）：

```nginx
# 后端 API 服务
upstream yuewei_backend {
    server 127.0.0.1:3002;
    keepalive 64;
}

server {
    listen 80;
    server_name your_server_ip;  # 如果有域名，填域名；没有域名填服务器IP

    # 记录日志
    access_log /var/www/yuewei/logs/access.log;
    error_log /var/www/yuewei/logs/error.log;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # API 反向代理
    location /api/ {
        proxy_pass http://yuewei_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://yuewei_backend;
        proxy_http_version 1.1;
        proxy_connect_timeout 5s;
    }

    # 根路径跳转提示
    location / {
        return 200 '阅微 AI 后端服务已启动';
    }
}
```

### 3.2 启用配置

```bash
# 移除默认配置（如果有）
rm -f /etc/nginx/sites-enabled/default

# 启用本项目配置
ln -s /etc/nginx/sites-available/yuewei /etc/nginx/sites-enabled/

# 测试配置是否正确
nginx -t

# 重载 Nginx
systemctl reload nginx
```

### 3.4 验证后端

```bash
# 测试 API
curl http://localhost/health
# 预期返回：{"status":"ok","timestamp":"..."}

# 测试登录接口
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# 预期返回：{"code":0,"data":{"token":"..."}}
```

---

## 四、配置 SSL 证书（HTTP → HTTPS）

### 4.1 如果有域名（推荐）

```bash
# 停止 Nginx（Certbot 需要）
systemctl stop nginx

# 获取证书（自动配置 Nginx）
certbot --nginx -d your-domain.com

# 启动 Nginx
systemctl start nginx

# 测试 HTTPS
curl https://your-domain.com/health
```

### 4.2 如果只有 IP 地址

IP 地址无法申请正式 SSL 证书。可以选择：

**方案 A：使用自签名证书（浏览器会提示不安全，不推荐生产环境）**

```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/yuewei.key \
  -out /etc/ssl/certs/yuewei.crt

# 修改 Nginx 配置支持 HTTPS
nano /etc/nginx/sites-available/yuewei
```

**方案 B：使用 Cloudflare 免费代理（推荐 ⭐）**

1. 注册 [Cloudflare](https://cloudflare.com)
2. 添加你的域名
3. 修改域名 DNS 指向 Cloudflare
4. Cloudflare 会自动给你签发免费 SSL 证书
5. 后端通过 Cloudflare 代理访问，无需在服务器配置证书

**方案 C：直接用 HTTP 访问（快速验证）**

跳过 SSL 步骤，直接用 HTTP 访问后端验证功能。

---

## 五、前端部署到 Vercel

### 5.1 修改前端 API 地址

在本地项目中，修改所有 HTML 文件的 API 地址：

**需要修改的文件：**
```
teacher/*.html
student/*.html
```

找到所有：
```javascript
const API_BASE = 'http://localhost:3002';
```

替换为你的后端地址（如果配置了域名）：
```javascript
const API_BASE = 'https://your-domain.com';
```

或者直接用服务器 IP：
```javascript
const API_BASE = 'http://你的服务器IP';
```

### 5.2 上传到 GitHub

```bash
cd 你的项目目录
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/yuewei-ai.git
git push -u origin main
```

### 5.3 部署到 Vercel

1. 访问 https://vercel.com，用 GitHub 账号登录
2. 点击 "Add New Project"
3. 选择 `yuewei-ai` 仓库
4. Framework Preset 选择 "Other"
5. 填写：
   - Build Command: （留空）
   - Output Directory: `.`
6. 点击 "Deploy"

部署完成后，Vercel 会给你一个地址，例如：`https://yuewei-ai.vercel.app`

### 5.4 在 Vercel 配置环境变量（可选）

如果前端需要区分开发/生产 API 地址：

Vercel Dashboard → 项目 → Settings → Environment Variables

```
NODE_ENV = production
API_BASE = https://your-domain.com
```

---

## 六、验证完整系统

### 6.1 后端验证

```bash
# 健康检查
curl http://你的服务器IP/health

# 登录测试
curl -X POST http://你的服务器IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 6.2 前端验证

1. 打开 Vercel 给的地址，例如：`https://yuewei-ai.vercel.app/teacher/`
2. 用账号登录：admin / admin123
3. 测试创建题目、生成邀请码
4. 学生端提交诊断，查看报告

---

## 七、域名绑定（可选）

如果你有域名，绑定后可以用 `https://your-domain.com` 访问。

### 7.1 在 Vercel 配置自定义域名

Vercel Dashboard → 项目 → Settings → Domains

添加你的域名，按提示在 DNS 中添加记录。

### 7.2 在 Nginx 配置域名

修改 `/etc/nginx/sites-available/yuewei`：

```nginx
server_name your-domain.com;  # 替换成你的域名
```

然后重载 Nginx：
```bash
systemctl reload nginx
```

---

## 八、日常维护

### 查看日志

```bash
# PM2 日志
pm2 logs yuewei

# Nginx 日志
tail -f /var/www/yuewei/logs/access.log
tail -f /var/www/yuewei/logs/error.log
```

### 重启服务

```bash
# 重启后端
pm2 restart yuewei

# 重载 Nginx
systemctl reload nginx
```

### 更新代码

```bash
cd /var/www/yuewei
git pull

cd server
npm install
pm2 restart yuewei
```

### 备份数据库

```bash
# 停止服务
pm2 stop yuewei

# 复制数据库文件
cp /var/www/yuewei/server/data/yuewei.db /var/www/yuewei/data/backup_$(date +%Y%m%d).db

# 启动服务
pm2 start yuewei
```

---

## 九、常见问题

### Q: PM2 启动失败？
```bash
pm2 logs yuewei --err
# 查看错误日志
```

### Q: Nginx 502 Bad Gateway？
- 检查后端是否在运行：`pm2 status`
- 检查端口：`netstat -tlnp | grep 3002`
- 检查 Nginx 日志：`tail /var/www/yuewei/logs/error.log`

### Q: 前端 API 请求失败？
- 检查浏览器控制台（F12）Network 标签
- 确认 API 地址填写正确
- 确认后端防火墙开放了 80 端口

### Q: 数据库文件权限错误？
```bash
chown -R www-data:www-data /var/www/yuewei/server/data
```

### Q: 如何彻底删除并重新部署？
```bash
pm2 delete yuewei
rm -rf /var/www/yuewei
cd /var/www/yuewei
git clone <repo> .
# 重新执行安装步骤
```

---

## 十、最终地址

部署完成后，你的系统应该可以通过以下地址访问：

| 服务 | 地址 |
|------|------|
| 教师后台 | `https://你的域名/teacher/` |
| 学生端 | `https://你的域名/student/` |
| API 健康检查 | `https://你的域名/health` |

默认管理员账号：`admin` / `admin123`
