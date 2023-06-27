'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Campaigns', 'quota', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }),
      queryInterface.addColumn('Campaigns', 'correctionQuota', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Campaigns', 'quota'),
      queryInterface.removeColumn('Campaigns', 'correctionQuota')
    ])
  }
}
