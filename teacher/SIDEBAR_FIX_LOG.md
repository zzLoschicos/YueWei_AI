# 侧边栏统一修复记录

> 日期：2026-04-17
> 项目：YueWei_AI_Enterprise (阅微 AI 企业教育系统)

## 问题描述

teacher 端各页面侧边栏导航结构不一致，影响用户体验。

## 标准侧边栏结构

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

## 修复内容

### 1. dashboard.html
- ✅ 移除"快速访问"链接（指向 student/submit.html，带"新"标签）
- ✅ 移除邀请码管理的数字 badge (2)
- 修复后：仅保留标准结构

### 2. questions.html
- ✅ 添加"系统设置"链接到系统配置分组

### 3. reports.html
- ✅ 添加"系统设置"链接到系统配置分组

### 4. invite-codes.html
- ✅ 添加"系统设置"链接到系统配置分组

### 5. methodology.html
- ✅ 添加"系统设置"链接到系统配置分组

### 6. settings.html
- ✅ 无需修改（已是标准结构）

## 修复后状态

所有 6 个 teacher 端页面侧边栏结构完全统一。

## 注意事项

- 各页面 `active` 类需手动设置到当前页面对应的 nav-item
- 不要在侧边栏添加页面结构之外的链接
- 不要添加数字 badge 或"新"标签等装饰元素
