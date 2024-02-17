'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Companies', 'theme', {
        type: Sequelize.JSON,
        defaultValue: null
      }),
      queryInterface.addColumn('Companies', 'logo', {
        type: Sequelize.JSON,
        defaultValue: null
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Companies', 'theme'),
      queryInterface.removeColumn('Companies', 'logo')
    ])
  }
}
