'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Orders', 'isVisible', {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Orders', 'isVisible')
    ])
  }
}
