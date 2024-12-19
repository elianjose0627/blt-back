'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'isPackingSlipGenerated', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Orders', 'isPackingSlipGenerated')
    ])
  }
}
