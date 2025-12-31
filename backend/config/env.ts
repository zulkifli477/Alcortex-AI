// Simple environment configuration helper
export const config = {
  apiKey: process.env.API_KEY || "",
  port: 5000,
  isProduction: process.env.NODE_ENV === 'production'
};
