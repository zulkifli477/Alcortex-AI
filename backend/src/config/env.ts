
import 'dotenv/config';

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alcortex_db',
  },
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development'
};
