'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Bundles', 'jfsku', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn('Bundles', 'merchantSku', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Bundles', 'jfsku', {
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.changeColumn('Bundles', 'merchantSku', {
        type: Sequelize.STRING,
        allowNull: false
      })
    ])
  }
}
