'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('BundleItems', 'description', {
        type: Sequelize.TEXT,
        allowNull: true
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('BundleItems', 'description')
    ])
  }
}
