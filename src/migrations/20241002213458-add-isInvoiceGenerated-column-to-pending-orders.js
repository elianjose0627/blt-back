'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('PendingOrders', 'isInvoiceGenerated', {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('PendingOrders', 'isInvoiceGenerated')
    ])
  }
}
