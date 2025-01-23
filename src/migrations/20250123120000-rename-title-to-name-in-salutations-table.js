'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Salutations', 'title', 'name')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Salutations', 'name', 'title')
  }
}
