'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Orders', 'createdAtByUser', {
        type: Sequelize.DATE,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Orders', 'createdAtByUser')
    ])
  }
}
