'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Campaigns', 'isExceedStockEnabled', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Campaigns', 'isExceedStockEnabled')
    ])
  }
}
