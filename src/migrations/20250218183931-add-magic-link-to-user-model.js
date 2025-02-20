'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.addColumn('Users', 'magicLink', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          createdAt: null,
          value: null,
          usedAt: null
        }
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.removeColumn('Users', 'magicLink')
    ])
  }
}
