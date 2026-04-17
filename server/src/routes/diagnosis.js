/**
 * 诊断路由
 * POST /api/diagnosis - 提交诊断
 */
import { nanoid } from 'nanoid';

// 提交诊断 schema
const submitDiagnosisSchema = {
  body: {
    type: 'object',
    required: ['name', 'code', 'question_id', 'answer'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 50 },
      code: { type: 'string', minLength: 1, maxLength: 20 },
      question_id: { type: 'integer' },
      answer: { type: 'string', minLength: 1, maxLength: 10000 },
      info: { type: 'string', maxLength: 50 }, // 辅助标识（可选）
    },
  },
};

export default async function diagnosisRoutes(fastify, options) {
  // 提交诊断
  fastify.post('/', { schema: submitDiagnosisSchema }, async (request, reply) => {
    const { name, code, question_id, answer, info } = request.body;
    const db = request.server.db;

    // 验证邀请码
    const inviteCode = db.prepare(`
      SELECT ic.*, q.title as question_title, q.content as question_content
      FROM invite_codes ic
      JOIN questions q ON ic.question_id = q.id
      WHERE ic.code = ? AND ic.status = 'active'
    `).get(code);

    if (!inviteCode) {
      return reply.status(400).send({
        code: 3002,
        message: '邀请码无效或已过期',
      });
    }

    // 检查使用次数
    if (inviteCode.used_count >= inviteCode.max_uses) {
      return reply.status(400).send({
        code: 3003,
        message: '邀请码已达使用次数上限',
      });
    }

    // 检查题目是否匹配
    if (inviteCode.question_id !== question_id) {
      return reply.status(400).send({
        code: 1001,
        message: '题目与邀请码不匹配',
      });
    }

    // 创建诊断任务
    const task_id = `task_${nanoid(12)}`;

    // 插入报告记录
    const stmt = db.prepare(`
      INSERT INTO reports (student_name, student_info, question_id, answer, task_id, status)
      VALUES (?, ?, ?, ?, ?, 'processing')
    `);

    const result = stmt.run(name, info || '', question_id, answer, task_id);
    const report_id = result.lastInsertRowid;

    // 增加邀请码使用次数
    db.prepare('UPDATE invite_codes SET used_count = used_count + 1 WHERE id = ?').run(inviteCode.id);

    // 异步调用 AI 诊断（不阻塞响应）
    processDiagnosisAsync(fastify, report_id, task_id, answer, inviteCode.question_content, inviteCode.question_title);

    return {
      code: 0,
      message: '提交成功',
      data: {
        task_id,
        report_id,
        status: 'processing',
        estimated_time: 180, // 预计 3 分钟
      },
    };
  });

  // 查询诊断状态
  fastify.get('/status/:task_id', async (request, reply) => {
    const { task_id } = request.params;
    const db = request.server.db;

    const report = db.prepare('SELECT id, status, score FROM reports WHERE task_id = ?').get(task_id);

    if (!report) {
      return reply.status(404).send({
        code: 3001,
        message: '任务不存在',
      });
    }

    return {
      code: 0,
      message: 'success',
      data: {
        task_id,
        status: report.status,
        report_id: report.id,
        score: report.score,
      },
    };
  });
}

// 异步处理 AI 诊断
async function processDiagnosisAsync(fastify, report_id, task_id, answer, question_content, question_title) {
  try {
    const db = fastify.db;

    // 调用 DeepSeek API
    const diagnosisResult = await callDeepSeek(fastify, answer, question_content, question_title);

    // 更新报告
    const updateStmt = db.prepare(`
      UPDATE reports
      SET status = 'completed',
          score = ?,
          overall_comment = ?,
          details = ?,
          suggestions = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      diagnosisResult.score,
      diagnosisResult.comment,
      JSON.stringify(diagnosisResult.details),
      JSON.stringify(diagnosisResult.suggestions),
      report_id
    );

    fastify.log.info(`诊断完成: task_id=${task_id}, score=${diagnosisResult.score}`);

  } catch (error) {
    fastify.log.error(`诊断失败: task_id=${task_id}`, error);

    // 更新为失败状态
    db.prepare(`
      UPDATE reports
      SET status = 'failed',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(report_id);
  }
}

// 调用 DeepSeek API
async function callDeepSeek(fastify, answer, question_content, question_title) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('DeepSeek API Key 未配置');
  }

  const prompt = `
你是高中语文阅卷教师。请根据以下题目和学生作答，进行评分和批注。

【题目】
${question_content}

【学生作答】
${answer}

请按照以下格式返回评分结果（仅返回 JSON，不要其他内容）：
{
  "score": 85,
  "comment": "整体评价...",
  "details": [
    {"sentence": "关键句", "comment": "批注", "score": 15}
  ],
  "suggestions": ["建议1", "建议2"]
}
`.trim();

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位专业的高中语文教师，擅长诗歌鉴赏和现代文阅读批改。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API 错误: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('DeepSeek API 返回内容为空');
  }

  // 解析 JSON 响应
  try {
    // 尝试提取 JSON（可能包含在 markdown 代码块中）
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1] || content;
    return JSON.parse(jsonStr.trim());
  } catch (parseError) {
    fastify.log.warn('JSON 解析失败，使用默认评分:', content);
    return {
      score: 60,
      comment: '系统评分',
      details: [],
      suggestions: ['请联系教师获取详细反馈'],
    };
  }
}
