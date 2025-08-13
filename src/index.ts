import "reflect-metadata";
import dotenv from 'dotenv';

import { App } from './app';
const nodeEnv = process.env.NODE_ENV || 'development';
const envFilePath = `.env.${nodeEnv}`;
dotenv.config({ path: envFilePath });
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

// Start the server
app.start(port).catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});