# 阅微 AI 诊断系统 · 企业版开发文档

> 版本：1.0.0
> 更新：2026-04-17
> 状态：已完成 Phase 1

---

## 目录

1. [项目概述](#1-项目概述)
2. [系统架构](#2-系统架构)
3. [目录结构](#3-目录结构)
4. [页面清单](#4-页面清单)
5. [功能模块](#5-功能模块)
6. [数据流设计](#6-数据流设计)
7. [API 接口设计](#7-api-接口设计)
8. [组件库说明](#8-组件库说明)
9. [部署指南](#9-部署指南)
10. [开发规范](#10-开发规范)

---

## 1. 项目概述

### 1.1 项目简介

**阅微 AI 诊断系统**是基于 DeepSeek 大模型的高中语文智能批改平台，覆盖诗歌鉴赏与现代文阅读两大核心模块。

### 1.2 项目规模

- **类型**：Web 应用（前后端分离）
- **用户**：教师（管理端）、学生（作答端）
- **技术栈**：原生 HTML/CSS/JS + Tailwind CDN + DeepSeek API

### 1.3 系统角色

| 角色 | 数量 | 说明 |
|------|------|------|
| 教师 | N | 管理题目、邀请码、查看报告 |
| 学生 | M | 提交作答、查看历史报告 |

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端 (Browser)                       │
├─────────────────────────────────────────────────────────────┤
│  教师端 (teacher/)          │  学生端 (student/)             │
│  ├── dashboard.html         │  ├── submit.html               │
│  ├── invite-codes.html      │  └── archive.html              │
│  ├── questions.html         │                                │
│  ├── reports.html           │                                │
│  ├── methodology.html        │                                │
│  └── settings.html          │                                │
├─────────────────────────────────────────────────────────────┤
│                      共享资源 (shared/)                      │
│  ├── css/styles.css         │  设计系统 + 组件样式             │
│  └── js/app.js             │  API、Toast、Modal、Drawer      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    后端服务器 (Node.js)                       │
│  baseURL: http://localhost:3002                             │
│                                                              │
│  ├── POST /api/diagnosis    AI 诊断接口                      │
│  ├── GET  /api/reports      报告查询                         │
│  ├── POST /api/auth/login   教师登录                         │
│  └── ...                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 目录结构

```
YueWei_AI_Enterprise/
│
├── index.html                    # 入口页（双色卡片导航）
│
├── css/
│   └── styles.css               # 完整设计系统（约 1570 行）
│       ├── CSS Variables（颜色、字体、间距、阴影）
│       ├── 布局系统（Sidebar、Topbar、PageContent）
│       ├── 组件样式（Button、Form、Table、Card）
│       ├── 反馈组件（Toast、Modal、Drawer）
│       ├── 学生端样式
│       └── 响应式 + 打印样式
│
├── js/
│   └── app.js                   # 核心 JS（约 660 行）
│       ├── API                  # 统一接口调用
│       ├── Toast                # 通知提示系统
│       ├── Modal                # 模态对话框
│       ├── Drawer               # 右侧抽屉
│       ├── Sidebar              # 侧边栏控制
│       ├── Pagination           # 分页器
│       ├── DataTable            # 数据表格
│       ├── Fmt                  # 格式化工具
│       └── Auth Guard           # 权限验证
│
├── teacher/                     # 教师管理端
│   ├── login.html               # 登录页
│   ├── dashboard.html           # 📊 数据看板
│   ├── invite-codes.html        # 🎟 邀请码管理
│   ├── questions.html           # 📝 题目管理
│   ├── reports.html             # 📋 报告查看
│   ├── methodology.html        # 📖 方法论标准库
│   ├── settings.html            # ⚙ 系统设置
│   └── SIDEBAR_FIX_LOG.md      # 侧边栏修复记录
│
└── student/                     # 学生端
    ├── submit.html              # 🚀 智能诊断舱（作答）
    └── archive.html             # 📂 历史档案库
```

---

## 4. 页面清单

### 4.1 教师端

| 页面 | 文件 | 功能 | 状态 |
|------|------|------|------|
| 登录 | `login.html` | 教师身份验证 | ✅ |
| 数据看板 | `dashboard.html` | 统计卡片、趋势图、班级排行、预警 | ✅ |
| 邀请码管理 | `invite-codes.html` | 表格筛选、分页、抽屉编辑、批量操作 | ✅ |
| 题目管理 | `questions.html` | 卡片网格、创建Modal、题目预览 | ✅ |
| 报告查看 | `reports.html` | 报告列表与详情 | ✅ |
| 方法论标准库 | `methodology.html` | 方法论配置 | ✅ |
| 系统设置 | `settings.html` | 系统参数配置 | ✅ |

### 4.2 学生端

| 页面 | 文件 | 功能 | 状态 |
|------|------|------|------|
| 智能诊断舱 | `submit.html` | 作答表单、提交诊断 | ✅ |
| 历史档案库 | `archive.html` | 历史报告查询 | ✅ |

### 4.3 侧边栏标准结构（已统一）

```
数据概览
  └── 数据看板 (dashboard.html)

教学管理
  └── 邀请码管理 (invite-codes.html)
  └── 题目管理 (questions.html)
  └── 报告查看 (reports.html)

系统配置
  └── 方法论标准库 (methodology.html)
  └── 系统设置 (settings.html)
```

---

## 5. 功能模块

### 5.1 认证模块 (Auth)

- **登录**：教师端登录验证
- **Token 存储**：`localStorage.getItem('yw_token')`
- **权限守卫**：`checkAuth()` 函数保护教师页面
- **登出**：`logout()` 清除 Token 并跳转登录页

```javascript
// Token 注入示例
const token = localStorage.getItem('yw_token');
if (token) config.headers['Authorization'] = `Bearer ${token}`;
```

### 5.2 诊断模块 (Diagnosis)

- **提交作答**：学生提交作文/诗歌
- **AI 诊断**：调用 DeepSeek API 进行批改
- **报告生成**：3-5 分钟内返回诊断报告

### 5.3 管理模块

| 模块 | 功能 |
|------|------|
| 邀请码 | 生成、编辑、批量操作、状态管理 |
| 题目 | 创建、编辑、预览、分类管理 |
| 报告 | 查看、对比、导出 |
| 方法论 | 标准库配置、启用/禁用 |

---

## 6. 数据流设计

### 6.1 前端数据流

```
用户操作 → HTML事件 → JS处理 → API调用 → 后端响应 → 更新UI
```

### 6.2 API 请求流程

```javascript
// 统一请求入口
API.request(method, endpoint, data, options)

// 示例：提交诊断
await API.post('/api/diagnosis', {
  name: '张三',
  code: 'ABC123',
  question_id: 1,
  answer: '学生作答内容...'
})
```

### 6.3 错误处理

- **401 未授权**：自动跳转登录页
- **网络错误**：Toast 提示
- **业务错误**：显示错误信息

---

## 7. API 接口设计

### 7.1 接口基础

```
Base URL: http://localhost:3002
Content-Type: application/json
Authorization: Bearer {token}
```

### 7.2 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 教师登录 |
| POST | `/api/diagnosis` | 提交诊断 |
| GET | `/api/reports` | 获取报告列表 |
| GET | `/api/reports/:id` | 获取报告详情 |
| GET | `/api/codes` | 获取邀请码列表 |
| POST | `/api/codes` | 创建邀请码 |
| PUT | `/api/codes/:id` | 更新邀请码 |
| DELETE | `/api/codes/:id` | 删除邀请码 |
| GET | `/api/questions` | 获取题目列表 |
| POST | `/api/questions` | 创建题目 |

### 7.3 详细接口文档

见 `{项目名}_API.md`

---

## 8. 组件库说明

### 8.1 Toast 通知

```javascript
Toast.success('成功', '操作已完成');
Toast.error('失败', '请稍后重试');
Toast.warning('警告', '数据异常');
Toast.info('提示', '请检查输入');
```

### 8.2 Modal 对话框

```javascript
// 确认框
const confirmed = await Modal.confirm({
  title: '确认删除',
  message: '此操作不可恢复',
  danger: true
});

// 提示框
await Modal.alert({
  title: '提示',
  message: '提交成功'
});
```

### 8.3 Drawer 抽屉

```javascript
Drawer.show({
  title: '编辑',
  content: '<form>...</form>',
  width: '480px'
});
Drawer.setFooter('<button>保存</button>');
```

### 8.4 DataTable 数据表格

```javascript
const table = new DataTable({
  container: document.getElementById('table'),
  columns: [
    { key: 'name', label: '姓名' },
    { key: 'score', label: '分数', render: (v) => `${v}分` }
  ],
  data: [],
  actions: [
    { key: 'edit', label: '编辑', onClick: (row) => {} }
  ],
  selectable: true
});
table.setData(newData);
```

### 8.5 Pagination 分页器

```javascript
const pager = new Pagination({
  container: document.getElementById('pagination'),
  total: 100,
  limit: 10,
  onChange: (page) => loadData(page)
});
pager.go(2);
pager.reset();
```

---

## 9. 部署指南

### 9.1 本地预览

```bash
# 直接打开
open index.html

# 或启动静态服务器
npx serve .
```

### 9.2 生产部署

1. 打包所有静态文件
2. 配置 Nginx 指向 `index.html`
3. 设置后端 API 代理

### 9.3 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `API_BASE_URL` | 后端 API 地址 | `http://localhost:3002` |

---

## 10. 开发规范

### 10.1 文件命名

- HTML： kebab-case (`invite-codes.html`)
- CSS： kebab-case (`styles.css`)
- JS： kebab-case (`app.js`)

### 10.2 代码风格

- 使用 ES6+ 语法
- 使用 2 空格缩进
- 语句结尾加分号
- 使用单引号字符串

### 10.3 侧边栏规范

**标准结构：**
```html
<aside class="sidebar">
  <div class="sidebar-logo">...</div>
  <nav class="sidebar-nav">
    <div class="nav-section">
      <div class="nav-section-title">数据概览</div>
      <a href="dashboard.html" class="nav-item active">...</a>
    </div>
    <div class="nav-section">
      <div class="nav-section-title">教学管理</div>
      ...
    </div>
    <div class="nav-section">
      <div class="nav-section-title">系统配置</div>
      ...
    </div>
  </nav>
  <div class="sidebar-footer">...</div>
</aside>
```

### 10.4 组件使用

- 所有页面必须引入：`styles.css`、`app.js`
- 页面标题格式：`{页面名} · 阅微 AI 诊断系统`
- 表单必须包含 CSRF Token

---

## 更新日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-04-17 | 1.0.0 | 初始版本，Phase 1 完成 |
| 2026-04-17 | 1.0.1 | 统一教师端侧边栏结构 |

---

*本文档由 AI 生成，如有疑问请联系开发者*
