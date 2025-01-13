'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.addColumn('ProductCategories', 'isHidden', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.removeColumn('ProductCategories', 'isHidden')
    ])
  }
}
