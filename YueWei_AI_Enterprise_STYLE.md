# 阅微 AI 诊断系统 · 样式规范指南

> 版本：1.0.0
> 更新：2026-04-17

---

## 目录

1. [设计原则](#1-设计原则)
2. [色彩系统](#2-色彩系统)
3. [字体系统](#3-字体系统)
4. [间距系统](#4-间距系统)
5. [圆角系统](#5-圆角系统)
6. [阴影系统](#6-阴影系统)
7. [过渡动画](#7-过渡动画)
8. [组件样式](#8-组件样式)
9. [布局规范](#9-布局规范)
10. [响应式断点](#10-响应式断点)

---

## 1. 设计原则

### 1.1 视觉层次

- **主色（Primary）**：#4F46E5（靛蓝色）
- **次色（Secondary）**：#7C3AED（紫色）
- **中性色（Slate）**：#334155 ~ #F8FAFC

### 1.2 命名规范

- CSS 变量使用 kebab-case
- 类名使用 BEM 风格（Block__Element--Modifier）
- 颜色变量按用途分类

---

## 2. 色彩系统

### 2.1 主色

```css
--color-primary:        #4F46E5;   /* 主色 */
--color-primary-hover: #4338CA;   /* 主色悬停 */
--color-primary-light: #EEF2FF;   /* 主色浅色 */
--color-primary-dark:  #3730A3;   /* 主色深色 */
```

### 2.2 辅助色

```css
--color-secondary:      #7C3AED;
--color-secondary-light: #F5F3FF;

--color-success:       #059669;
--color-success-light: #D1FAE5;
--color-success-dark:  #047857;

--color-warning:        #D97706;
--color-warning-light:  #FEF3C7;

--color-danger:         #DC2626;
--color-danger-light:    #FEE2E2;

--color-info:           #0284C7;
--color-info-light:      #E0F2FE;
```

### 2.3 中性色

```css
--color-slate-50:  #F8FAFC;
--color-slate-100: #F1F5F9;
--color-slate-200: #E2E8F0;
--color-slate-300: #CBD5E1;
--color-slate-400: #94A3B8;
--color-slate-500: #64748B;
--color-slate-600: #475569;
--color-slate-700: #334155;
--color-slate-800: #1E293B;
--color-slate-900: #0F172A;
```

---

## 3. 字体系统

### 3.1 字体栈

```css
--font-serif:   'Noto Serif SC', 'Songti SC', serif;
--font-sans:    'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
--font-inter:   'Inter', 'Helvetica Neue', Arial, sans-serif;
--font-mono:    'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### 3.2 字号

```css
--text-xs:   0.75rem;    /* 12px - 辅助文字 */
--text-sm:   0.875rem;   /* 14px - 正文 */
--text-base: 1rem;       /* 16px - 大正文 */
--text-lg:   1.125rem;   /* 18px - 标题小 */
--text-xl:   1.25rem;    /* 20px - 标题 */
--text-2xl:  1.5rem;     /* 24px - 大标题 */
--text-3xl:  1.875rem;   /* 30px - 页面标题 */
--text-4xl:  2.25rem;    /* 36px - Hero */
```

---

## 4. 间距系统

基于 **4px** 基准网格：

```css
--space-1:  0.25rem;   /* 4px  */
--space-2:  0.5rem;    /* 8px  */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
```

---

## 5. 圆角系统

```css
--radius-sm:   6px;     /* 小按钮、标签 */
--radius-md:   8px;     /* 输入框、卡片 */
--radius-lg:   12px;    /* 大卡片、模态框 */
--radius-xl:   16px;    /* 页面容器 */
--radius-2xl:  20px;    /* 学生端卡片 */
--radius-full: 9999px;  /* 胶囊按钮、头像 */
```

---

## 6. 阴影系统

```css
--shadow-xs:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

---

## 7. 过渡动画

```css
--transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base:   200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow:   300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 8. 组件样式

### 8.1 按钮

**类型：**
- `.btn-primary` - 主要操作
- `.btn-secondary` - 次要操作
- `.btn-success` - 成功操作
- `.btn-danger` - 危险操作
- `.btn-ghost` - 幽灵按钮

**尺寸：**
- `.btn-sm` - 小按钮
- （默认）- 中按钮
- `.btn-lg` - 大按钮

**示例：**
```html
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-danger btn-sm">小危险按钮</button>
```

### 8.2 表单

```html
<div class="form-group">
  <label class="form-label">姓名 <span class="required">*</span></label>
  <input type="text" class="form-input" placeholder="请输入">
  <div class="form-hint">辅助说明</div>
</div>
```

### 8.3 卡片

```html
<div class="card">
  <div class="card-header">
    <div class="card-title">卡片标题</div>
  </div>
  <div class="card-body">卡片内容</div>
  <div class="card-footer">卡片底部</div>
</div>
```

### 8.4 表格

```html
<div class="table-wrapper">
  <table class="table">
    <thead>
      <tr>
        <th>姓名</th>
        <th>分数</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>张三</td>
        <td>85</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 8.5 徽章

```html
<span class="badge badge-primary">进行中</span>
<span class="badge badge-success">已完成</span>
<span class="badge badge-warning">待处理</span>
<span class="badge badge-danger">失败</span>
```

---

## 9. 布局规范

### 9.1 页面布局

```
┌─────────────────────────────────────────────────┐
│                    Topbar (64px)                 │
├──────────────┬──────────────────────────────────┤
│              │                                   │
│   Sidebar    │        Page Content              │
│   (260px)    │        (max-width: 1280px)       │
│              │                                   │
│              │                                   │
└──────────────┴──────────────────────────────────┘
```

### 9.2 CSS 变量

```css
--sidebar-width:       260px;    /* 侧边栏宽度 */
--sidebar-collapsed:   72px;     /* 侧边栏折叠宽度 */
--topbar-height:       64px;     /* 顶栏高度 */
--content-max-width:   1280px;   /* 内容最大宽度 */
```

### 9.3 侧边栏结构

```html
<aside class="sidebar">
  <div class="sidebar-logo">
    <div class="logo-icon">阅</div>
    <div>
      <div class="logo-text">阅微 AI</div>
      <span class="logo-sub">智能诊断系统</span>
    </div>
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section">
      <div class="nav-section-title">数据概览</div>
      <a href="dashboard.html" class="nav-item active">
        <span class="nav-icon">📊</span>
        <span class="nav-label">数据看板</span>
      </a>
    </div>
  </nav>

  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="user-avatar">张</div>
      <div class="user-info">
        <div class="user-name">张明远</div>
        <div class="user-role">语文教研组</div>
      </div>
    </div>
  </div>
</aside>
```

---

## 10. 响应式断点

### 10.1 断点定义

| 断点 | 宽度 | 说明 |
|------|------|------|
| mobile | < 768px | 手机 |
| tablet | 768px - 1024px | 平板 |
| desktop | > 1024px | 桌面 |

### 10.2 媒体查询

```css
/* 平板：侧边栏折叠 */
@media (max-width: 1024px) {
  .sidebar {
    width: var(--sidebar-collapsed);
  }
}

/* 手机：完全隐藏侧边栏 */
@media (max-width: 768px) {
  .page-content { padding: var(--space-4); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

## 附录：常用样式类

### 文本

```css
.text-primary   { color: var(--color-primary) !important; }
.text-success   { color: var(--color-success) !important; }
.text-warning   { color: var(--color-warning) !important; }
.text-danger    { color: var(--color-danger) !important; }
.text-muted     { color: var(--color-slate-400) !important; }

.fw-500 { font-weight: 500; }
.fw-600 { font-weight: 600; }
.fw-700 { font-weight: 700; }
```

### 背景

```css
.bg-primary-light { background: var(--color-primary-light); }
.bg-success-light { background: var(--color-success-light); }
```

### 工具

```css
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.no-shrink { flex-shrink: 0; }
```

---

*本文档由 AI 生成，如有疑问请联系开发者*
