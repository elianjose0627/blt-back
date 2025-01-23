'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.addColumn('Users', 'title', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Addresses', 'title', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Recipients', 'title', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    Promise.all([
      queryInterface.removeColumn('Users', 'title'),
      queryInterface.removeColumn('Addresses', 'title'),
      queryInterface.removeColumn('Recipients', 'title')
    ])
  }
}
