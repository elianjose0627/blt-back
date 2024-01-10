'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Campaigns', 'isActive', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }),
      queryInterface.addColumn('Campaigns', 'isHidden', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Campaigns', 'isActive'),
      queryInterface.removeColumn('Campaigns', 'isHidden')
    ])
  }
}
