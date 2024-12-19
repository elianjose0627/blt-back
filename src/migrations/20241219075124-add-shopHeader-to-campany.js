'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.addColumn('Companies', 'shopHeader', {
        type: Sequelize.JSON,
        allowNull: true
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.removeColumn('Companies', 'shopHeader')
    ])
  }
}
