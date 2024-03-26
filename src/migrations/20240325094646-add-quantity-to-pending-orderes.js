'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('PendingOrders', 'quantity', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('PendingOrders', 'quantity')
    ])
  }
}
