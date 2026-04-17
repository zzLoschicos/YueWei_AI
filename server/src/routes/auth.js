/**
 * 认证路由
 * POST /api/auth/login - 教师登录
 */
import bcrypt from 'bcryptjs';

const loginSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', minLength: 1 },
      password: { type: 'string', minLength: 1 },
    },
  },
};

export default async function authRoutes(fastify, options) {
  // 教师登录
  fastify.post('/login', { schema: loginSchema }, async (request, reply) => {
    const { username, password } = request.body;
    const db = request.server.db;

    // 查找用户
    const teacher = db.prepare('SELECT * FROM teachers WHERE username = ?').get(username);

    if (!teacher) {
      return reply.status(401).send({
        code: 2001,
        message: '用户名或密码错误',
      });
    }

    // 验证密码
    const valid = bcrypt.compareSync(password, teacher.password);
    if (!valid) {
      return reply.status(401).send({
        code: 2001,
        message: '用户名或密码错误',
      });
    }

    // 生成 JWT
    const token = fastify.jwt.sign({
      id: teacher.id,
      username: teacher.username,
      name: teacher.name,
      role: teacher.role,
    });

    return {
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: teacher.id,
          name: teacher.name,
          username: teacher.username,
          role: teacher.role,
        },
      },
    };
  });

  // 获取当前用户信息（需认证）
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    return {
      code: 0,
      message: 'success',
      data: request.user,
    };
  });
}
