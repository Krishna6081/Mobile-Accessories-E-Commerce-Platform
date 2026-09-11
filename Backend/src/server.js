require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully via Prisma ORM.');

    app.listen(PORT, () => {
      logger.info(`🚀 Mobile Accessories Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      logger.info(`📖 API Documentation available at http://localhost:${PORT}/api/v1/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
