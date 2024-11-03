'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Campaigns', 'includeStartDate', {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Campaigns', 'includeStartDate')
    ])
  }
}
