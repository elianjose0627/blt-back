'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('PendingOrders', 'billingAddressRequests', {
        allowNull: true,
        type: Sequelize.JSON
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('PendingOrders', 'billingAddressRequests')
    ])
  }
}
