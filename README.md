# 阅微 AI 诊断系统 · 企业级前端重构

> YueWei AI Diagnostic System — Enterprise Frontend Redesign

---

## 项目概述

本目录为「阅微 AI 诊断系统」的企业级前端重构版本，从 UI/UX、交互体验、组件化三个维度进行全面升级。

**当前状态**：已完成 Phase 1 — 设计系统 + 核心页面原型

---

## 目录结构

```
YueWei_AI_Enterprise/
│
├── index.html                 # 入口页（双色卡片导航）
│
├── css/
│   └── styles.css             # 完整设计系统（CSS Variables）
│
├── js/
│   └── app.js                 # 核心组件库
│       ├── API Service         # 统一接口调用
│       ├── Toast              # 通知提示系统
│       ├── Modal              # 模态对话框
│       ├── Drawer             # 右侧抽屉面板
│       ├── DataTable          # 数据表格（排序/筛选/分页）
│       ├── Pagination         # 分页器
│       └── Fmt               # 格式化工具
│
├── teacher/                   # 教师管理端
│   ├── dashboard.html         # 📊 数据看板（统计卡片+趋势图+班级排行+预警）
│   ├── invite-codes.html       # 🎟 邀请码管理（专业表格+抽屉编辑+批量操作）
│   ├── questions.html         # 📝 题目管理（卡片网格+创建Modal）
│   ├── reports.html            # 📋 报告查看（占位）
│   └── methodology.html        # 📖 方法论标准库（占位）
│
└── student/                   # 学生端
    ├── submit.html            # 🚀 智能诊断舱（双栏表单+品牌展示）
    └── archive.html           # 📂 历史档案库（身份验证+报告卡片+得分趋势）
```

---

## 已完成页面

| 页面 | 文件 | 核心功能 |
|------|------|----------|
| 入口导航 | `index.html` | 双端入口卡片 |
| 教师看板 | `teacher/dashboard.html` | 统计卡片、柱状趋势、班级排行、预警面板 |
| 邀请码管理 | `teacher/invite-codes.html` | 表格筛选、分页、抽屉编辑、批量操作 |
| 题目管理 | `teacher/questions.html` | 卡片网格、创建Modal、题目预览 |
| 学生提交 | `student/submit.html` | 双栏布局、表单验证、提交动画 |
| 历史档案 | `student/archive.html` | 身份验证、报告卡片、得分趋势图 |

---

## 设计系统亮点

### 统一 Design Token
- 色彩系统（Primary/Secondary/Status）
- 间距级数（4px 基准）
- 圆角体系（6/8/12/16px）
- 阴影层级（sm/md/lg/xl）
- 过渡动画（fast/base/slow/spring）

### 组件库
- **Toast** — 右上角通知，支持 success/error/warning/info
- **Modal** — 确认框/表单框，支持 Promise 化调用
- **Drawer** — 右侧抽屉，可动态注入内容与 Footer
- **DataTable** — 完整数据表格，支持排序/筛选/分页/批量选择
- **Pagination** — 智能分页器（自动生成页码省略）

### 布局系统
- 固定侧边栏 + 顶栏 + 内容区
- 侧边栏支持折叠（响应式）
- 面包屑导航
- 页面 Toolbar（搜索/筛选/操作按钮）

---

## 待完成

- [ ] `teacher/reports.html` — 报告查看与对比
- [ ] `teacher/methodology.html` — 方法论编辑器
- [ ] `teacher/settings.html` — 系统设置
- [ ] 响应式完整适配（Pad / 手机）
- [ ] 打印样式（报告页）
- [ ] 动画过渡优化
- [ ] 无障碍（ARIA）支持

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 样式 | 原生 CSS（自定义属性）+ Tailwind CDN |
| 交互 | 原生 JavaScript（ES6+）|
| 字体 | Google Fonts (Noto Serif SC / Noto Sans SC / Inter / JetBrains Mono) |
| 图标 | Emoji（轻量方案）|

---

## 本地预览

直接用浏览器打开 `index.html` 即可。

```bash
# macOS
open index.html

# Windows
start index.html

# 或启动静态服务器（推荐）
npx serve .
```

---

## 设计预览

### 教师端 — 数据看板
```
┌──────────────┬──────────────────────────────────────┐
│   侧边栏      │  顶栏 (面包屑 + 通知 + 帮助)            │
│   📊 数据看板 │───────────────────────────────────────│
│   🎟 邀请码   │  [Page Header]                         │
│   📝 题目    │                                        │
│   📖 方法论   │  [统计卡片 × 5]                        │
│   ⚙️ 设置    │                                        │
│              │  [趋势图]        [得分分布]             │
│   ───────   │                                        │
│   [用户信息] │  [班级排行]      [预警面板]             │
└──────────────┴──────────────────────────────────────┘
```

### 学生端 — 提交舱
```
┌──────────────────────────────────────────────────────────┐
│  🏮 阅微 AI                          [诊断舱] [历史档案] │
├─────────────────────────────────┬────────────────────────┤
│  智能诊断舱                      │  精准诊断，如师亲临     │
│                                 │                        │
│  [姓名]  [辅助标识]              │  ✓ 逐句批注             │
│  [邀请码] [题目选择]             │  ✓ 量化评分             │
│  [答案输入]                      │  ✓ 词汇升级             │
│  [提交按钮]                      │  ✓ 进步追踪             │
│                                 │                        │
│  [诊断说明]                      │  [查看历史报告]         │
└─────────────────────────────────┴────────────────────────┘
```

---

*Version 1.0.0 — 2026-04-17*
