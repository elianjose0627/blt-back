'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('ProductSizes', 'type', {
        allowNull: true,
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('ProductSizes', 'sortIndex', {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('ProductSizes', 'type'),
      queryInterface.removeColumn('ProductSizes', 'sortIndex')
    ])
  }
}
