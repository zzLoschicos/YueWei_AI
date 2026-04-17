/**
 * 邀请码路由
 * GET/POST /api/codes - 列表/创建
 * PUT/DELETE /api/codes/:id - 更新/删除
 */
import { nanoid } from 'nanoid';

// 列表查询 schema
const listQuerySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      status: { type: 'string', enum: ['active', 'used', 'expired'] },
    },
  },
};

// 创建邀请码 schema
const createCodeSchema = {
  body: {
    type: 'object',
    required: ['question_id'],
    properties: {
      question_id: { type: 'integer' },
      max_uses: { type: 'integer', minimum: 1, default: 1 },
      expires_at: { type: 'string' }, // ISO 日期字符串
    },
  },
};

// 更新邀请码 schema
const updateCodeSchema = {
  body: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['active', 'used', 'expired'] },
      max_uses: { type: 'integer', minimum: 1 },
      expires_at: { type: 'string' },
    },
  },
};

export default async function codesRoutes(fastify, options) {
  // 添加认证中间件
  fastify.addHook('preHandler', fastify.authenticate);

  // 获取邀请码列表
  fastify.get('/', { schema: listQuerySchema }, async (request, reply) => {
    const { page = 1, limit = 10, status } = request.query;
    const offset = (page - 1) * limit;
    const db = fastify.db;

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND ic.status = ?';
      params.push(status);
    }

    // 查询总数
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM invite_codes ic WHERE ${whereClause}
    `).get(...params);

    // 查询列表
    const list = db.prepare(`
      SELECT
        ic.*,
        q.title as question_title,
        t.name as creator_name
      FROM invite_codes ic
      JOIN questions q ON ic.question_id = q.id
      LEFT JOIN teachers t ON ic.created_by = t.id
      WHERE ${whereClause}
      ORDER BY ic.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return {
      code: 0,
      message: 'success',
      data: {
        list,
        total: countResult.total,
        page,
        limit,
      },
    };
  });

  // 创建邀请码
  fastify.post('/', { schema: createCodeSchema }, async (request, reply) => {
    const { question_id, max_uses = 1, expires_at } = request.body;
    const db = fastify.db;

    // 验证题目存在
    const question = db.prepare('SELECT id FROM questions WHERE id = ?').get(question_id);
    if (!question) {
      return reply.status(400).send({
        code: 3001,
        message: '题目不存在',
      });
    }

    // 生成唯一邀请码
    const code = generateCode();

    const stmt = db.prepare(`
      INSERT INTO invite_codes (code, question_id, max_uses, expires_at, created_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      code,
      question_id,
      max_uses,
      expires_at || null,
      request.user.id
    );

    return {
      code: 0,
      message: '创建成功',
      data: {
        id: result.lastInsertRowid,
        code,
        question_id,
        max_uses,
        expires_at,
      },
    };
  });

  // 更新邀请码
  fastify.put('/:id', { schema: updateCodeSchema }, async (request, reply) => {
    const { id } = request.params;
    const { status, max_uses, expires_at } = request.body;
    const db = fastify.db;

    // 检查是否存在
    const code = db.prepare('SELECT * FROM invite_codes WHERE id = ?').get(id);
    if (!code) {
      return reply.status(404).send({
        code: 3001,
        message: '邀请码不存在',
      });
    }

    // 构建更新语句
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (max_uses !== undefined) {
      updates.push('max_uses = ?');
      params.push(max_uses);
    }
    if (expires_at !== undefined) {
      updates.push('expires_at = ?');
      params.push(expires_at);
    }

    if (updates.length === 0) {
      return reply.status(400).send({
        code: 1001,
        message: '没有需要更新的字段',
      });
    }

    params.push(id);
    db.prepare(`UPDATE invite_codes SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    return {
      code: 0,
      message: '更新成功',
    };
  });

  // 删除邀请码
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const db = fastify.db;

    const result = db.prepare('DELETE FROM invite_codes WHERE id = ?').run(id);

    if (result.changes === 0) {
      return reply.status(404).send({
        code: 3001,
        message: '邀请码不存在',
      });
    }

    return {
      code: 0,
      message: '删除成功',
    };
  });

  // 批量创建邀请码
  fastify.post('/batch', async (request, reply) => {
    const { question_id, count = 5, max_uses = 1, expires_at } = request.body;
    const db = fastify.db;

    if (count > 50) {
      return reply.status(400).send({
        code: 1001,
        message: '单次最多创建 50 个邀请码',
      });
    }

    const codes = [];
    const stmt = db.prepare(`
      INSERT INTO invite_codes (code, question_id, max_uses, expires_at, created_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < count; i++) {
      const code = generateCode();
      stmt.run(code, question_id, max_uses, expires_at || null, request.user.id);
      codes.push(code);
    }

    return {
      code: 0,
      message: `成功创建 ${count} 个邀请码`,
      data: { codes },
    };
  });
}

// 生成短码
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
