# 阅微 AI 诊断系统 · API 接口文档

> 版本：1.0.0
> 更新：2026-04-17
> 基础路径：`http://localhost:3002`

---

## 目录

1. [接口概述](#1-接口概述)
2. [认证接口](#2-认证接口)
3. [诊断接口](#3-诊断接口)
4. [报告接口](#4-报告接口)
5. [邀请码接口](#5-邀请码接口)
6. [题目接口](#6-题目接口)
7. [错误码](#7-错误码)

---

## 1. 接口概述

### 1.1 基础规范

```
Content-Type: application/json
Authorization: Bearer {token}
```

### 1.2 通用响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 1.3 分页响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

---

## 2. 认证接口

### 2.1 教师登录

**POST** `/api/auth/login`

**请求参数：**
```json
{
  "username": "teacher1",
  "password": "password123"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "张明远",
      "role": "语文教研组"
    }
  }
}
```

---

## 3. 诊断接口

### 3.1 提交诊断

**POST** `/api/diagnosis`

**请求参数：**
```json
{
  "name": "张三",
  "code": "ABC123",
  "question_id": 1,
  "answer": "学生作答内容..."
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "提交成功",
  "data": {
    "task_id": "task_abc123",
    "status": "processing",
    "estimated_time": 300
  }
}
```

### 3.2 查询诊断状态

**GET** `/api/diagnosis/:task_id`

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "task_id": "task_abc123",
    "status": "completed",
    "report_id": 1001
  }
}
```

---

## 4. 报告接口

### 4.1 获取报告列表

**GET** `/api/reports`

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码 |
| limit | int | 每页数量 |
| student_name | string | 学生姓名 |
| code | string | 邀请码 |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1001,
        "student_name": "张三",
        "question_title": "《静夜思》赏析",
        "score": 85,
        "status": "completed",
        "created_at": "2026-04-17 10:30:00"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

### 4.2 获取报告详情

**GET** `/api/reports/:id`

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "student_name": "张三",
    "question_title": "《静夜思》赏析",
    "score": 85,
    "overall_comment": "对诗歌意象理解准确...",
    "details": [
      {
        "sentence": "床前明月光",
        "comment": "开篇点题，营造意境",
        "score": 5
      }
    ],
    "suggestions": ["可加强对意境的想象"],
    "created_at": "2026-04-17 10:30:00"
  }
}
```

---

## 5. 邀请码接口

### 5.1 获取邀请码列表

**GET** `/api/codes`

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码 |
| limit | int | 每页数量 |
| status | string | 状态：active/used/expired |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "code": "ABC123",
        "question_id": 1,
        "question_title": "《静夜思》赏析",
        "status": "active",
        "used_count": 0,
        "max_uses": 1,
        "expires_at": "2026-04-30 23:59:59",
        "created_at": "2026-04-01 10:00:00"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10
  }
}
```

### 5.2 创建邀请码

**POST** `/api/codes`

**请求参数：**
```json
{
  "question_id": 1,
  "max_uses": 1,
  "expires_at": "2026-04-30 23:59:59"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 2,
    "code": "XYZ789",
    "question_id": 1,
    "max_uses": 1,
    "expires_at": "2026-04-30 23:59:59"
  }
}
```

### 5.3 更新邀请码

**PUT** `/api/codes/:id`

**请求参数：**
```json
{
  "status": "expired",
  "max_uses": 5
}
```

### 5.4 删除邀请码

**DELETE** `/api/codes/:id`

**响应示例：**
```json
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 6. 题目接口

### 6.1 获取题目列表

**GET** `/api/questions`

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码 |
| limit | int | 每页数量 |
| type | string | 类型：poetry/modern |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "《静夜思》赏析",
        "type": "poetry",
        "difficulty": "medium",
        "created_at": "2026-04-01 10:00:00"
      }
    ],
    "total": 30,
    "page": 1,
    "limit": 10
  }
}
```

### 6.2 获取题目详情

**GET** `/api/questions/:id`

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "title": "《静夜思》赏析",
    "type": "poetry",
    "difficulty": "medium",
    "content": "阅读下面的诗歌，回答问题...",
    "answer_template": "这首诗表达了诗人...",
    "scoring_rules": [
      { "item": "意象分析", "max_score": 20 },
      { "item": "情感理解", "max_score": 20 }
    ],
    "created_at": "2026-04-01 10:00:00"
  }
}
```

### 6.3 创建题目

**POST** `/api/questions`

**请求参数：**
```json
{
  "title": "《登鹳雀楼》赏析",
  "type": "poetry",
  "difficulty": "hard",
  "content": "阅读下面的诗歌...",
  "answer_template": "这首诗...",
  "scoring_rules": [
    { "item": "意象分析", "max_score": 20 }
  ]
}
```

---

## 7. 错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 0 | 成功 | - |
| 1001 | 参数错误 | 检查请求参数 |
| 1002 | 缺少必填参数 | 补充必填字段 |
| 2001 | 未登录 | 跳转登录页 |
| 2002 | Token 过期 | 重新登录 |
| 2003 | 无权限 | 检查用户角色 |
| 3001 | 资源不存在 | 检查 ID 是否正确 |
| 3002 | 邀请码已过期 | 联系教师 |
| 3003 | 邀请码已达使用次数 | 使用其他邀请码 |
| 4001 | 诊断服务异常 | 稍后重试 |
| 4002 | AI 服务超时 | 稍后重试 |
| 5001 | 服务器内部错误 | 联系技术支持 |

---

*本文档由 AI 生成，如有疑问请联系开发者*
