'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Bundles', 'description', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Bundles', 'price', {
        type: Sequelize.FLOAT,
        defaultValue: 0
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Bundles', 'description'),
      queryInterface.removeColumn('Bundles', 'price')
    ])
  }
}
