// backend/knexfile.js
// Knex configuration - reads from backend/.env
require('dotenv').config();

const common = {
  client: process.env.DB_CLIENT || 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dummy_bank'
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: './migrations'
  }
};

module.exports = {
  development: common,
  production: common
};