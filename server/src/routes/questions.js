/**
 * 题目路由
 * GET/POST /api/questions - 列表/创建
 * GET/PUT/DELETE /api/questions/:id - 详情/更新/删除
 */

// 列表查询 schema
const listQuerySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      type: { type: 'string', enum: ['poetry', 'modern'] },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
    },
  },
};

// 创建题目 schema
const createQuestionSchema = {
  body: {
    type: 'object',
    required: ['title', 'type', 'content'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      type: { type: 'string', enum: ['poetry', 'modern'] },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], default: 'medium' },
      content: { type: 'string', minLength: 1 },
      answer_template: { type: 'string' },
      scoring_rules: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            item: { type: 'string' },
            max_score: { type: 'number' },
          },
        },
      },
    },
  },
};

// 更新题目 schema
const updateQuestionSchema = {
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      type: { type: 'string', enum: ['poetry', 'modern'] },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
      content: { type: 'string', minLength: 1 },
      answer_template: { type: 'string' },
      scoring_rules: { type: 'array' },
    },
  },
};

export default async function questionsRoutes(fastify, options) {
  // 添加认证中间件
  fastify.addHook('preHandler', fastify.authenticate);

  // 获取题目列表
  fastify.get('/', { schema: listQuerySchema }, async (request, reply) => {
    const { page = 1, limit = 10, type, difficulty } = request.query;
    const offset = (page - 1) * limit;
    const db = fastify.db;

    let whereClause = '1=1';
    const params = [];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }
    if (difficulty) {
      whereClause += ' AND difficulty = ?';
      params.push(difficulty);
    }

    // 查询总数
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM questions WHERE ${whereClause}
    `).get(...params);

    // 查询列表
    const list = db.prepare(`
      SELECT id, title, type, difficulty, created_at
      FROM questions
      WHERE ${whereClause}
      ORDER BY created_at DESC
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

  // 获取题目详情
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const db = fastify.db;

    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);

    if (!question) {
      return reply.status(404).send({
        code: 3001,
        message: '题目不存在',
      });
    }

    // 解析 JSON 字段
    const scoring_rules = question.scoring_rules ? JSON.parse(question.scoring_rules) : [];

    return {
      code: 0,
      message: 'success',
      data: {
        ...question,
        scoring_rules,
      },
    };
  });

  // 创建题目
  fastify.post('/', { schema: createQuestionSchema }, async (request, reply) => {
    const { title, type, difficulty = 'medium', content, answer_template, scoring_rules } = request.body;
    const db = fastify.db;

    const stmt = db.prepare(`
      INSERT INTO questions (title, type, difficulty, content, answer_template, scoring_rules)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      type,
      difficulty,
      content,
      answer_template || null,
      scoring_rules ? JSON.stringify(scoring_rules) : null
    );

    return {
      code: 0,
      message: '创建成功',
      data: {
        id: result.lastInsertRowid,
        title,
        type,
        difficulty,
      },
    };
  });

  // 更新题目
  fastify.put('/:id', { schema: updateQuestionSchema }, async (request, reply) => {
    const { id } = request.params;
    const updates = request.body;
    const db = fastify.db;

    // 检查是否存在
    const question = db.prepare('SELECT id FROM questions WHERE id = ?').get(id);
    if (!question) {
      return reply.status(404).send({
        code: 3001,
        message: '题目不存在',
      });
    }

    // 构建更新语句
    const updateParts = [];
    const params = [];

    Object.keys(updates).forEach((key) => {
      if (key === 'scoring_rules') {
        updateParts.push('scoring_rules = ?');
        params.push(JSON.stringify(updates[key]));
      } else {
        updateParts.push(`${key} = ?`);
        params.push(updates[key]);
      }
    });

    if (updateParts.length === 0) {
      return reply.status(400).send({
        code: 1001,
        message: '没有需要更新的字段',
      });
    }

    updateParts.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE questions SET ${updateParts.join(', ')} WHERE id = ?`).run(...params);

    return {
      code: 0,
      message: '更新成功',
    };
  });

  // 删除题目
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    const db = fastify.db;

    // 检查是否有邀请码关联
    const codeCount = db.prepare('SELECT COUNT(*) as count FROM invite_codes WHERE question_id = ?').get(id);
    if (codeCount.count > 0) {
      return reply.status(400).send({
        code: 1001,
        message: '该题目下存在邀请码，无法删除',
      });
    }

    const result = db.prepare('DELETE FROM questions WHERE id = ?').run(id);

    if (result.changes === 0) {
      return reply.status(404).send({
        code: 3001,
        message: '题目不存在',
      });
    }

    return {
      code: 0,
      message: '删除成功',
    };
  });
}
