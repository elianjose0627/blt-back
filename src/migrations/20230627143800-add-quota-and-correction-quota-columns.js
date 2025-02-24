'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Campaigns', 'correctionQuota', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Campaigns', 'correctionQuota')
    ])
  }
}
