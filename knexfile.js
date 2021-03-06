require('dotenv').config();

module.exports = {
    development: {
      client: 'sqlite3',
      useNullAsDefault: true,
      connection: {filename:'./database/db.sqlite3'},
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
      connection: process.env.DO_POSTGRESQL_URL_SSL,
      //connection: process.env.HEROKU_POSTGRESQL_RED_URL_SSL,
      migrations: {
        directory: './database/migrations',
      },
      seeds: { 
        directory: './database/seeds' 
      },
      
    },
  };
  
