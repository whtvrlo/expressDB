const { Sequelize } = require("sequelize");

// const connection = new Sequelize(process.env.DB_URI);

const connection = new Sequelize({
    dialect: 'sqlite',
    storage: 'data.db'
  });

  
module.exports = connection;