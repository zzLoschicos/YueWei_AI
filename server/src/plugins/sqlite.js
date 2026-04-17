/**
 * SQLite 数据库插件
 * 为 Fastify 实例添加数据库连接
 */
import fp from 'fastify-plugin';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sqlitePlugin(fastify, options) {
  const DB_PATH = process.env.DB_PATH || join(__dirname, '../../data/yuewei.db');

  // 确保目录存在
  const dbDir = join(__dirname, '../../data');
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  // 创建数据库连接
  const db = new Database(DB_PATH);

  // 配置
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  fastify.log.info(`数据库连接: ${DB_PATH}`);

  // 初始化表结构
  const schemaPath = join(__dirname, '../db/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  fastify.log.info('数据库表结构初始化完成');

  // 检查并插入初始数据
  const teacherCount = db.prepare('SELECT COUNT(*) as count FROM teachers').get();
  if (teacherCount.count === 0) {
    const seedPath = join(__dirname, '../db/seed.sql');
    const seed = readFileSync(seedPath, 'utf-8');
    db.exec(seed);
    fastify.log.info('初始数据插入完成');

    // 设置默认管理员密码
    const bcrypt = await import('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('UPDATE teachers SET password = ? WHERE username = ?').run(hashedPassword, 'admin');
    fastify.log.info('默认管理员: admin / admin123');
  }

  // 将数据库实例添加到 fastify 实例
  fastify.decorate('db', db);

  // 添加 authenticate 装饰器
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({
        code: 2001,
        message: '未登录或登录已过期',
      });
    }
  });

  // 关闭时清理
  fastify.addHook('onClose', async () => {
    db.close();
  });
}

export default fp(sqlitePlugin, {
  name: 'sqlite',
});
