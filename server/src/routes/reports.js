/**
 * 报告路由
 * GET /api/reports - 获取报告列表
 * GET /api/reports/:id - 获取报告详情
 */

// 列表查询 schema
const listQuerySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      student_name: { type: 'string' },
      code: { type: 'string' },
    },
  },
};

export default async function reportsRoutes(fastify, options) {
  // 获取报告列表
  fastify.get('/', { schema: listQuerySchema }, async (request, reply) => {
    const { page = 1, limit = 10, student_name, code } = request.query;
    const offset = (page - 1) * limit;
    const db = fastify.db;

    let whereClause = '1=1';
    const params = [];

    if (student_name) {
      whereClause += ' AND r.student_name LIKE ?';
      params.push(`%${student_name}%`);
    }

    if (code) {
      whereClause += ' AND ic.code = ?';
      params.push(code);
    }

    // 查询总数
    const countResult = db.prepare(`
      SELECT COUNT(*) as total
      FROM reports r
      LEFT JOIN invite_codes ic ON r.student_name = ic.code
      WHERE ${whereClause}
    `).get(...params);

    // 查询列表
    const list = db.prepare(`
      SELECT
        r.id,
        r.student_name,
        r.student_info,
        r.score,
        r.status,
        r.created_at,
        q.title as question_title
      FROM reports r
      LEFT JOIN questions q ON r.question_id = q.id
      WHERE ${whereClause}
      ORDER BY r.created_at DESC
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

  // 获取报告详情
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const db = fastify.db;

    const report = db.prepare(`
      SELECT
        r.*,
        q.title as question_title,
        q.content as question_content,
        q.scoring_rules
      FROM reports r
      LEFT JOIN questions q ON r.question_id = q.id
      WHERE r.id = ?
    `).get(id);

    if (!report) {
      return reply.status(404).send({
        code: 3001,
        message: '报告不存在',
      });
    }

    // 解析 JSON 字段
    const details = report.details ? JSON.parse(report.details) : [];
    const suggestions = report.suggestions ? JSON.parse(report.suggestions) : [];

    return {
      code: 0,
      message: 'success',
      data: {
        id: report.id,
        student_name: report.student_name,
        student_info: report.student_info,
        question_title: report.question_title,
        question_content: report.question_content,
        answer: report.answer,
        score: report.score,
        overall_comment: report.overall_comment,
        details,
        suggestions,
        scoring_rules: report.scoring_rules ? JSON.parse(report.scoring_rules) : [],
        status: report.status,
        created_at: report.created_at,
      },
    };
  });

  // 学生端：按邀请码查询自己的报告
  fastify.get('/my/:code', async (request, reply) => {
    const { code } = request.params;
    const db = fastify.db;

    const reports = db.prepare(`
      SELECT
        r.id,
        r.student_name,
        r.score,
        r.status,
        r.created_at,
        q.title as question_title
      FROM reports r
      LEFT JOIN questions q ON r.question_id = q.id
      WHERE r.student_name = ?
      ORDER BY r.created_at DESC
    `).all(code);

    return {
      code: 0,
      message: 'success',
      data: reports,
    };
  });
}
