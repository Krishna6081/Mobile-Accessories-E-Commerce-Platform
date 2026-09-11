const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { apiLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');
const ApiResponse = require('./utils/response');

const app = express();

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body Parsing & Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate Limiting
app.use('/api', apiLimiter);

// Static Uploads Serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger API Documentation Route
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API v1 Routes
app.use('/api/v1', routes);

// Base Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Mobile Accessories E-Commerce API is operational' });
});

// 404 Route Handler
app.use((req, res) => {
  return ApiResponse.error(res, `Route ${req.originalUrl} not found`, 404);
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
