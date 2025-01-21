'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('PendingOrders', 'isPackingSlipGenerated', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }),
      queryInterface.removeColumn('Orders', 'isPackingSlipGenerated')
    ])
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('PendingOrders', 'isPackingSlipGenerated'),
      queryInterface.addColumn('Orders', 'isPackingSlipGenerated', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      })
    ])
  }
}
