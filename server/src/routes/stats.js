/**
 * 统计路由
 * GET /api/stats/dashboard - 获取看板统计数据
 */

export default async function statsRoutes(fastify, options) {
  // 添加认证中间件
  fastify.addHook('preHandler', fastify.authenticate);

  // 获取看板统计数据
  fastify.get('/dashboard', async (request, reply) => {
    const db = fastify.db;

    // 总邀请码数量
    const totalCodes = db.prepare('SELECT COUNT(*) as count FROM invite_codes').get();

    // 已激活（使用次数 > 0）
    const activeCodes = db.prepare(`
      SELECT COUNT(*) as count FROM invite_codes
      WHERE used_count > 0
    `).get();

    // 已耗尽（使用次数达到上限）
    const exhaustedCodes = db.prepare(`
      SELECT COUNT(*) as count FROM invite_codes
      WHERE used_count >= max_uses
    `).get();

    // 即将耗尽（剩余次数 ≤ 2）
    const soonExhausted = db.prepare(`
      SELECT COUNT(*) as count FROM invite_codes
      WHERE used_count < max_uses AND (max_uses - used_count) <= 2 AND used_count > 0
    `).get();

    // 累计诊断次数（报告总数）
    const totalDiagnoses = db.prepare('SELECT COUNT(*) as count FROM reports').get();

    // 近7日提交趋势
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayStart = dateStr + ' 00:00:00';
      const dayEnd = dateStr + ' 23:59:59';

      const count = db.prepare(`
        SELECT COUNT(*) as count FROM reports
        WHERE created_at >= ? AND created_at <= ?
      `).get(dayStart, dayEnd);

      last7Days.push({
        date: dateStr,
        label: i === 0 ? '今天' : `${date.getMonth() + 1}/${date.getDate()}`,
        count: count.count
      });
    }

    // 得分分布
    const allScores = db.prepare(`
      SELECT score FROM reports WHERE score IS NOT NULL
    `).all();

    let excellent = 0, good = 0, pass = 0, fail = 0;
    allScores.forEach(r => {
      if (r.score >= 8) excellent++;
      else if (r.score >= 6) good++;
      else if (r.score >= 4) pass++;
      else fail++;
    });

    // 高频错误类型（从报告中提取）
    const recentReports = db.prepare(`
      SELECT details, suggestions FROM reports
      WHERE details IS NOT NULL AND details != '[]'
      ORDER BY created_at DESC
      LIMIT 100
    `).all();

    // 简单统计：计算批注中出现的高频词
    const errorTypes = {
      '答题口语化': 0,
      '术语缺失': 0,
      '情感分析浅层': 0,
      '手法误判': 0,
      '结构分析缺失': 0,
    };

    recentReports.forEach(r => {
      const details = r.details ? JSON.parse(r.details) : [];
      const commentStr = details.map(d => d.comment || '').join(' ').toLowerCase();

      if (commentStr.includes('口语') || commentStr.includes('大白话')) errorTypes['答题口语化']++;
      if (commentStr.includes('术语') || commentStr.includes('专业')) errorTypes['术语缺失']++;
      if (commentStr.includes('情感') || commentStr.includes('感情')) errorTypes['情感分析浅层']++;
      if (commentStr.includes('手法') || commentStr.includes('修辞')) errorTypes['手法误判']++;
      if (commentStr.includes('结构')) errorTypes['结构分析缺失']++;
    });

    // 取 TOP 4 错误类型
    const topErrors = Object.entries(errorTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([type, count]) => ({ type, count }));

    // 今日提交数
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = db.prepare(`
      SELECT COUNT(*) as count FROM reports
      WHERE created_at >= ? AND created_at <= ?
    `).get(today + ' 00:00:00', today + ' 23:59:59');

    return {
      code: 0,
      message: 'success',
      data: {
        totalCodes: totalCodes.count,
        activeCodes: activeCodes.count,
        exhaustedCodes: exhaustedCodes.count,
        soonExhausted: soonExhausted.count,
        totalDiagnoses: totalDiagnoses.count,
        todayDiagnoses: todayCount.count,
        trend: last7Days,
        scoreDistribution: {
          excellent,
          good,
          pass,
          fail,
          total: allScores.length
        },
        topErrors,
      },
    };
  });
}
