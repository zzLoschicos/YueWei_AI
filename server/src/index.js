/**
 * 阅微 AI 诊断系统 · 服务入口
 * YueWei AI Diagnostic System — Server Entry Point
 */
import { config } from 'dotenv';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 加载环境变量
config();

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保数据目录存在（提前创建，供 SQLite 插件使用）
const dataDir = join(__dirname, '../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('✓ 数据目录已创建:', dataDir);
}

import { buildApp } from './app.js';

const PORT = parseInt(process.env.PORT || '3002', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({ port: PORT, host: HOST });

    const hasDeepSeekKey = !!process.env.DEEPSEEK_API_KEY;

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    🏮 阅微 AI 诊断系统 · 后端服务                              ║
║                                                               ║
║    Server running at http://localhost:${PORT.toString().padEnd(20)}║
║    API Base:    http://localhost:${PORT}/api                   ║
║    Health:      http://localhost:${PORT}/health                ║
║                                                               ║
║    Environment: ${(process.env.NODE_ENV || 'development').padEnd(42)}║
║    DeepSeek:    ${hasDeepSeekKey ? '✓ Configured' : '✗ Not Set (AI 功能不可用)'.padEnd(42)}║
║                                                               ║
║    Default Admin: admin / admin123                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);

  } catch (err) {
    console.error('❌ 服务器启动失败:', err);
    process.exit(1);
  }
}

// 优雅关闭
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, () => {
    console.log(`\n🛑 收到 ${signal}，正在关闭服务器...`);
    process.exit(0);
  });
});

start();
