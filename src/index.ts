import dotenv from 'dotenv';
import { App } from './app';

// Load environment variables
dotenv.config();

// Create and start the application
const app = new App();
const port = parseInt(process.env.PORT || '3000', 10);

// Graceful shutdown
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