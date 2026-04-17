/**
 * 方法论标准库路由
 * GET/POST /api/methodology - 列表/创建
 * GET/PUT/DELETE /api/methodology/:id - 详情/更新/删除
 */

export default async function methodologyRoutes(fastify, options) {
  // 添加认证中间件
  fastify.addHook('preHandler', fastify.authenticate);

  // 获取方法论列表
  fastify.get('/', async (request, reply) => {
    const db = fastify.db;
    const { type } = request.query;

    let whereClause = '1=1';
    const params = [];
    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    const list = db.prepare(`
      SELECT id, name, type, description, content, enabled, created_at, updated_at
      FROM methodology
      WHERE ${whereClause}
      ORDER BY type, id
    `).all(...params);

    return {
      code: 0,
      message: 'success',
      data: { list },
    };
  });

  // 获取单个方法论详情
  fastify.get('/:id', async (request, reply) => {
    const db = fastify.db;
    const { id } = request.params;

    const item = db.prepare('SELECT * FROM methodology WHERE id = ?').get(id);
    if (!item) {
      return reply.status(404).send({ code: 3001, message: '方法论不存在' });
    }

    return {
      code: 0,
      message: 'success',
      data: item,
    };
  });

  // 创建方法论
  fastify.post('/', async (request, reply) => {
    const db = fastify.db;
    const { name, type, description, content } = request.body;

    if (!name || !type || !content) {
      return reply.status(400).send({ code: 1001, message: '缺少必填字段' });
    }

    const result = db.prepare(`
      INSERT INTO methodology (name, type, description, content)
      VALUES (?, ?, ?, ?)
    `).run(name, type, description || '', content);

    return {
      code: 0,
      message: '创建成功',
      data: { id: result.lastInsertRowid, name, type },
    };
  });

  // 更新方法论
  fastify.put('/:id', async (request, reply) => {
    const db = fastify.db;
    const { id } = request.params;
    const { name, type, description, content, enabled } = request.body;

    const item = db.prepare('SELECT id FROM methodology WHERE id = ?').get(id);
    if (!item) {
      return reply.status(404).send({ code: 3001, message: '方法论不存在' });
    }

    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (type !== undefined) { updates.push('type = ?'); params.push(type); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (enabled !== undefined) { updates.push('enabled = ?'); params.push(enabled ? 1 : 0); }

    if (updates.length === 0) {
      return reply.status(400).send({ code: 1001, message: '没有需要更新的字段' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    db.prepare(`UPDATE methodology SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    return { code: 0, message: '更新成功' };
  });

  // 删除方法论
  fastify.delete('/:id', async (request, reply) => {
    const db = fastify.db;
    const { id } = request.params;

    const result = db.prepare('DELETE FROM methodology WHERE id = ?').run(id);
    if (result.changes === 0) {
      return reply.status(404).send({ code: 3001, message: '方法论不存在' });
    }

    return { code: 0, message: '删除成功' };
  });
}
