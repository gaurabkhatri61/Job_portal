require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'p@ssword',
    database: "jobportal07",
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: console.log  // Add logging to debug connection issues
  },
  // ... rest of the configurations
}; 