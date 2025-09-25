import "reflect-metadata";
import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFilePath = `.env.${nodeEnv}`;

// Try to load .env.<NODE_ENV> first, then fallback to .env
const result = dotenv.config({ path: envFilePath });
if (result.error) {
  dotenv.config(); // fallback to .env
}

import { App } from './app';
const app = new App();
const port = parseInt(process.env.PORT || '3000', 10);

console.log('DATABASE_URL:', process.env.DATABASE_URL);

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.start(port).catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});