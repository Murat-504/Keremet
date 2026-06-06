require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/auth');
const flightRoutes   = require('./routes/flights');
const bookingRoutes  = require('./routes/bookings');
const userRoutes     = require('./routes/users');
const airportRoutes  = require('./routes/airports');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Маршруты ───────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/flights',  flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/airports', airportRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK', version: '1.0.0' }));

// ── Обработка ошибок ───────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`✈  Keremet Airlines API запущен на http://localhost:${PORT}`);
});
