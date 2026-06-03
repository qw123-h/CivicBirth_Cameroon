import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('1h'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  FRONTEND_URL: z.string().url(),
  SUPABASE_URL: z.string().url().default('https://example.supabase.co'),
  SUPABASE_SERVICE_KEY: z.string().default('local-development-supabase-service-key'),
  SUPABASE_STORAGE_BUCKET: z.string().default('certificates'),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  CERTIFICATE_VERIFY_BASE_URL: z.string().url().default('http://localhost:5173/verify'),
});

type Environment = z.infer<typeof envSchema>;

function validateEnv(): Environment {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY,
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY,
    LOG_LEVEL: process.env.LOG_LEVEL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
    APP_BASE_URL: process.env.APP_BASE_URL,
    CERTIFICATE_VERIFY_BASE_URL: process.env.CERTIFICATE_VERIFY_BASE_URL,
  };

  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten());
    process.exit(1);
  }

  return parsed.data;
}

export const config = validateEnv();
