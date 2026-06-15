import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  API_ID: z.string().optional(),
  API_HASH: z.string().optional(),
  DISCORD_WEBHOOK_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_GROUP_ID: z.string().optional(),
  CHECK_INTERVAL_SECONDS: z.string().default('30').transform(Number),
  MIN_TIME_BETWEEN_MESSAGES: z.string().default('30').transform(Number),
  URGENT_ENABLED: z.string().default('true').transform((v) => v === 'true'),
  DATABASE_PATH: z.string().default('./data/promo-monitor.db'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Erro nas variáveis de ambiente:');
  parsed.error.errors.forEach((err) => {
    console.error(`  - ${err.path.join('.')}: ${err.message}`);
  });
  process.exit(1);
}

export const config = parsed.data;
