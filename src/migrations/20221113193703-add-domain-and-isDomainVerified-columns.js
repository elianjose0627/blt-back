'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Companies', 'domain', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Companies', 'isDomainVerified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Companies', 'domain'),
      queryInterface.removeColumn('Companies', 'isDomainVerified')
    ])
  }
}
