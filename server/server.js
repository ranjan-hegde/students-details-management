const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import route modules
const studentRoutes = require('./routes/studentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const schoolSettingRoutes = require('./routes/schoolSettingRoutes');

// Import error handler middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Static Files
// ---------------------------------------------------------------------------
// Serve uploaded files as static assets BEFORE helmet adds security headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(helmet({
  crossOriginResourcePolicy: false,
  xFrameOptions: false,
  contentSecurityPolicy: false,
}));

// Enable CORS for all origins (configure as needed for production)
app.use(cors());

// HTTP request logger (use 'dev' format for concise colored output)
app.use(morgan('dev'));

// Parse incoming JSON payloads
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

app.use('/api/students', studentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', schoolSettingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'School Management API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Global Error Handler (must be after all routes)
// ---------------------------------------------------------------------------

app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
});
