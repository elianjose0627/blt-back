'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Campaigns', 'usedQuota', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }),
      queryInterface.addColumn('Campaigns', 'lastQuotaResetDate', {
        type: Sequelize.DATE,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Campaigns', 'usedQuota'),
      queryInterface.removeColumn('Campaigns', 'lastQuotaResetDate')
    ])
  }
}
