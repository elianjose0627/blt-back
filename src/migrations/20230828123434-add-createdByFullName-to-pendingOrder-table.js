'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('PendingOrders', 'createdByFullName', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('PendingOrders', 'createdByFullName')
    ])
  }
}
