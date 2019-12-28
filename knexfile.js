require('dotenv').config();

module.exports = {
    development: {
      client: 'pg',
      useNullAsDefault: true,
      connection: 'postgres://localhost/yourLinks',
      // pool: {
      //   afterCreate: (conn, done) => {
      //     conn.run('PRAGMA foreign_keys = ON', done);
      //   },
      // },
      migrations: {
        directory: './database/migrations',
      },
      seeds: {
        directory: './database/seeds',
      },
    },
    testing: {
      client: 'pg',
      useNullAsDefault: true,
      connection: 'postgres://localhost/yourLinksTest',
      migrations: {
        directory: './database/migrations',
      },
      seeds: {
        directory: './database/seeds',
      },
    },
    production: {
      client: 'pg',
      useNullAsDefault: true,
      connection: process.env.DATABASE_URL,
      migrations: {
        directory: './database/migrations',
      },
      seeds: { 
        directory: './database/seeds' 
      },
      
    },
  };
  