'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Recipients', 'costCenter', {
        type: Sequelize.STRING,
        defaultValue: null
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Recipients', 'costCenter')
    ])
  }
}
