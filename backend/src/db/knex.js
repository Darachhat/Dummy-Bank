// backend/src/db/knex.js
// Small knex wrapper - will export null if knex cannot initialize
require('dotenv').config();
const path = require('path');

let knexInstance = null;

try {
  // Expect knexfile.js at backend/knexfile.js
  const environment = process.env.NODE_ENV || 'development';
  const knexfile = require(path.join(__dirname, '..', '..', 'knexfile'))[environment];
  const Knex = require('knex');
  knexInstance = Knex(knexfile);
  console.log('Knex initialized');
} catch (err) {
  // If knex or knexfile missing, we don't crash the whole app; controllers will handle null.
  console.warn('Knex not initialized (DB disabled or misconfigured):', err.message);
  knexInstance = null;
}

module.exports = knexInstance;