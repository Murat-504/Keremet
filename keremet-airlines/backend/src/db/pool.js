const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'keremet_airlines',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

pool.on('connect', () => console.log('✓ Подключено к PostgreSQL'));
pool.on('error',   (err) => console.error('PostgreSQL ошибка:', err));

module.exports = pool;
