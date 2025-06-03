"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
// Load environment variables
dotenv_1.default.config();
// Create and start the application
const app = new app_1.App();
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
