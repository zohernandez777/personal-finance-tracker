
/*Pool - creates a pool of database connections (more efficient than one-at-a-time)
process.env.DB_USER - reads from your .env file
module.exports = pool - makes this available to other files*/ 

const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = pool;