'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.addColumn('ProductCategories', 'companyId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Companies',
          key: 'id'
        }
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.removeColumn('ProductCategories', 'companyId')
    ])
  }
}
