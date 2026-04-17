/**
 * 阅微 AI 诊断系统 · Fastify 应用配置
 * YueWei AI Diagnostic System — Fastify Application
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { config } from 'dotenv';

// 加载环境变量
config();

// 创建 Fastify 实例
const fastify = Fastify({
  logger: {
    level: 'info',
  },
});

// 注册插件
async function registerPlugins() {
  // CORS - 跨域资源共享
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // Helmet - 安全头
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // JWT - JSON Web Token
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'yuewei-ai-secret-key-change-in-production',
  });

  // SQLite 数据库
  await fastify.register(import('./plugins/sqlite.js'));

  // 检查 DeepSeek API Key
  if (!process.env.DEEPSEEK_API_KEY) {
    fastify.log.warn('⚠️  DEEPSEEK_API_KEY 未设置，AI 诊断功能将不可用');
  }
}

// 导入路由
async function registerRoutes() {
  // 认证路由（公开）
  fastify.register(import('./routes/auth.js'), { prefix: '/api/auth' });

  // 学生端路由（公开）
  fastify.register(import('./routes/diagnosis.js'), { prefix: '/api/diagnosis' });
  fastify.register(import('./routes/reports.js'), { prefix: '/api/reports' });

  // 教师端路由（需认证）
  fastify.register(import('./routes/codes.js'), { prefix: '/api/codes' });
  fastify.register(import('./routes/questions.js'), { prefix: '/api/questions' });
  fastify.register(import('./routes/stats.js'), { prefix: '/api/stats' });
  fastify.register(import('./routes/methodology.js'), { prefix: '/api/methodology' });

  // 健康检查
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
}

// 全局错误处理
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  // 输入验证错误
  if (error.validation) {
    return reply.status(400).send({
      code: 1001,
      message: '参数错误',
      errors: error.validation,
    });
  }

  // JWT 错误
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
    return reply.status(401).send({
      code: 2001,
      message: '未登录',
    });
  }

  // 通用错误
  const statusCode = error.statusCode || 500;
  return reply.status(statusCode).send({
    code: statusCode === 500 ? 5001 : statusCode,
    message: error.message || '服务器内部错误',
  });
});

// 启动函数
export async function buildApp() {
  await registerPlugins();
  await registerRoutes();
  return fastify;
}

export default fastify;
