'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Campaigns', 'isBulkCreateEnabled', {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Campaigns', 'isBulkCreateEnabled')
    ])
  }
}
