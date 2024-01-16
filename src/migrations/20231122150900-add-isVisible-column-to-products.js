'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Products', 'isVisible', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Products', 'isVisible')
    ])
  }
}
