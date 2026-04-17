# 阅微 AI 诊断系统 · 开发计划

> 创建：2026-04-17
> 版本：1.1.0

---

## 当前状态

- ✅ 前端页面（Phase 1）完成
- ✅ 开发文档套件完成
- ✅ 后端服务开发完成
- ✅ 前端 API 对接完成（全部页面）
- ✅ P1 功能完善全部完成
- ✅ P2 响应式适配完成
- ✅ P2 无障碍支持完成
- ✅ P2 打印样式完成
- ✅ P3 部署配置完成

---

## 技术方案（已确认）

| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 后端框架 | **Fastify** | 轻量 + 高性能 + 内置安全 |
| 数据库 | **SQLite** + better-sqlite3 | 零配置 + 高性能 |
| AI 接口 | **DeepSeek API** | 已有专用 Key |
| 前端框架 | 原生 HTML/CSS/JS + Tailwind CDN | 已完成 |
| 部署平台 | **Railway** 或 Render | 免费额度 + 自动 HTTPS |

---

## 后端项目结构

```
server/                          # 后端根目录
├── package.json
├── src/
│   ├── index.js               # 入口文件
│   ├── app.js                 # Fastify 实例配置
│   ├── routes/
│   │   ├── auth.js           # 认证路由
│   │   ├── diagnosis.js      # 诊断路由
│   │   ├── reports.js        # 报告路由
│   │   ├── codes.js          # 邀请码路由
│   │   ├── questions.js      # 题目路由
│   │   ├── stats.js          # 统计路由
│   │   └── methodology.js   # 方法论路由
│   ├── plugins/
│   │   ├── sqlite.js         # SQLite 插件
│   │   └── deepseek.js       # DeepSeek API 插件
│   ├── db/
│   │   ├── schema.sql        # 数据库表结构
│   │   └── seed.sql          # 初始数据
│   └── services/
│       ├── auth.service.js    # 认证服务
│       ├── diagnosis.service.js # 诊断服务
│       ├── report.service.js   # 报告服务
│       ├── code.service.js     # 邀请码服务
│       └── question.service.js # 题目服务
└── .env                       # 环境变量
```

---

## 待办事项

### P0 - 必须完成（阻塞项目上线）

#### 1. 后端服务开发
**负责人：** AI Agent
**依赖：** 无

**任务清单：**
- [x] 搭建后端项目结构（Fastify + SQLite）
- [x] 实现认证接口 `POST /api/auth/login`
- [x] 实现诊断接口 `POST /api/diagnosis`
- [x] 实现报告接口 `GET /api/reports`
- [x] 实现邀请码接口 `GET/POST/PUT/DELETE /api/codes`
- [x] 实现题目接口 `GET/POST/PUT/DELETE /api/questions`
- [x] 连接 DeepSeek API
- [x] 数据库初始化脚本

#### 2. 前端 API 对接
**负责人：** AI Agent
**依赖：** 后端服务完成

**任务清单：**
- [x] 确认 API_BASE_URL 配置
- [x] 对接登录接口
- [x] 对接诊断提交（学生端 submit.html）
- [x] 对接报告查询（教师端 reports.html）
- [x] 对接邀请码管理（教师端 invite-codes.html）
- [x] 对接题目管理（教师端 questions.html）
- [x] 对接数据看板（教师端 dashboard.html）

---

### P1 - 重要（提升产品完整性）

#### 3. 功能完善
**负责人：** AI Agent
**预计时间：**
**依赖：** 前端 API 对接完成

**任务清单：**
- [x] `reports.html` 报告查看与对比功能
- [x] `methodology.html` 方法论编辑器完善
- [x] 学生端 `archive.html` 报告对比功能

#### 4. 学生端侧边栏统一
**负责人：** AI Agent
**预计时间：**
**依赖：** 无

**任务清单：**
- [x] 检查学生端页面结构
- [x] 统一学生端导航样式

---

### P2 - 优化（可选）

#### 5. 响应式适配
**负责人：**
**预计时间：**
**依赖：** 无

**任务清单：**
- [x] Pad 适配（768px - 1024px）
- [x] 手机适配（< 768px）
- [x] 测试各页面在移动端表现

#### 6. 无障碍支持
**负责人：**
**预计时间：**
**依赖：** 无

**任务清单：**
- [x] 添加 ARIA 标签
- [x] 键盘导航支持
- [x] 屏幕阅读器测试

#### 7. 打印样式优化
**负责人：**
**预计时间：**
**依赖：** 无

**任务清单：**
- [x] 完善报告页打印样式
- [x] 测试打印效果

---

### P3 - 运维

#### 8. 部署上线
**负责人：**
**预计时间：**
**依赖：** P0、P1 完成

**任务清单：**
- [x] 选择部署方案（Docker / Railway / Render / 云服务器）
- [x] 配置环境变量模板
- [x] Docker + docker-compose 配置
- [x] Nginx 反向代理配置
- [x] Railway / Render 部署配置
- [x] 部署教程文档

#### 9. 文档完善
**负责人：**
**预计时间：**
**依赖：** 功能开发完成

**任务清单：**
- [ ] 更新 API 文档
- [ ] 编写使用手册
- [ ] 编写部署教程

---

## 优先级排序

```
P0（阻塞上线）
  1. 后端服务开发
  2. 前端 API 对接

P1（重要）
  3. 功能完善
  4. 学生端侧边栏统一

P2（优化）
  5. 响应式适配
  6. 无障碍支持
  7. 打印样式优化

P3（运维）
  8. 部署上线
  9. 文档完善
```

---

## 技术方案（已确认）

| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 后端框架 | **Fastify** | 轻量 + 高性能 + 内置安全 |
| 数据库 | **SQLite** + better-sqlite3 | 零配置 + 高性能 |
| AI 接口 | **DeepSeek API** | 已有专用 Key |
| 前端框架 | 原生 HTML/CSS/JS + Tailwind CDN | 已完成 |
| 部署平台 | **Railway** 或 Render | 免费额度 + 自动 HTTPS |

---

## 后端项目结构

```
server/                          # 后端根目录
├── package.json
├── src/
│   ├── index.js               # 入口文件
│   ├── app.js                 # Fastify 实例配置
│   ├── routes/
│   │   ├── auth.js           # 认证路由
│   │   ├── diagnosis.js      # 诊断路由
│   │   ├── reports.js        # 报告路由
│   │   ├── codes.js          # 邀请码路由
│   │   ├── questions.js      # 题目路由
│   │   ├── stats.js          # 统计路由
│   │   └── methodology.js   # 方法论路由
│   ├── plugins/
│   │   ├── sqlite.js         # SQLite 插件
│   │   └── deepseek.js       # DeepSeek API 插件
│   ├── db/
│   │   ├── schema.sql        # 数据库表结构
│   │   └── seed.sql          # 初始数据
│   └── services/
│       ├── auth.service.js    # 认证服务
│       ├── diagnosis.service.js # 诊断服务
│       ├── report.service.js   # 报告服务
│       ├── code.service.js     # 邀请码服务
│       └── question.service.js # 题目服务
└── .env                       # 环境变量
```

---

## 更新记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-04-17 | 1.0.0 | 创建文档 |
| 2026-04-17 | 1.1.0 | 确认技术方案：Fastify + SQLite |
| 2026-04-17 | 1.2.0 | 后端服务开发完成、前端登录对接完成 |
| 2026-04-17 | 1.3.0 | P1功能完善全部完成：methodology编辑器、archive报告对比、侧边栏统一 |
| 2026-04-17 | 1.4.0 | P2响应式适配完成：桌面端折叠、移动端堆叠、Pad适配 |
| 2026-04-17 | 1.5.0 | P2无障碍支持完成：ARIA标签、键盘导航、焦点管理、屏幕阅读器 |
| 2026-04-17 | 1.6.0 | P2打印样式完成：彩色徽章、进度条、报告分页、学生端适配 |
| 2026-04-17 | 1.7.0 | P3部署配置完成：Docker/Railway/Render/Nginx/云服务器完整部署方案 |

---

*记录人：*
*确认人：*
