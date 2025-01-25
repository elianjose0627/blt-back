'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('PendingOrders', 'jtlId', {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
      queryInterface.addColumn('PendingOrders', 'jtlNumber', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('PendingOrders', 'jtlId'),
      queryInterface.removeColumn('PendingOrders', 'jtlNumber')
    ])
  }
}
